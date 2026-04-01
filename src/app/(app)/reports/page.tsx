import { FileText, Download } from "lucide-react";

export default function Reports() {
  return (
    <main className="flex-1 p-6 lg:p-12 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold uppercase tracking-widest">Generate Reports</h1>
        <p className="text-sm text-foreground/50 tracking-wider">MONTHLY INSIGHTS & EXPORTS</p>
      </div>

      <div className="grid gap-4 max-w-2xl">
        {[ "March 2026 Executive Summary", "Q1 Health Trends", "Anomaly Logs - Last 30 Days" ].map((report, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 border border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/5 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <FileText className="w-5 h-5 text-accent" />
              <span className="font-display font-bold text-sm tracking-wider uppercase">{report}</span>
            </div>
            <button className="text-foreground/50 group-hover:text-foreground transition-colors">
               <Download className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
