import { performClientOcr } from "../ocr/ocr-fallback";

export interface ExtractedPdfData {
  text: string;
  pageCount: number;
  isScannedImageOnly: boolean;
  ocrApplied: boolean;
}

let pdfjsLib: typeof import("pdfjs-dist") | null = null;

async function getPdfJs() {
  if (typeof window === "undefined") {
    throw new Error("PDF processing is only supported in browser environment.");
  }
  if (!pdfjsLib) {
    const lib = await import("pdfjs-dist");
    // Point worker to local public file for fast, offline, privacy-safe execution
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjsLib = lib;
  }
  return pdfjsLib;
}

export async function extractPdfTextAndMetadata(
  arrayBuffer: ArrayBuffer,
  options: { enableOcrFallback?: boolean } = {}
): Promise<ExtractedPdfData> {
  const lib = await getPdfJs();

  let loadingTask;
  try {
    loadingTask = lib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: true,
      isEvalSupported: false,
      useSystemFonts: true,
    });
  } catch {
    throw new Error("This PDF could not be opened. The file format may be invalid or corrupted.");
  }

  let pdfDoc;
  try {
    pdfDoc = await loadingTask.promise;
  } catch (err: unknown) {
    const errorMsg = (err as Error)?.message || "";
    if (errorMsg.includes("Password") || (err as { name?: string }).name === "PasswordException") {
      throw new Error("This PDF is password-protected. Please remove password encryption before uploading.");
    }
    throw new Error("This PDF could not be read. It may be corrupted or damaged.");
  }

  const pageCount = pdfDoc.numPages;
  if (pageCount === 0) {
    throw new Error("This PDF document contains no pages.");
  }

  const textPieces: string[] = [];

  // Extract text page by page (up to first 10 pages for classification/date needs to keep memory light)
  const maxPagesToRead = Math.min(pageCount, 10);
  for (let pageNum = 1; pageNum <= maxPagesToRead; pageNum++) {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? (item as { str: string }).str : ""))
        .join(" ");
      textPieces.push(pageText);
    } catch (pageErr) {
      console.warn(`Error reading page ${pageNum}:`, pageErr);
    }
  }

  let fullText = textPieces.join("\n").trim();
  let isScannedImageOnly = false;
  let ocrApplied = false;

  // If text is extremely short or empty, document may be a scanned image
  if (fullText.length < 25) {
    isScannedImageOnly = true;

    if (options.enableOcrFallback) {
      try {
        const page1 = await pdfDoc.getPage(1);
        const viewport = page1.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page1.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          const ocrText = await performClientOcr(canvas);
          if (ocrText && ocrText.trim().length > 0) {
            fullText = ocrText;
            ocrApplied = true;
          }
        }
      } catch (ocrErr) {
        console.warn("OCR fallback could not complete:", ocrErr);
      }
    }
  }

  return {
    text: fullText,
    pageCount,
    isScannedImageOnly,
    ocrApplied,
  };
}
