import XLSX from 'xlsx';

/**
 * Converts an XLSX buffer to JSON.
 * 
 * @param fileBuffer - Buffer of the XLSX file.
 * @param sheetNameOptional - Optional specific sheet name to parse. If not provided, parses the first sheet.
 * @returns Parsed JSON array of row objects.
 */
export const xlToJson = (
    fileBuffer: Buffer,
    sheetNameOptional?: string
): any[] => {
    // Read workbook from the buffer
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    // Determine which sheet to parse
    const sheetName = sheetNameOptional || workbook.SheetNames[0];
    if (!sheetName) {
        throw new Error('No sheets found in the XLSX file.');
    }

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
        throw new Error(`Sheet "${sheetName}" not found in the XLSX file.`);
    }

    // Convert worksheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    return jsonData;
};
