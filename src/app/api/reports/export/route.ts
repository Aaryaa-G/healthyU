import { getDatasetContext, getExportFilters } from "@/lib/health-data";
import { verifyFirebaseRequest } from "@/lib/firebase/auth-server";
import {
  buildRawDatasetCsv,
  buildReportCsv,
  buildReportPdf,
  getExportFilename,
  resolveReport,
} from "@/lib/report-export";

export async function GET(request: Request) {
  const authCheck = await verifyFirebaseRequest(request);
  if (!authCheck.ok || !authCheck.isAdmin) {
    return Response.json({ error: "Unauthorized. Sign in with an allowlisted Firebase admin email first." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");
  const reportTitle = searchParams.get("report");
  const exportType = searchParams.get("type") ?? "summary";

  if (format !== "csv" && format !== "pdf") {
    return Response.json({ error: "Invalid export format." }, { status: 400 });
  }

  if (exportType !== "summary" && exportType !== "raw") {
    return Response.json({ error: "Invalid export type." }, { status: 400 });
  }

  if (exportType === "raw" && format === "pdf") {
    return Response.json({ error: "Raw dataset export is available as CSV." }, { status: 400 });
  }

  const filters = getExportFilters(searchParams);
  const { overview, records } = await getDatasetContext(filters);
  const report = resolveReport(overview, reportTitle);

  if (reportTitle && !report) {
    return Response.json({ error: "Report not found." }, { status: 404 });
  }

  if (exportType === "raw") {
    const csv = buildRawDatasetCsv(records, filters);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${getExportFilename("csv", null, filters, true)}"`,
      },
    });
  }

  if (format === "csv") {
    const csv = buildReportCsv(overview, report, filters);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${getExportFilename("csv", report, filters)}"`,
      },
    });
  }

  const pdf = buildReportPdf(overview, report, filters);
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${getExportFilename("pdf", report, filters)}"`,
    },
  });
}
