import Link from "next/link";
import { FileText, Filter } from "lucide-react";

import { ExportActionButton } from "@/components/auth/ExportActionButton";
import { getDatasetContext, getExportFilters, type ExportFilters, type ReportCard } from "@/lib/health-data";
import { getFilterSummaryLabel } from "@/lib/report-export";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type ReportsPageProps = {
  searchParams?: SearchParams;
};

function toQueryString(filters: ExportFilters, extra?: Record<string, string>) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  Object.entries(extra ?? {}).forEach(([key, value]) => {
    params.set(key, value);
  });

  return params.toString();
}

function buildSummaryExportHref(filters: ExportFilters, format: "csv" | "pdf", report?: ReportCard) {
  return `/api/reports/export?${toQueryString(filters, {
    format,
    type: "summary",
    ...(report ? { report: report.title } : {}),
  })}`;
}

function buildRawExportHref(filters: ExportFilters) {
  return `/api/reports/export?${toQueryString(filters, { format: "csv", type: "raw" })}`;
}

function getInputValue(value: number | string | undefined) {
  return value === undefined ? "" : String(value);
}

export default async function Reports({ searchParams }: ReportsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const filters = getExportFilters(resolvedSearchParams);
  const { overview, metadata, records } = await getDatasetContext(filters);
  const filterSummary = getFilterSummaryLabel(filters);

  return (
    <main className="flex-1 p-6 lg:p-12 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold uppercase tracking-widest">Generated Reports</h1>
        <p className="text-sm text-foreground/50 tracking-wider">FILTERED EXPORTS, BRANDED PDFS, AND RAW DATA DOWNLOADS</p>
      </div>

      <section className="border border-foreground/10 bg-foreground/[0.02] p-5 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.24em] text-foreground/50">Data Source</p>
        <p className="text-sm text-foreground/80">
          Current source: <span className="font-display uppercase tracking-[0.16em]">{metadata.dataSource}</span>
        </p>
        <p className="text-sm text-foreground/60">
          Firebase configured: {metadata.firebaseConfigured ? "Yes" : "No"}.
          Set <code>HEALTH_DATA_SOURCE=firebase</code> after syncing records to Firestore to switch the app from local CSV to cloud data.
        </p>
        <div className="pt-2">
          <ExportActionButton endpoint="/api/firebase/sync" label="Sync Local CSV To Firebase" icon="sync" variant="filled" />
        </div>
      </section>

      <section className="border border-foreground/10 bg-foreground/[0.02] p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-accent" />
          <h2 className="font-display uppercase tracking-widest text-sm font-bold">Export Filters</h2>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <label className="space-y-2 text-sm">
            <span className="block text-foreground/60 uppercase tracking-[0.2em] text-[11px]">Patient ID</span>
            <input name="patientId" defaultValue={getInputValue(filters.patientId)} placeholder={metadata.patientIdMin ? `${metadata.patientIdMin}-${metadata.patientIdMax}` : "Any"} className="w-full border border-foreground/10 bg-background/60 px-3 py-3 outline-none focus:border-accent" />
          </label>

          <label className="space-y-2 text-sm">
            <span className="block text-foreground/60 uppercase tracking-[0.2em] text-[11px]">Activity Level</span>
            <select name="activityLevel" defaultValue={filters.activityLevel ?? ""} className="w-full border border-foreground/10 bg-background/60 px-3 py-3 outline-none focus:border-accent">
              <option value="">All activity levels</option>
              {metadata.activities.map((activity) => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="block text-foreground/60 uppercase tracking-[0.2em] text-[11px]">Risk Band</span>
            <select name="riskBand" defaultValue={filters.riskBand ?? ""} className="w-full border border-foreground/10 bg-background/60 px-3 py-3 outline-none focus:border-accent">
              <option value="">All risk bands</option>
              {metadata.riskBands.map((riskBand) => (
                <option key={riskBand} value={riskBand}>
                  {riskBand}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-2 text-sm">
              <span className="block text-foreground/60 uppercase tracking-[0.2em] text-[11px]">Min Stress</span>
              <input name="minStress" type="number" min="0" max="10" defaultValue={getInputValue(filters.minStress)} className="w-full border border-foreground/10 bg-background/60 px-3 py-3 outline-none focus:border-accent" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="block text-foreground/60 uppercase tracking-[0.2em] text-[11px]">Max Stress</span>
              <input name="maxStress" type="number" min="0" max="10" defaultValue={getInputValue(filters.maxStress)} className="w-full border border-foreground/10 bg-background/60 px-3 py-3 outline-none focus:border-accent" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-2 text-sm">
              <span className="block text-foreground/60 uppercase tracking-[0.2em] text-[11px]">Min Steps</span>
              <input name="minSteps" type="number" min="0" defaultValue={getInputValue(filters.minSteps)} className="w-full border border-foreground/10 bg-background/60 px-3 py-3 outline-none focus:border-accent" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="block text-foreground/60 uppercase tracking-[0.2em] text-[11px]">Max Steps</span>
              <input name="maxSteps" type="number" min="0" defaultValue={getInputValue(filters.maxSteps)} className="w-full border border-foreground/10 bg-background/60 px-3 py-3 outline-none focus:border-accent" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:col-span-2">
            <label className="space-y-2 text-sm">
              <span className="block text-foreground/60 uppercase tracking-[0.2em] text-[11px]">Start Date</span>
              <input name="startDate" type="date" defaultValue={filters.startDate ?? ""} disabled={!metadata.hasDateRange} min={metadata.minDate ?? undefined} max={metadata.maxDate ?? undefined} className="w-full border border-foreground/10 bg-background/60 px-3 py-3 outline-none focus:border-accent disabled:opacity-40" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="block text-foreground/60 uppercase tracking-[0.2em] text-[11px]">End Date</span>
              <input name="endDate" type="date" defaultValue={filters.endDate ?? ""} disabled={!metadata.hasDateRange} min={metadata.minDate ?? undefined} max={metadata.maxDate ?? undefined} className="w-full border border-foreground/10 bg-background/60 px-3 py-3 outline-none focus:border-accent disabled:opacity-40" />
            </label>
          </div>

          <div className="md:col-span-2 xl:col-span-4 flex flex-wrap gap-3 pt-2">
            <button type="submit" className="px-4 py-3 bg-foreground text-background font-display text-xs uppercase tracking-[0.24em] hover:bg-accent transition-colors">
              Apply Filters
            </button>
            <Link href="/reports" className="px-4 py-3 border border-foreground/10 font-display text-xs uppercase tracking-[0.24em] hover:bg-foreground/5 transition-colors">
              Reset
            </Link>
          </div>
        </form>

        <div className="flex flex-col gap-2 border-t border-foreground/10 pt-4 text-sm text-foreground/60">
          <p className="uppercase tracking-[0.2em] text-[11px]">Current Filter Scope</p>
          <p>{filterSummary}</p>
          <p>{records.length.toLocaleString()} patient rows match the current selection.</p>
          {!metadata.hasDateRange ? <p>The current dataset has no date or timestamp column yet, so date filters are disabled until a future CSV includes one.</p> : null}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <ExportActionButton endpoint={buildSummaryExportHref(filters, "csv")} label="Export Summary CSV" />
        <ExportActionButton endpoint={buildSummaryExportHref(filters, "pdf")} label="Export Branded PDF" />
        <ExportActionButton endpoint={buildRawExportHref(filters)} label="Export Raw Dataset CSV" />
      </div>

      <div className="grid gap-4 max-w-5xl">
        {overview.reports.map((report) => (
          <div key={report.title} className="flex flex-col gap-4 p-5 border border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/5 transition-colors">
            <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
              <div className="flex items-center gap-4">
                <FileText className="w-5 h-5 text-accent shrink-0" />
                <div className="space-y-1">
                  <span className="font-display font-bold text-sm tracking-wider uppercase block">{report.title}</span>
                  <p className="text-sm text-foreground/60">{report.detail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ExportActionButton endpoint={buildSummaryExportHref(filters, "csv", report)} label="CSV" size="compact" />
                <ExportActionButton endpoint={buildSummaryExportHref(filters, "pdf", report)} label="PDF" size="compact" />
              </div>
            </div>
            <div className="border-t border-foreground/10 pt-3 text-xs uppercase tracking-[0.24em] text-foreground/50">
              {report.stat}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
