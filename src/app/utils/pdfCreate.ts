import puppeteer from "puppeteer";
import { IOrder } from "../modules/order/order.interface";

export const generateSalesOrderInvoicePdf = async (order: IOrder): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  const customer = (order.storeId as any) || {};

  const productRows = order.products
    .map((orderProduct, index) => {
      const product = (orderProduct.productId as any) || {};
      const salesPrice = product.salesPrice || 0;
      const quantity = orderProduct.quantity || 1;
      const discount = orderProduct.discount || 0;
      const total = salesPrice * quantity - discount;
      return `
        <tr>
          <td style="text-align:center;">${index + 1}</td>
          <td>${product.name || "Paper Product"}</td>
          <td style="text-align:center;">${quantity}</td>
          <td style="text-align:right;">৳${salesPrice.toFixed(2)}</td>
          <td style="text-align:right;">৳${total.toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #333; margin: 40px; }
          .header { text-align: center; }
          .logo { width: 120px; margin-bottom: 10px; }
          h2 { color: #388E3C; margin: 5px 0; }
          h3 { color: #4CAF50; margin-top: 10px; }
          .info-table, .product-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .info-table td { padding: 6px; vertical-align: top; }
          .product-table th, .product-table td { border: 1px solid #ccc; padding: 8px; }
          .product-table th { background: #E8F5E9; color: #388E3C; }
          .totals { margin-top: 20px; width: 100%; border-collapse: collapse; }
          .totals td { padding: 6px; text-align: right; }
          .totals tr td:first-child { text-align: left; }
          .footer { margin-top: 40px; font-size: 10px; text-align: center; color: #555; }
          .highlight { color: #4CAF50; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://i.postimg.cc/QMdNcbrC/Arbora-Logo.jpg" alt="Arbora Logo" class="logo" />
          <p>accounts@arbora.com</p>
          <h3>SALES ORDER INVOICE</h3>
        </div>

        <table class="info-table">
          <tr>
            <td>
              <span class="highlight">Bill To:</span><br/>
              ${customer.storeName || "N/A"}<br/>
              ${customer.billingAddress || "N/A"}, ${customer.billingCity || "N/A"}, ${customer.billingState || "N/A"}, ${customer.billingZipcode || "N/A"}<br/>
              Phone: ${customer.storePhone || "N/A"}<br/>
              Contact: ${customer.storePersonName || "N/A"}
            </td>
            <td>
              <span class="highlight">Invoice Details:</span><br/>
              Invoice No: ${order.invoiceNumber}<br/>
              PO Number: ${order.PONumber}<br/>
              Date: ${order.date}<br/>
              Due Date: ${order.paymentDueDate}<br/>
              Payment Status: ${order.paymentStatus}
            </td>
          </tr>
        </table>

        <table class="product-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>

        <table class="totals">
          <tr><td><strong>Subtotal:</strong></td><td>৳${(order.orderAmount + order.discountGiven).toFixed(2)}</td></tr>
          <tr><td><strong>Discount:</strong></td><td>৳${order.discountGiven.toFixed(2)}</td></tr>
          <tr><td><strong>Total:</strong></td><td>৳${order.orderAmount.toFixed(2)}</td></tr>
          <tr><td><strong>Amount Paid:</strong></td><td>৳${order.paymentAmountReceived.toFixed(2)}</td></tr>
          <tr><td><strong>Open Balance:</strong></td><td>৳${order.openBalance.toFixed(2)}</td></tr>
        </table>

        <div class="footer">
          Payments due by the due date | Overdue balances incur a 2% monthly interest | No returns after 14 days | Unpaid merchandise remains property of Arbora until fully paid.<br/>
          Thank you for choosing Arbora for your paper product needs!
        </div>
      </body>
    </html>
  `;

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "10mm", right: "10mm" }
  });

  await browser.close();

  return Buffer.from(pdfBuffer);
};
