import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import { getFirebaseAdminFirestore, getFirebaseAdminStorage, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export type ActivityLevel = "sedentary" | "active" | "highly active";
export type RiskBand = "Low" | "Moderate" | "High" | "Critical";

export type ExportFilters = {
  patientId?: number;
  activityLevel?: ActivityLevel;
  riskBand?: RiskBand;
  minStress?: number;
  maxStress?: number;
  minSteps?: number;
  maxSteps?: number;
  startDate?: string;
  endDate?: string;
};

export type HealthRecord = {
  patientId: number;
  heartRate: number;
  bloodOxygen: number;
  stepCount: number;
  sleepDuration: number;
  activityLevel: ActivityLevel;
  stressLevel: number;
  recordedAt: string | null;
  recordedAtLabel: string | null;
  riskScore: number;
  riskBand: RiskBand;
};

export type SummaryCard = {
  title: string;
  value: string;
  unit: string;
  context: string;
};

export type ActivityGroupSummary = {
  activityLevel: ActivityLevel;
  patients: number;
  avgHeartRate: number;
  avgBloodOxygen: number;
  avgStepCount: number;
  avgSleepDuration: number;
  avgStressLevel: number;
  wellnessScore: number;
};

export type StressDistribution = {
  band: RiskBand;
  patients: number;
};

export type PatientRiskTrend = {
  patient: string;
  heartRate: number;
  stressLevel: number;
  sleepDuration: number;
  riskScore: number;
};

export type AnomalyAlert = {
  id: string;
  label: string;
  value: number;
  unit: string;
  detail: string;
  severity: "medium" | "high" | "critical";
};

export type ReportCard = {
  title: string;
  detail: string;
  stat: string;
};

export type DatasetOverview = {
  totalPatients: number;
  averageHeartRate: number;
  averageBloodOxygen: number;
  averageStepCount: number;
  averageSleepDuration: number;
  averageStressLevel: number;
  wellnessScore: number;
  summaryCards: SummaryCard[];
  activityGroups: ActivityGroupSummary[];
  stressDistribution: StressDistribution[];
  patientRiskTrend: PatientRiskTrend[];
  anomalyAlerts: AnomalyAlert[];
  reports: ReportCard[];
};

export type FilterMetadata = {
  activities: ActivityLevel[];
  riskBands: RiskBand[];
  patientIdMin: number | null;
  patientIdMax: number | null;
  hasDateRange: boolean;
  minDate: string | null;
  maxDate: string | null;
  dataSource: "local" | "firebase";
  firebaseConfigured: boolean;
};

export type DatasetContext = {
  overview: DatasetOverview;
  records: HealthRecord[];
  metadata: FilterMetadata;
};

export type FirebaseSyncResult = {
  source: "local" | "firebase";
  uploadedRecords: number;
  collection: string;
  storagePath: string | null;
  metadataPath: string;
};

const DATASET_PATH = path.join(process.cwd(), "public", "data", "smartwatch-health-cleaned.csv");
const ACTIVITY_ORDER: ActivityLevel[] = ["sedentary", "active", "highly active"];
const RISK_BANDS: RiskBand[] = ["Low", "Moderate", "High", "Critical"];
const DATE_KEYS = ["recorded at", "timestamp", "date", "datetime", "recorded_at", "recordedat"];
const HEALTH_COLLECTION = process.env.FIREBASE_HEALTH_COLLECTION || "healthRecords";
const HEALTH_METADATA_DOC = process.env.FIREBASE_HEALTH_METADATA_DOC || "datasetMetadata/current";
const HEALTH_STORAGE_PATH = process.env.FIREBASE_HEALTH_STORAGE_PATH || "datasets/smartwatch-health-cleaned.csv";

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      const next = line[index + 1];
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function parseNumber(value: string | number | undefined | null) {
  if (value === undefined || value === null || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDateValue(value: string | undefined | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

function toRiskBand(score: number): RiskBand {
  if (score >= 75) return "Critical";
  if (score >= 55) return "High";
  if (score >= 35) return "Moderate";
  return "Low";
}

function computeRiskScore(record: Omit<HealthRecord, "riskScore" | "riskBand">) {
  const heartRateRisk = Math.min(100, Math.abs(record.heartRate - 72) * 2);
  const oxygenRisk = Math.min(100, Math.max(0, (97 - record.bloodOxygen) * 20));
  const sleepRisk = Math.min(100, Math.max(0, (7 - record.sleepDuration) * 18));
  const stepRisk = Math.min(100, Math.max(0, (5000 - record.stepCount) / 60));
  const stressRisk = record.stressLevel * 10;

  return round(
    heartRateRisk * 0.22 + oxygenRisk * 0.18 + sleepRisk * 0.2 + stepRisk * 0.12 + stressRisk * 0.28,
    1,
  );
}

function formatPercent(part: number, total: number) {
  if (total === 0) return "0%";
  return `${round((part / total) * 100, 1)}%`;
}

function formatDateLabel(value: string | null) {
  if (!value) return null;
  return value.slice(0, 10);
}

function findHeaderIndex(headerMap: Map<string, number>, options: string[]) {
  for (const option of options) {
    const index = headerMap.get(option);
    if (index !== undefined) {
      return index;
    }
  }
  return -1;
}

function parseFilters(input?: URLSearchParams | Record<string, string | string[] | undefined>): ExportFilters {
  const get = (key: string) => {
    if (!input) return undefined;
    if (input instanceof URLSearchParams) return input.get(key) ?? undefined;
    const value = input[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const patientId = get("patientId");
  const activityLevel = get("activityLevel");
  const riskBand = get("riskBand");
  const minStress = get("minStress");
  const maxStress = get("maxStress");
  const minSteps = get("minSteps");
  const maxSteps = get("maxSteps");
  const startDate = get("startDate");
  const endDate = get("endDate");

  return {
    patientId: patientId ? Number(patientId) : undefined,
    activityLevel: activityLevel && ACTIVITY_ORDER.includes(activityLevel as ActivityLevel) ? (activityLevel as ActivityLevel) : undefined,
    riskBand: riskBand && RISK_BANDS.includes(riskBand as RiskBand) ? (riskBand as RiskBand) : undefined,
    minStress: minStress ? Number(minStress) : undefined,
    maxStress: maxStress ? Number(maxStress) : undefined,
    minSteps: minSteps ? Number(minSteps) : undefined,
    maxSteps: maxSteps ? Number(maxSteps) : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };
}

function hasActiveFilters(filters: ExportFilters) {
  return Object.values(filters).some((value) => value !== undefined && value !== "");
}

function getConfiguredDataSource() {
  if (process.env.HEALTH_DATA_SOURCE?.toLowerCase() === "firebase" && isFirebaseAdminConfigured()) {
    return "firebase" as const;
  }
  return "local" as const;
}

async function readDatasetFile() {
  return readFile(DATASET_PATH, "utf8");
}

export async function getLocalDatasetFileText() {
  return readDatasetFile();
}

function hydrateRiskFields(input: Omit<HealthRecord, "riskScore" | "riskBand"> & Partial<Pick<HealthRecord, "riskScore" | "riskBand">>) {
  const riskScore = input.riskScore ?? computeRiskScore(input);
  return {
    ...input,
    riskScore,
    riskBand: input.riskBand ?? toRiskBand(riskScore),
  } satisfies HealthRecord;
}

export const getLocalHealthRecords = cache(async (): Promise<HealthRecord[]> => {
  const file = await readDatasetFile();
  const lines = file.trim().split(/\r?\n/);
  const headerLine = lines.shift();

  if (!headerLine) {
    return [];
  }

  const headers = parseCsvLine(headerLine);
  const headerMap = new Map(headers.map((header, index) => [normalizeHeader(header), index]));

  const patientIdIndex = findHeaderIndex(headerMap, ["user id", "patient id", "userid", "patientid"]);
  const heartRateIndex = findHeaderIndex(headerMap, ["heart rate (bpm)", "heart rate", "hr"]);
  const oxygenIndex = findHeaderIndex(headerMap, ["blood oxygen level (%)", "blood oxygen", "spo2", "oxygen"]);
  const stepsIndex = findHeaderIndex(headerMap, ["step count", "steps", "stepcount"]);
  const sleepIndex = findHeaderIndex(headerMap, ["sleep duration (hours)", "sleep duration", "sleep"]);
  const activityIndex = findHeaderIndex(headerMap, ["activity level", "activity"]);
  const stressIndex = findHeaderIndex(headerMap, ["stress level", "stress"]);
  const dateIndex = findHeaderIndex(headerMap, DATE_KEYS);

  return lines
    .filter(Boolean)
    .map((line) => parseCsvLine(line))
    .map((row) => {
      const recordedAt = dateIndex >= 0 ? normalizeDateValue(row[dateIndex]) : null;
      return hydrateRiskFields({
        patientId: parseNumber(row[patientIdIndex]),
        heartRate: parseNumber(row[heartRateIndex]),
        bloodOxygen: parseNumber(row[oxygenIndex]),
        stepCount: parseNumber(row[stepsIndex]),
        sleepDuration: parseNumber(row[sleepIndex]),
        activityLevel: (row[activityIndex] as ActivityLevel) || "sedentary",
        stressLevel: parseNumber(row[stressIndex]),
        recordedAt,
        recordedAtLabel: formatDateLabel(recordedAt),
      });
    });
});

const getFirebaseHealthRecords = cache(async (): Promise<HealthRecord[]> => {
  if (!isFirebaseAdminConfigured()) {
    return [];
  }

  const firestore = getFirebaseAdminFirestore();
  const snapshot = await firestore.collection(HEALTH_COLLECTION).get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const recordedAt = normalizeDateValue(typeof data.recordedAt === "string" ? data.recordedAt : null);

    return hydrateRiskFields({
      patientId: parseNumber(data.patientId),
      heartRate: parseNumber(data.heartRate),
      bloodOxygen: parseNumber(data.bloodOxygen),
      stepCount: parseNumber(data.stepCount),
      sleepDuration: parseNumber(data.sleepDuration),
      activityLevel: ((data.activityLevel as ActivityLevel) || "sedentary"),
      stressLevel: parseNumber(data.stressLevel),
      recordedAt,
      recordedAtLabel: formatDateLabel(recordedAt),
      riskScore: parseNumber(data.riskScore),
      riskBand: data.riskBand as RiskBand,
    });
  });
});

export const getHealthRecords = cache(async (): Promise<HealthRecord[]> => {
  if (getConfiguredDataSource() === "firebase") {
    return getFirebaseHealthRecords();
  }

  return getLocalHealthRecords();
});

export function getExportFilters(input?: URLSearchParams | Record<string, string | string[] | undefined>) {
  return parseFilters(input);
}

export function filterHealthRecords(records: HealthRecord[], filters: ExportFilters) {
  return records.filter((record) => {
    if (filters.patientId !== undefined && record.patientId !== filters.patientId) return false;
    if (filters.activityLevel && record.activityLevel !== filters.activityLevel) return false;
    if (filters.riskBand && record.riskBand !== filters.riskBand) return false;
    if (filters.minStress !== undefined && record.stressLevel < filters.minStress) return false;
    if (filters.maxStress !== undefined && record.stressLevel > filters.maxStress) return false;
    if (filters.minSteps !== undefined && record.stepCount < filters.minSteps) return false;
    if (filters.maxSteps !== undefined && record.stepCount > filters.maxSteps) return false;
    if (filters.startDate && record.recordedAt && record.recordedAt < `${filters.startDate}T00:00:00.000Z`) return false;
    if (filters.startDate && !record.recordedAt) return false;
    if (filters.endDate && record.recordedAt && record.recordedAt > `${filters.endDate}T23:59:59.999Z`) return false;
    if (filters.endDate && !record.recordedAt) return false;
    return true;
  });
}

function buildFilterMetadata(records: HealthRecord[]): FilterMetadata {
  const patientIds = records.map((record) => record.patientId).filter((value) => Number.isFinite(value));
  const datedRecords = records.filter((record) => record.recordedAt);

  return {
    activities: ACTIVITY_ORDER,
    riskBands: RISK_BANDS,
    patientIdMin: patientIds.length ? Math.min(...patientIds) : null,
    patientIdMax: patientIds.length ? Math.max(...patientIds) : null,
    hasDateRange: datedRecords.length > 0,
    minDate: datedRecords.length ? datedRecords[0].recordedAtLabel : null,
    maxDate: datedRecords.length ? datedRecords[datedRecords.length - 1].recordedAtLabel : null,
    dataSource: getConfiguredDataSource(),
    firebaseConfigured: isFirebaseAdminConfigured(),
  };
}

function buildDatasetOverview(records: HealthRecord[], filters?: ExportFilters): DatasetOverview {
  const totalPatients = records.length;
  const averageHeartRate = round(average(records.map((record) => record.heartRate)));
  const averageBloodOxygen = round(average(records.map((record) => record.bloodOxygen)));
  const averageStepCount = Math.round(average(records.map((record) => record.stepCount)));
  const averageSleepDuration = round(average(records.map((record) => record.sleepDuration)));
  const averageStressLevel = round(average(records.map((record) => record.stressLevel)));
  const averageRisk = average(records.map((record) => record.riskScore));
  const wellnessScore = Math.max(0, Math.round(100 - averageRisk));
  const filterContext = hasActiveFilters(filters ?? {}) ? "Filtered subset" : `${totalPatients.toLocaleString()} smartwatch patient profiles`;

  const summaryCards: SummaryCard[] = [
    { title: "Average Heart Rate", value: averageHeartRate.toFixed(1), unit: "BPM", context: filterContext },
    { title: "Average Blood Oxygen", value: averageBloodOxygen.toFixed(1), unit: "%", context: "Cohort oxygen saturation baseline" },
    { title: "Average Step Count", value: averageStepCount.toLocaleString(), unit: "steps", context: "Per patient movement benchmark" },
    { title: "Average Sleep Duration", value: averageSleepDuration.toFixed(1), unit: "hrs", context: `Stress baseline ${averageStressLevel.toFixed(1)} / 10` },
  ];

  const activityGroups: ActivityGroupSummary[] = ACTIVITY_ORDER.map((activityLevel) => {
    const entries = records.filter((record) => record.activityLevel === activityLevel);
    const avgHeartRate = round(average(entries.map((entry) => entry.heartRate)));
    const avgBloodOxygen = round(average(entries.map((entry) => entry.bloodOxygen)));
    const avgStepCount = Math.round(average(entries.map((entry) => entry.stepCount)));
    const avgSleepDuration = round(average(entries.map((entry) => entry.sleepDuration)));
    const avgStressLevel = round(average(entries.map((entry) => entry.stressLevel)));
    const avgRiskScore = average(entries.map((entry) => entry.riskScore));

    return {
      activityLevel,
      patients: entries.length,
      avgHeartRate,
      avgBloodOxygen,
      avgStepCount,
      avgSleepDuration,
      avgStressLevel,
      wellnessScore: entries.length ? Math.max(0, Math.round(100 - avgRiskScore)) : 0,
    };
  });

  const stressDistribution: StressDistribution[] = RISK_BANDS.map((band) => ({
    band,
    patients: records.filter((record) => record.riskBand === band).length,
  }));

  const patientRiskTrend: PatientRiskTrend[] = [...records]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 12)
    .reverse()
    .map((record) => ({ patient: `P-${record.patientId}`, heartRate: round(record.heartRate, 1), stressLevel: record.stressLevel, sleepDuration: round(record.sleepDuration, 1), riskScore: record.riskScore }));

  const lowOxygenPatients = records.filter((record) => record.bloodOxygen < 95);
  const elevatedHeartRatePatients = records.filter((record) => record.heartRate >= 100);
  const lowSleepPatients = records.filter((record) => record.sleepDuration < 6);
  const highStressPatients = records.filter((record) => record.stressLevel >= 8);

  const anomalyAlerts: AnomalyAlert[] = [
    { id: "low-oxygen", label: "Low oxygen saturation", value: lowOxygenPatients.length, unit: "patients", detail: `${formatPercent(lowOxygenPatients.length, totalPatients)} of the cohort is below 95% blood oxygen.`, severity: lowOxygenPatients.length > totalPatients * 0.12 ? "critical" : "high" },
    { id: "elevated-heart-rate", label: "Elevated heart rate", value: elevatedHeartRatePatients.length, unit: "patients", detail: `${formatPercent(elevatedHeartRatePatients.length, totalPatients)} recorded heart rate at or above 100 BPM.`, severity: elevatedHeartRatePatients.length > totalPatients * 0.08 ? "critical" : "high" },
    { id: "low-sleep", label: "Short sleep duration", value: lowSleepPatients.length, unit: "patients", detail: `${formatPercent(lowSleepPatients.length, totalPatients)} slept under 6 hours.`, severity: lowSleepPatients.length > totalPatients * 0.3 ? "high" : "medium" },
    { id: "high-stress", label: "High stress load", value: highStressPatients.length, unit: "patients", detail: `${formatPercent(highStressPatients.length, totalPatients)} have stress scores of 8 or more.`, severity: highStressPatients.length > totalPatients * 0.2 ? "high" : "medium" },
  ];

  const weakestGroup = activityGroups.filter((group) => group.patients > 0).sort((a, b) => a.wellnessScore - b.wellnessScore)[0];

  const reports: ReportCard[] = [
    { title: "Cohort Wellness Summary", stat: `${wellnessScore}/100 overall`, detail: `Population averages are ${averageHeartRate.toFixed(1)} BPM heart rate, ${averageSleepDuration.toFixed(1)} hours of sleep, and ${averageStepCount.toLocaleString()} daily steps.` },
    { title: "Highest Risk Segment", stat: `${stressDistribution.find((segment) => segment.band === "Critical")?.patients ?? 0} critical-risk patients`, detail: `${weakestGroup?.activityLevel ?? "selected"} users show the weakest wellness score at ${weakestGroup?.wellnessScore ?? 0}/100.` },
    { title: "Activity Distribution", stat: `${activityGroups.map((group) => `${group.activityLevel}: ${group.patients.toLocaleString()}`).join(" | ")}`, detail: totalPatients > 0 ? "The selected dataset remains balanced across the available activity cohorts." : "No patients matched the current filter selection." },
  ];

  return { totalPatients, averageHeartRate, averageBloodOxygen, averageStepCount, averageSleepDuration, averageStressLevel, wellnessScore, summaryCards, activityGroups, stressDistribution, patientRiskTrend, anomalyAlerts, reports };
}

export async function getDatasetContext(filters?: ExportFilters): Promise<DatasetContext> {
  const allRecords = await getHealthRecords();
  const metadata = buildFilterMetadata([...allRecords].sort((a, b) => (a.recordedAt ?? "").localeCompare(b.recordedAt ?? "")));
  const appliedFilters = filters ?? {};
  const records = hasActiveFilters(appliedFilters) ? filterHealthRecords(allRecords, appliedFilters) : allRecords;
  return { overview: buildDatasetOverview(records, appliedFilters), records, metadata };
}

export async function getDatasetOverview(filters?: ExportFilters): Promise<DatasetOverview> {
  const context = await getDatasetContext(filters);
  return context.overview;
}

export async function syncLocalDatasetToFirebase(): Promise<FirebaseSyncResult> {
  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin is not configured. Add the required Firebase server environment variables first.");
  }

  const records = await getLocalHealthRecords();
  const csvText = await getLocalDatasetFileText();
  const firestore = getFirebaseAdminFirestore();
  const bucket = process.env.FIREBASE_STORAGE_BUCKET ? getFirebaseAdminStorage().bucket() : null;

  const batchSize = 400;
  for (let index = 0; index < records.length; index += batchSize) {
    const batch = firestore.batch();
    const chunk = records.slice(index, index + batchSize);
    chunk.forEach((record) => {
      const docRef = firestore.collection(HEALTH_COLLECTION).doc(String(record.patientId));
      batch.set(docRef, record, { merge: true });
    });
    await batch.commit();
  }

  let storagePath: string | null = null;
  if (bucket) {
    const file = bucket.file(HEALTH_STORAGE_PATH);
    await file.save(csvText, { contentType: "text/csv" });
    storagePath = HEALTH_STORAGE_PATH;
  }

  await firestore.doc(HEALTH_METADATA_DOC).set({
    syncedAt: new Date().toISOString(),
    source: "local-csv",
    collection: HEALTH_COLLECTION,
    rowCount: records.length,
    storagePath,
  }, { merge: true });

  return {
    source: "local",
    uploadedRecords: records.length,
    collection: HEALTH_COLLECTION,
    storagePath,
    metadataPath: HEALTH_METADATA_DOC,
  };
}
