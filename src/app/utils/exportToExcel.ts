import * as XLSX from "xlsx";
import { Response } from "express";

export const exportGroupedProductsToExcel = (
  groupedData: any[],
  res: Response
) => {
  const worksheetData: any[][] = [];

  groupedData.forEach((group) => {
    // Add category heading row
    worksheetData.push([group.category.name]);

    // Add column headers
    worksheetData.push(["Item No", "Item Name", "Package Size", "Sale Price", "Order Quantity"]);

    // Add products under this category
    group.products.forEach((product: any) => {
      worksheetData.push([
        product.itemNumber,
        product.name,
        product.packetSize,
        product.salesPrice,
      ]);
    });

    // Add an empty row between categories
    worksheetData.push([]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "All Products");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  res.setHeader("Content-Disposition", "attachment; filename=products.xlsx");
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.send(buffer);
};
