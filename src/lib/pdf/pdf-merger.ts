import { PDFDocument } from "pdf-lib";
import { DocumentAnalysis } from "@/types/document";

export interface MergeProgressCallback {
  (current: number, total: number, currentFileName: string): void;
}

export async function mergeOrderedPdfs(
  orderedDocuments: DocumentAnalysis[],
  onProgress?: MergeProgressCallback
): Promise<Uint8Array> {
  if (orderedDocuments.length === 0) {
    throw new Error("No documents available to merge.");
  }

  const mergedPdf = await PDFDocument.create();
  const total = orderedDocuments.length;

  for (let i = 0; i < total; i++) {
    const doc = orderedDocuments[i];
    if (onProgress) {
      onProgress(i + 1, total, doc.fileName);
    }

    let arrayBuffer: ArrayBuffer;

    if (doc.rawArrayBuffer) {
      arrayBuffer = doc.rawArrayBuffer;
    } else if (doc.file) {
      arrayBuffer = await doc.file.arrayBuffer();
    } else {
      throw new Error(`File content unavailable for "${doc.fileName}".`);
    }

    try {
      const sourcePdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: false,
      });

      const pageIndices = sourcePdf.getPageIndices();
      const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);

      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }
    } catch (loadErr: unknown) {
      console.error(`Failed to copy pages from ${doc.fileName}:`, loadErr);
      throw new Error(
        `Failed to merge "${doc.fileName}". The PDF file may be encrypted or corrupted.`
      );
    }
  }

  // Set standard PDF metadata
  mergedPdf.setTitle("Sequenced Compliance Dossier");
  mergedPdf.setProducer("Document Order Assistant");
  mergedPdf.setCreationDate(new Date());

  return await mergedPdf.save();
}

export function downloadMergedPdfBlob(pdfBytes: Uint8Array, customFilename?: string): void {
  const today = new Date().toISOString().split("T")[0];
  const filename = customFilename || `ordered-documents-${today}.pdf`;

  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
