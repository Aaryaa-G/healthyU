import "server-only";

import type { DatasetOverview, ExportFilters, HealthRecord, ReportCard } from "@/lib/health-data";

function escapeCsv(value: string | number | null | undefined) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "report"
  );
}

function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function formatFilterSummary(filters: ExportFilters) {
  const tokens: string[] = [];

  if (filters.patientId !== undefined) tokens.push(`Patient ${filters.patientId}`);
  if (filters.activityLevel) tokens.push(`Activity ${filters.activityLevel}`);
  if (filters.riskBand) tokens.push(`Risk ${filters.riskBand}`);
  if (filters.minStress !== undefined || filters.maxStress !== undefined) {
    tokens.push(`Stress ${filters.minStress ?? 0}-${filters.maxStress ?? 10}`);
  }
  if (filters.minSteps !== undefined || filters.maxSteps !== undefined) {
    tokens.push(`Steps ${filters.minSteps ?? 0}-${filters.maxSteps ?? "max"}`);
  }
  if (filters.startDate || filters.endDate) {
    tokens.push(`Date ${filters.startDate ?? "start"} to ${filters.endDate ?? "end"}`);
  }

  return tokens.length ? tokens.join(" | ") : "No filters applied";
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((part) => part + part).join("")
    : normalized;

  return {
    r: parseInt(value.slice(0, 2), 16) / 255,
    g: parseInt(value.slice(2, 4), 16) / 255,
    b: parseInt(value.slice(4, 6), 16) / 255,
  };
}

type PdfPage = {
  commands: string[];
};

class PdfBuilder {
  private pages: PdfPage[] = [];
  private currentPage: PdfPage = { commands: [] };
  private y = 0;
  private readonly width = 612;
  private readonly height = 792;
  private readonly margin = 40;

  constructor() {
    this.startPage();
  }

  private startPage() {
    this.currentPage = { commands: [] };
    this.pages.push(this.currentPage);
    this.y = 752;
  }

  private ensureSpace(requiredHeight: number) {
    if (this.y - requiredHeight < this.margin) {
      this.startPage();
    }
  }

  private push(command: string) {
    this.currentPage.commands.push(command);
  }

  rect(x: number, y: number, width: number, height: number, fillHex: string) {
    const { r, g, b } = hexToRgb(fillHex);
    this.push(`q ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg ${x} ${y} ${width} ${height} re f Q`);
  }

  line(x1: number, y1: number, x2: number, y2: number, strokeHex: string, lineWidth = 1) {
    const { r, g, b } = hexToRgb(strokeHex);
    this.push(`q ${lineWidth} w ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG ${x1} ${y1} m ${x2} ${y2} l S Q`);
  }

  text(text: string, x: number, y: number, options?: { size?: number; color?: string; font?: "F1" | "F2" }) {
    const { r, g, b } = hexToRgb(options?.color ?? "#111111");
    const size = options?.size ?? 11;
    const font = options?.font ?? "F1";
    this.push(`BT /${font} ${size} Tf ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg ${x} ${y} Td (${pdfEscape(text)}) Tj ET`);
  }

  heading(text: string, size = 22) {
    this.ensureSpace(size + 18);
    this.text(text, this.margin, this.y, { size, color: "#0f172a", font: "F2" });
    this.y -= size + 8;
  }

  subheading(text: string) {
    this.ensureSpace(18);
    this.text(text, this.margin, this.y, { size: 10, color: "#64748b", font: "F2" });
    this.y -= 16;
  }

