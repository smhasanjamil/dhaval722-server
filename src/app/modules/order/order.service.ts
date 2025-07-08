/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IOrder } from "./order.interface";
import { OrderModel } from "./order.model";
import { ProductModel } from "../product/product.model";
import { generateSalesOrderInvoicePdf } from "../../utils/pdfCreate";
import { CustomerModel } from "../customer/customer.model";


const createOrderIntoDB = async (payLoad: IOrder) => {
  const { invoiceNumber, products } = payLoad;

  // Check if invoice number is already in use
  const checkExistingOrder = await OrderModel.findOne({ invoiceNumber, isDeleted: false });
  if (checkExistingOrder) {
    throw new AppError(httpStatus.BAD_REQUEST, "This invoice number is already in use!");
  }

  console.log("cus:",payLoad.storeId)

  const checkExistingStore = await CustomerModel.findById(payLoad?.storeId);
  if (!checkExistingStore) {
    throw new AppError(httpStatus.BAD_REQUEST, "This customer store does not exist!");
  }

  if (checkExistingStore.isDeleted ==  true) {
    throw new AppError(httpStatus.BAD_REQUEST, "This customer store was deleted!");
  }


  // Step 1: Verify all product IDs exist
  console.log("Step 1: Verifying product IDs...");
  const productIds = products.map((p) => p.productId);
  const existingProducts = await ProductModel.find({ _id: { $in: productIds } });
  
  if (existingProducts.length !== productIds.length) {
    throw new AppError(httpStatus.BAD_REQUEST, "One or more products not found!");
  }
  console.log("All product IDs are valid.");

  // Step 2: Calculate discountGiven from products array
  console.log("Step 2: Calculating total discount...");
  const discountGiven = products.reduce((total, product) => {
    const discount = product.discount || 0;
    console.log(`Product ID ${product.productId}: Discount = ${discount}`);
    return total + discount;
  }, 0);
  console.log(`Total discountGiven: ${discountGiven}`);

  // Step 3: Calculate orderAmount using salesPrice from ProductModel
  console.log("Step 3: Calculating order amount...");
  let totalSalesPrice = 0;
  for (const product of products) {
    const productDetails = existingProducts.find((p) => p._id.toString() === product.productId.toString());
    if (productDetails) {
      const productTotal = (productDetails.salesPrice || 0) * (product.quantity || 1);
      console.log(`Product ID ${product.productId}: SalesPrice = ${productDetails.salesPrice}, Quantity = ${product.quantity}, Total = ${productTotal}`);
      totalSalesPrice += productTotal;
    }
  }
  const orderAmount = totalSalesPrice - discountGiven;
  console.log(`Total sales price: ${totalSalesPrice}, OrderAmount after discount: ${orderAmount}`);

  // Step 4: Calculate profitAmount using purchasePrice from ProductModel
  console.log("Step 4: Calculating profit amount...");
  let totalPurchasePrice = 0;
  for (const product of products) {
    const productDetails = existingProducts.find((p) => p._id.toString() === product.productId.toString());
    if (productDetails) {
      const productPurchaseTotal = (productDetails.purchasePrice || 0) * (product.quantity || 1);
      console.log(`Product ID ${product.productId}: PurchasePrice = ${productDetails.purchasePrice}, Quantity = ${product.quantity}, Total = ${productPurchaseTotal}`);
      totalPurchasePrice += productPurchaseTotal;
    }
  }
  const profitAmount = orderAmount - totalPurchasePrice;
  console.log(`Total purchase price: ${totalPurchasePrice}, ProfitAmount: ${profitAmount}`);

  // Step 5: Calculate profitPercentage
  console.log("Step 5: Calculating profit percentage...");
  const profitPercentage = totalPurchasePrice > 0 ? (profitAmount / totalPurchasePrice) * 100 : 0;
  console.log(`ProfitPercentage: ${profitPercentage.toFixed(2)}%`);

  // Prepare order data
  const orderData = {
    date: payLoad.date,
    invoiceNumber: payLoad.invoiceNumber,
    PONumber: payLoad.PONumber,
    storeId: payLoad.storeId,
    paymentDueDate: payLoad.paymentDueDate,
    orderAmount,
    orderStatus: payLoad.orderStatus || "verified",
    paymentAmountReceived: payLoad.paymentAmountReceived || 0,
    discountGiven,
    openBalance: orderAmount - (payLoad.paymentAmountReceived || 0) - discountGiven,
    profitAmount,
    profitPercentage,
    paymentStatus: payLoad.paymentStatus || "notPaid",
    products: payLoad.products,
  };

  console.log("Step 6: Creating order in database...");
  const createdOrder = await OrderModel.create(orderData);
  console.log("Order created successfully.");

  return createdOrder;
};


const generateOrderInvoicePdf = async (id: string): Promise<Buffer> => {
  const order = await OrderModel.findOne({ _id: id, isDeleted: false })
    .populate("products.productId")
    .populate("storeId")
    .lean();

    console.log(order)
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found or deleted");
  }

  const pdfBuffer = await generateSalesOrderInvoicePdf(order);
  return pdfBuffer;
};


const getAllOrdersFromDB = async () => {
  const result = await OrderModel.find({ isDeleted: false }).populate("products.productId");
  return result;
};

const getSingleOrderFromDB = async (id: string) => {
  const result = await OrderModel.findOne({ _id: id, isDeleted: false })
    .populate("products.productId")
    .populate("storeId")
    .lean();

  return result;
};

const updateOrderIntoDB = async (id: string, payload: Partial<IOrder>) => {

    const checkExistingStore = await CustomerModel.findOne({ _id: payload.storeId, isDeleted: false });
  if (!checkExistingStore) {
    throw new AppError(httpStatus.BAD_REQUEST, "This customer store does not exist!");
  }

  const updateData = {
    date: payload.date,
    invoiceNumber: payload.invoiceNumber,
    PONumber: payload.PONumber,
    storeId: payload.storeId,
    paymentDueDate: payload.paymentDueDate,
    orderAmount: payload.orderAmount,
    orderStatus: payload.orderStatus,
    paymentAmountReceived: payload.paymentAmountReceived,
    discountGiven: payload.discountGiven,
    openBalance: payload.openBalance,
    profitAmount: payload.profitAmount,
    profitPercentage: payload.profitPercentage,
    paymentStatus: payload.paymentStatus,
    // salesPerson: payload.salesPerson,
    products: payload.products,
  };

  const updatedOrder = await OrderModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .where({ isDeleted: false })
    .populate("salesPerson")
    .populate("products.productId");

  if (!updatedOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found or already deleted");
  }

  return updatedOrder;
};

const deleteOrderIntoDB = async (id: string) => {
  const result = await OrderModel.findByIdAndUpdate(
    id,
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return result;
};

export const OrderServices = {
  createOrderIntoDB,
  getAllOrdersFromDB,
  getSingleOrderFromDB,
  updateOrderIntoDB,
  deleteOrderIntoDB,
  generateOrderInvoicePdf
};