# Document Order Assistant

> **AI-Assisted Document Ordering with SOP Validation**  
> Arrange PDF documents according to document types, legal dates, prerequisite dependencies, and Standard Operating Procedure (SOP) rules — 100% locally in your browser.

---

## 1. Project Overview & Philosophy

Sorting business and compliance documents strictly by file timestamp or document date produces broken dossiers. For example, a background check completed on Jan 08 should not precede an intake application dated Jan 10 if company SOP mandates `Application → Identity → Verification → Approval → Contract`.

**Document Order Assistant** solves this with a deterministic 4-priority engine:
1. **Priority 1: SOP Sequence** — The authoritative step order defined in the active SOP rulebook.
2. **Priority 2: Dependency Precedence** — Explicit `before` / `after` prerequisite rules (e.g. Identity Proof must precede Verification).
3. **Priority 3: Chronological Ordering** — Applied strictly within documents belonging to the same logical stage.
4. **Priority 4: Manual User Overrides** — Interactive drag-and-drop adjustments that are preserved and clearly badged.

### 100% Client-Side Privacy Architecture
- **Zero Server Uploads**: Parsing, text extraction, classification, and PDF page merging run entirely within the local browser sandbox using WebAssembly, `PDF.js`, and `pdf-lib`.
- **Zero Paid APIs / External AI Services**: Runs without OpenAI, external OCR endpoints, or third-party servers.
- **Ephemerality**: In-memory state and blob URLs are immediately revoked and cleared on reset or session termination.

---

## 2. Key Features

- **Extensible SOP System**: Store and load custom JSON SOP definitions with multi-step pipelines, required flags, and dependency rules.
- **Deterministic Keyword & Pattern Classifier**: Weighted scoring combining filename regex, primary keywords, secondary context, and negative keywords.
- **Contextual Date Extraction**: Recognizes international formats (`YYYY-MM-DD`, `DD/MM/YYYY`, `DD-MM-YYYY`, `DD Month YYYY`, `Month DD, YYYY`), normalizes to ISO, scores context (`Date of Issue`, `Signed Date`), and detects ambiguity.
- **Comprehensive Conflict Detection**:
  - Missing mandatory documents
  - Duplicate documents exceeding limits
  - Chronological contradictions between sequential steps
  - Classification uncertainty (<60% confidence)
  - Explicit SOP rule violations
  - Ambiguous multiple dates
- **Original vs. Recommended Transition View**: Side-by-side comparison highlighting moved items and review flags.
- **Interactive Manual Reordering**: Drag-and-drop interface with manual override badges and reset controls.
- **In-Browser PDF Preview**: Built-in viewer with pagination, extracted text inspector, and metadata diagnostics.
- **Lossless PDF Merging**: Combines PDFs in the exact confirmed order preserving original dimensions and vector fidelity using `pdf-lib`.
- **In-Browser Custom SOP Builder**: Interactive visual modal enabling users to create, customize, and save custom multi-stage SOPs with mandatory toggles, document type tags, and precedence rules directly in the browser (persisted to localStorage).
- **Exportable Audit Report**: Downloadable compliance verification report in Markdown (`.md`) and HTML (`.html`).

---

## 3. Directory Structure

```text
src/
├── app/
│   ├── page.tsx               # Landing page with value prop, workflow, privacy
│   ├── workspace/
│   │   └── page.tsx           # Full interactive Document Order Workspace
│   ├── layout.tsx             # Root layout with SEO metadata & viewport
│   └── globals.css            # Tailwind CSS v4 styling
├── components/
│   ├── navbar.tsx             # Top navigation with privacy indicator
│   ├── footer.tsx             # Application footer
│   ├── sop/
│   │   ├── sop-selector.tsx   # Active SOP dropdown selector & builder triggers
│   │   ├── sop-rule-viewer.tsx# SOP steps and rules modal
│   │   └── sop-builder-modal.tsx# Interactive Custom SOP Builder & Editor
│   ├── upload/
│   │   ├── drop-zone.tsx      # Multi-PDF drag-and-drop upload zone
│   │   └── upload-queue.tsx   # File queue with pre-analysis reordering
│   ├── demo/
│   │   └── demo-banner.tsx    # 1-click sample package generator
│   ├── analysis/
│   │   ├── conflict-banner.tsx# Alert cards with "Why it matters" and actions
│   │   └── analysis-table.tsx # Classification results with confidence scores
│   ├── ordering/
│   │   ├── order-comparison.tsx # Side-by-side transition map
│   │   └── manual-reorder-list.tsx # Drag-and-drop final sequencer
│   ├── pdf-preview/
│   │   └── pdf-preview-modal.tsx# PDF viewer & extracted text diagnostic
│   └── export/
│       ├── export-bar.tsx     # Merge PDF & Audit Report action bar
│       └── audit-report-modal.tsx # Markdown/HTML audit viewer & exporter
├── data/
│   └── sops/
│       ├── employee-onboarding.json # Demo HR dossier SOP
│       ├── loan-application.json    # Mortgage & banking SOP
│       ├── procurement-package.json # Enterprise procurement SOP
│       └── index.ts                 # SOP registry and helpers
├── hooks/
│   └── use-workspace.ts       # Central state management hook
├── lib/
│   ├── classification/
│   │   ├── classifier.ts      # Deterministic keyword & regex classifier
│   │   └── dictionary.ts      # Configurable document type dictionary
│   ├── date/
│   │   └── date-extractor.ts  # Multi-format date extractor & normalizer
│   ├── ordering/
│   │   ├── ordering-engine.ts # 4-priority deterministic ordering engine
│   │   └── conflict-detector.ts # Conflict and anomaly detection
│   ├── pdf/
│   │   ├── pdf-extractor.ts   # PDF.js text and page metadata extraction
│   │   ├── pdf-merger.ts      # pdf-lib merger preserving page dimensions
│   │   └── sample-generator.ts# Client-side authentic demo PDF generator
│   ├── ocr/
│   │   └── ocr-fallback.ts    # Tesseract.js client-side OCR fallback
│   ├── audit/
│   │   └── audit-generator.ts # Markdown & HTML compliance audit reports
│   └── utils.ts               # Formatting and class helper utilities
└── types/
    ├── document.ts            # DocumentAnalysis & UploadedFileItem types
    ├── sop.ts                 # SOPDefinition, Step, & Rule interfaces
    └── analysis.ts            # ConflictItem & OrderingResult types

tests/
└── ordering-engine.test.ts    # Automated test suite covering all 8 test cases
```

