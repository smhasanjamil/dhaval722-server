// import puppeteer from "puppeteer-core";
// import chromium from "chrome-aws-lambda";

// export const generatePdf = async (htmlContent: string): Promise<Buffer> => {
//   const executablePath = await chromium.executablePath;

//   const browser = await puppeteer.launch({
//     args: chromium.args,
//     defaultViewport: chromium.defaultViewport,
//     executablePath: executablePath || undefined, // Use undefined locally
//     headless: chromium.headless,
//   });

//   try {
//     const page = await browser.newPage();
//     await page.setContent(htmlContent, { waitUntil: "networkidle0" });

//     const pdfBuffer = await page.pdf({
//       format: "A4",
//       printBackground: true,
//       margin: { top: "20mm", bottom: "20mm", left: "10mm", right: "10mm" },
//     });

//     return Buffer.from(pdfBuffer);
//   } finally {
//     await browser.close();
//   }
// };



import puppeteer from "puppeteer";


export const generatePdf = async (htmlContent: string): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set the provided HTML content
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "10mm", right: "10mm" },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
};

