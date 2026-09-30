import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  FolderArchive,
  FileCheck2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-100 dark:border-slate-800">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Deterministic SOP Rule Engine • Client-Side Privacy</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
              Arrange PDF documents according to dates, document dependencies, and SOP rules.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed dark:text-slate-300">
              Stop blindly sorting by file dates. Automatically classify document types, resolve prerequisite dependencies, detect compliance conflicts, and merge a verified dossier.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/workspace"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 active:scale-95 transition-all dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <FolderArchive className="h-4 w-4" />
                <span>Open Document Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> 100% In-Browser Execution
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-blue-600" /> No Paid APIs or External Cloud
              </span>
              <span className="flex items-center gap-1.5">
                <FileCheck2 className="h-4 w-4 text-indigo-600" /> Export Merged PDF & Audit Log
              </span>
            </div>
          </div>
        </section>

        {/* Why Blind Date Sorting Fails */}
        <section className="py-14 bg-slate-50/70 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                The Ordering Problem
              </h2>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 dark:text-white">
                Why Sorting By Date Alone Destroys Dossier Integrity
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Naive date sorting */}
              <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-xs dark:bg-slate-900 dark:border-red-900/40">
                <div className="flex items-center gap-2 text-red-600 font-semibold text-sm mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Naive Date Sorting (Defective)</span>
                </div>
                <div className="space-y-2 text-xs font-mono bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 dark:bg-slate-950 dark:border-slate-800">
                  <div className="text-red-600">01. Background Verification (Jan 08) ✕</div>
                  <div className="text-slate-600 dark:text-slate-400">02. Application Form (Jan 10)</div>
                  <div className="text-slate-600 dark:text-slate-400">03. Offer Approval (Jan 15)</div>
                </div>
                <p className="mt-3 text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                  A verification report issued on Jan 08 gets positioned <em>before</em> the application submitted on Jan 10, violating mandatory HR and legal compliance filing rules.
                </p>
              </div>

              {/* Document Order Assistant */}
              <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-xs dark:bg-slate-900 dark:border-emerald-900/40">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-3 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>SOP-Engineered Ordering (Correct)</span>
                </div>
                <div className="space-y-2 text-xs font-mono bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 dark:bg-slate-950 dark:border-slate-800">
                  <div className="text-emerald-700 font-medium dark:text-emerald-300">01. Application Form (Step 1) ✓</div>
                  <div className="text-emerald-700 font-medium dark:text-emerald-300">02. Background Verification (Step 4) ✓</div>
                  <div className="text-emerald-700 font-medium dark:text-emerald-300">03. Offer Approval (Step 5) ✓</div>
                </div>
                <p className="mt-3 text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                  SOP stages and prerequisite dependencies take authoritative precedence. Chronological sorting is applied strictly within the same logical stage, preserving audit compliance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Workflow */}
        <section className="py-16 border-b border-slate-100 dark:border-slate-800">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Structured Workflow
              </h2>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 dark:text-white">
                Deterministic Processing from Upload to Merged Output
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  title: "Select SOP & Upload",
                  desc: "Pick your compliance package (e.g. Employee Onboarding, Loan Application) and drag in your PDF files.",
                },
                {
                  step: "02",
                  title: "Client-Side Extraction",
                  desc: "PDF.js extracts text, detects legal dates, and classifies document types deterministically.",
                },
                {
                  step: "03",
                  title: "Engine Sequencing",
                  desc: "The 4-priority engine evaluates SOP rules, topological constraints, and chronological ties.",
                },
                {
                  step: "04",
                  title: "Review & Merge",
                  desc: "Review side-by-side changes, make manual overrides if desired, and export a merged PDF and audit log.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:bg-slate-900 dark:border-slate-800"
                >
                  <div className="text-xs font-mono font-bold text-blue-600 bg-blue-50 w-8 h-8 rounded-lg flex items-center justify-center mb-3 dark:bg-blue-950 dark:text-blue-400">
                    {item.step}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Example Workflow */}
        <section className="py-16 bg-slate-50/70 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Example SOP Dossier
              </h2>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 dark:text-white">
                Employee Onboarding Standard Sequence
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { step: 1, name: "Application Form", type: "Intake" },
                { step: 2, name: "Identity Proof", type: "Passport / ID" },
                { step: 3, name: "Address Proof", type: "Utility / Lease" },
                { step: 4, name: "Verification Report", type: "Background" },
                { step: 5, name: "Approval Letter", type: "Offer / Sanction" },
                { step: 6, name: "Final Decision", type: "Contract" },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-2xs dark:bg-slate-900 dark:border-slate-800"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[11px] font-bold mx-auto mb-2 dark:bg-white dark:text-slate-900">
                    {item.step}
                  </div>
                  <h5 className="font-semibold text-xs text-slate-900 truncate dark:text-white">
                    {item.name}
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.type}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="py-16 border-b border-slate-100 dark:border-slate-800">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Zero-Exposure Privacy Guarantee
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Engineered for confidential business, banking, and legal documents.
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed dark:text-slate-300">
                Uploaded PDF documents are decoded, indexed, and sequenced entirely in your local browser sandbox via WebAssembly and PDF.js. No document text, personal data, or binary pages ever travel to third-party servers, cloud storage, or paid AI APIs.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 text-center">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-5">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Ready to sequence your document package?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto dark:text-slate-400">
              Open the workspace and upload your PDFs to automatically sort and validate them against your SOP.
            </p>
            <div>
              <Link
                href="/workspace"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 active:scale-95 transition-all dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <span>Launch Workspace Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