  paragraph(text: string, options?: { size?: number; color?: string; maxWidth?: number }) {
    const size = options?.size ?? 11;
    const maxWidth = options?.maxWidth ?? 86;
    const words = text.split(/\s+/);
    let line = "";
    const lines: string[] = [];

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length > maxWidth) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }

    if (line) lines.push(line);

    for (const entry of lines) {
      this.ensureSpace(size + 8);
      this.text(entry, this.margin, this.y, { size, color: options?.color ?? "#334155" });
      this.y -= size + 4;
    }
    this.y -= 4;
  }

  metricCards(items: Array<{ label: string; value: string }>) {
    const cardWidth = 124;
    const cardHeight = 54;
    const gap = 10;
    this.ensureSpace(cardHeight + 20);
    const startY = this.y - cardHeight;

    items.forEach((item, index) => {
      const x = this.margin + index * (cardWidth + gap);
      this.rect(x, startY, cardWidth, cardHeight, index % 2 === 0 ? "#f8fafc" : "#fff1f2");
      this.text(item.label.toUpperCase(), x + 10, startY + 36, { size: 8, color: "#64748b", font: "F2" });
      this.text(item.value, x + 10, startY + 14, { size: 16, color: "#0f172a", font: "F2" });
    });

    this.y -= cardHeight + 18;
  }

  table(title: string, columns: string[], rows: string[][]) {
    const widths = columns.length === 4 ? [180, 110, 110, 132] : columns.length === 5 ? [150, 70, 70, 80, 162] : [120, 80, 80, 80, 80, 112];
    const rowHeight = 20;

    this.ensureSpace(48);
    this.subheading(title);
    let x = this.margin;
    const headerY = this.y - rowHeight;

    columns.forEach((column, index) => {
      this.rect(x, headerY, widths[index], rowHeight, "#0f172a");
      this.text(column, x + 6, headerY + 6, { size: 8, color: "#ffffff", font: "F2" });
      x += widths[index];
    });
    this.y -= rowHeight;

    rows.forEach((row, rowIndex) => {
      this.ensureSpace(rowHeight + 10);
      let columnX = this.margin;
      const bodyY = this.y - rowHeight;
      row.forEach((cell, index) => {
        this.rect(columnX, bodyY, widths[index], rowHeight, rowIndex % 2 === 0 ? "#f8fafc" : "#ffffff");
        this.line(columnX, bodyY, columnX + widths[index], bodyY, "#e2e8f0", 0.5);
        this.text(cell.slice(0, 28), columnX + 6, bodyY + 6, { size: 8, color: "#334155" });
        columnX += widths[index];
      });
      this.y -= rowHeight;
    });

    this.y -= 14;
  }

  build() {
    const pageObjects: string[] = [];
    const contentObjects: string[] = [];

    this.pages.forEach((page) => {
      const stream = page.commands.join("\n");
      contentObjects.push(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
    });

    const fontObjectIds = { regular: 3, bold: 4 };
    const firstContentId = 5;
    const firstPageId = firstContentId + contentObjects.length;

    this.pages.forEach((_, index) => {
      const contentId = firstContentId + index;
      pageObjects.push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.width} ${this.height}] /Resources << /Font << /F1 ${fontObjectIds.regular} 0 R /F2 ${fontObjectIds.bold} 0 R >> >> /Contents ${contentId} 0 R >>`,
      );
    });

    const objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      `<< /Type /Pages /Count ${this.pages.length} /Kids [${this.pages.map((_, index) => `${firstPageId + index} 0 R`).join(" ")}] >>`,
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
      ...contentObjects,
      ...pageObjects,
    ];

    let pdf = "%PDF-1.4\n";
    const offsets: number[] = [0];

    objects.forEach((object, index) => {
      offsets.push(Buffer.byteLength(pdf, "utf8"));
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefStart = Buffer.byteLength(pdf, "utf8");
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let index = 1; index < offsets.length; index += 1) {
      pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    return Buffer.from(pdf, "utf8");
  }
}

export function resolveReport(overview: DatasetOverview, reportTitle: string | null) {
  if (!reportTitle) {
    return null;
  }

  return overview.reports.find((report) => report.title === reportTitle) ?? null;
}

export function getExportFilename(format: "csv" | "pdf", report: ReportCard | null, filters?: ExportFilters, raw = false) {
  const scope = raw ? "raw-patient-dataset" : report ? slugify(report.title) : "smartwatch-health-summary";
  const suffix = filters && formatFilterSummary(filters) !== "No filters applied" ? "-filtered" : "";
  return `${scope}${suffix}.${format}`;
}

export function buildReportCsv(overview: DatasetOverview, report: ReportCard | null, filters: ExportFilters) {
  const rows: Array<Array<string | number>> = [
    ["Dataset", "Smartwatch Health Monitoring"],
    ["Filters", formatFilterSummary(filters)],
    ["Total Patients", overview.totalPatients],
    ["Average Heart Rate (BPM)", overview.averageHeartRate],
    ["Average Blood Oxygen (%)", overview.averageBloodOxygen],
    ["Average Step Count", overview.averageStepCount],
    ["Average Sleep Duration (hours)", overview.averageSleepDuration],
    ["Average Stress Level", overview.averageStressLevel],
    ["Wellness Score", overview.wellnessScore],
    [],
  ];

  if (report) {
    rows.push(["Report Title", report.title]);
    rows.push(["Report Detail", report.detail]);
    rows.push(["Report Stat", report.stat]);
  } else {
    rows.push(["Report Title", "Report Detail", "Report Stat"]);
    overview.reports.forEach((item) => {
      rows.push([item.title, item.detail, item.stat]);
    });
  }

  rows.push([]);
  rows.push(["Activity Level", "Patients", "Avg HR", "Avg Oxygen", "Avg Steps", "Avg Sleep", "Avg Stress", "Wellness"]);
  overview.activityGroups.forEach((group) => {
    rows.push([
      group.activityLevel,
      group.patients,
      group.avgHeartRate,
      group.avgBloodOxygen,
      group.avgStepCount,
      group.avgSleepDuration,
      group.avgStressLevel,
      group.wellnessScore,
    ]);
  });

  rows.push([]);
  rows.push(["Alert", "Patients", "Unit", "Severity", "Detail"]);
  overview.anomalyAlerts.forEach((alert) => {
    rows.push([alert.label, alert.value, alert.unit, alert.severity, alert.detail]);
  });

  return rows.map((row) => row.map((value) => escapeCsv(value)).join(",")).join("\n");
}

export function buildRawDatasetCsv(records: HealthRecord[], filters: ExportFilters) {
  const rows: Array<Array<string | number | null>> = [
    ["Dataset", "Smartwatch Health Monitoring Raw Export"],
    ["Filters", formatFilterSummary(filters)],
    ["Rows", records.length],
    [],
    [
      "Patient ID",
      "Recorded At",
      "Heart Rate (BPM)",
      "Blood Oxygen (%)",
      "Step Count",
      "Sleep Duration (hours)",
      "Activity Level",
      "Stress Level",
      "Risk Score",
      "Risk Band",
    ],
  ];

  records.forEach((record) => {
    rows.push([
      record.patientId,
      record.recordedAtLabel,
      record.heartRate,
      record.bloodOxygen,
      record.stepCount,
      record.sleepDuration,
      record.activityLevel,
      record.stressLevel,
      record.riskScore,
      record.riskBand,
    ]);
  });

  return rows.map((row) => row.map((value) => escapeCsv(value)).join(",")).join("\n");
}

export function buildReportPdf(overview: DatasetOverview, report: ReportCard | null, filters: ExportFilters) {
  const pdf = new PdfBuilder();

  pdf.rect(0, 720, 612, 72, "#0f172a");
  pdf.text("HealthyU Smartwatch Report", 40, 754, { size: 24, color: "#ffffff", font: "F2" });
  pdf.text("Branded export summary", 40, 734, { size: 10, color: "#fda4af", font: "F2" });
  pdf.text(`Filters: ${formatFilterSummary(filters)}`, 40, 714, { size: 9, color: "#e2e8f0" });
  pdf.heading(report ? report.title : "Executive Summary", 20);
  pdf.paragraph(
    report ? report.detail : "This export captures the current smartwatch cohort summary, activity segmentation, and anomaly table for the selected subset.",
    { size: 11, color: "#334155", maxWidth: 88 },
  );
  pdf.metricCards([
    { label: "Patients", value: overview.totalPatients.toLocaleString() },
    { label: "Heart Rate", value: `${overview.averageHeartRate.toFixed(1)} BPM` },
    { label: "Sleep", value: `${overview.averageSleepDuration.toFixed(1)} hrs` },
    { label: "Wellness", value: `${overview.wellnessScore}/100` },
  ]);

  pdf.table(
    "Report Summary",
    ["Metric", "Value", "Metric", "Value"],
    [
      ["Average Blood Oxygen", `${overview.averageBloodOxygen.toFixed(1)}%`, "Average Stress", `${overview.averageStressLevel.toFixed(1)} / 10`],
      ["Average Steps", overview.averageStepCount.toLocaleString(), "Report Stat", report?.stat ?? "Multiple summaries included"],
    ],
  );

  pdf.table(
    "Activity Cohorts",
    ["Activity", "Patients", "Avg Steps", "Avg Sleep", "Wellness"],
    overview.activityGroups.map((group) => [
      group.activityLevel,
      group.patients.toLocaleString(),
      group.avgStepCount.toLocaleString(),
      `${group.avgSleepDuration.toFixed(1)}h`,
      `${group.wellnessScore}/100`,
    ]),
  );

  pdf.table(
    "Alert Table",
    ["Alert", "Patients", "Severity", "Detail"],
    overview.anomalyAlerts.map((alert) => [
      alert.label,
      alert.value.toLocaleString(),
      alert.severity,
      alert.detail,
    ]),
  );

  return pdf.build();
}

export function getFilterSummaryLabel(filters: ExportFilters) {
  return formatFilterSummary(filters);
}
