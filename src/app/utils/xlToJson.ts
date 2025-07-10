import XLSX from 'xlsx';

/**
 * Converts an XLSX buffer to clean JSON.
 * 
 * @param fileBuffer - Buffer of the XLSX file.
 * @param sheetNameOptional - Optional sheet name.
 * @returns Cleaned JSON array of product rows.
 */
export const xlToJson = (
  fileBuffer: Buffer,
  sheetNameOptional?: string
): any[] => {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = sheetNameOptional || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const cleaned = rawJson
    .filter((row: any) => 
      row["Item Number"]?.toString().trim() ||
      row["Item Name"]?.toString().trim()
    )
    .map((row: any) => ({
      category: row["Category"],
      itemNumber: row["Item Number"],
      itemName: row["Item Name"],
      packetSize: row["Packet Size"],
      quantity: row["Quantity"],
      purchasePrice: row["Purchase Price"],
      salesPrice: row["Sales Price"]
    }));

  return cleaned;
};
