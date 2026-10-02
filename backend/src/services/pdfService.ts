import pdfParse from 'pdf-parse';

export async function extractTextFromPDF(
    pdfData: Buffer
): Promise<string> {
    try {
        const data = await pdfParse(pdfData);

        return data.text.trim();
    } catch (error) {
        console.error('Error processing PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
}