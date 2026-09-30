import { createWorker } from "tesseract.js";

export interface OcrProgress {
  status: string;
  progress: number;
}

export async function performClientOcr(
  canvas: HTMLCanvasElement,
  onProgress?: (p: OcrProgress) => void
): Promise<string> {
  try {
    if (onProgress) onProgress({ status: "initializing", progress: 0.1 });
    const worker = await createWorker("eng");
    if (onProgress) onProgress({ status: "recognizing", progress: 0.5 });
    const ret = await worker.recognize(canvas);
    await worker.terminate();
    if (onProgress) onProgress({ status: "completed", progress: 1.0 });

    return ret.data.text || "";
  } catch (error) {
    console.error("Client OCR failed:", error);
    throw new Error(
      "Optical character recognition could not process this image-only document. Please ensure the document is clear."
    );
  }
}