---

## 4. SOP JSON Schema Example

Adding a new SOP requires zero code changes to the ordering engine. Simply create a JSON file:

```json
{
  "id": "employee-onboarding",
  "name": "Employee Onboarding Dossier",
  "description": "Standard corporate dossier for onboarding personnel.",
  "category": "Human Resources",
  "steps": [
    {
      "id": "application",
      "name": "Application Form",
      "order": 1,
      "documentTypes": ["application", "candidate-application"],
      "required": true,
      "maxAllowed": 1
    },
    {
      "id": "identity-proof",
      "name": "Identity Proof",
      "order": 2,
      "documentTypes": ["identity-proof", "passport", "national-id"],
      "required": true,
      "maxAllowed": 2
    },
    {
      "id": "verification",
      "name": "Verification Report",
      "order": 3,
      "documentTypes": ["verification", "background-check"],
      "required": true,
      "maxAllowed": 1
    },
    {
      "id": "approval",
      "name": "Approval Letter",
      "order": 4,
      "documentTypes": ["approval", "offer-letter"],
      "required": true,
      "maxAllowed": 1
    },
    {
      "id": "final-decision",
      "name": "Final Decision & Contract",
      "order": 5,
      "documentTypes": ["final-decision", "employment-agreement"],
      "required": true,
      "maxAllowed": 1
    }
  ],
  "rules": [
    {
      "type": "before",
      "before": "application",
      "after": "identity-proof",
      "description": "Application Form must precede Identity Proof in the dossier."
    },
    {
      "type": "before",
      "before": "verification",
      "after": "approval",
      "description": "Verification Report must be filed before Approval Letter."
    }
  ]
}
```

---

## 5. Automated Test Suite (All 8 Core Cases)

The project includes unit tests in `tests/ordering-engine.test.ts` covering:

| Test Case | Description | Verification |
|:---|:---|:---|
| **Case 1** | Correctly ordered documents | Verified: `movedCount === 0`, sequence intact. |
| **Case 2** | Completely scrambled documents | Verified: restored to correct SOP sequence. |
| **Case 3** | Dates contradict SOP order | Verified: SOP sequence takes precedence; warning flagged. |
| **Case 4** | Missing mandatory document | Verified: critical conflict flagged with actionable recommendation. |
| **Case 5** | Duplicate document for single-step | Verified: warning conflict raised with offending filenames. |
| **Case 6** | Unclassified / unknown document | Verified: uncertainty flagged, document moved to end for review. |
| **Case 7** | Multiple dates in single document | Verified: ambiguity warning with candidate date list. |
| **Case 8** | User manual override | Verified: final order preserves user position and override tag. |
| **Bonus** | Text classification accuracy | Verified: document text correctly mapped to type with high confidence. |

Run tests anytime with:
```bash
npm test
```

---

## 6. Getting Started & Local Development

### Prerequisites
- Node.js 18+ (tested on Node.js 24)
- npm 9+

### Installation
```bash
npm install
```

### Run Tests
```bash
npm test
```

### Typecheck & Lint
```bash
npm run typecheck
npm run lint
```

### Production Build & Local Server
```bash
npm run build
npm start
```
Or start development mode:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Deployment Instructions (Free Hosting)

### Deploying to Vercel (Recommended)
1. Push this repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) (free hobby tier).
3. Click **Add New Project** and select your GitHub repository.
4. Next.js App Router settings will be detected automatically:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. Click **Deploy**. No environment variables or external databases are required!

---

## 8. Known Limitations & Extensibility

- **Browser Memory Limits**: Extremely large dossiers (>100 high-resolution PDF pages) are bounded by browser tab RAM. The extractor optimizes memory by reading the first 10 pages for classification and releasing buffers.
- **Image-Only Scans**: Non-searchable scanned PDFs automatically fall back to client-side Tesseract.js OCR. High-volume scanned packages perform best when text layers are already embedded.
- **Future Extensibility**:
  - Visual drag-and-drop custom SOP builder
  - Web Worker multi-threading for OCR
  - Optional enterprise server-side microservice interface
