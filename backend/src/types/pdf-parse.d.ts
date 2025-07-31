declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    info: Record<string, any>;
  }
  
  function PDFExtract(dataBuffer: Buffer): Promise<PDFData>;
  export = PDFExtract;
} 