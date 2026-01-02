
export interface ImageData {
  base64: string;
  mimeType: string;
}

export interface GenerationResult {
  imageUrl: string;
  text?: string;
}
