/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IOrder } from "./order.interface";
import { OrderModel } from "./order.model";
import { ProductModel } from "../product/product.model";
import { generateSalesOrderInvoicePdf } from "../../utils/pdfCreate";
import { CustomerModel } from "../customer/customer.model";
import { Types } from "mongoose";

const createOrderIntoDB = async (payLoad: IOrder) => {
  const { invoiceNumber, products } = payLoad;

  // Check if invoice number is already in use
  const checkExistingOrder = await OrderModel.findOne({
    invoiceNumber,
    isDeleted: false,
  });
  if (checkExistingOrder) {
    throw new AppError(httpStatus.BAD_REQUEST, "This invoice number is already in use!");
  }

  // Check if store exists and is not deleted
  const checkExistingStore = await CustomerModel.findById(payLoad?.storeId);
  if (!checkExistingStore) {
    throw new AppError(httpStatus.BAD_REQUEST, "This customer store does not exist!");
  }
  if (checkExistingStore.isDeleted === true) {
    throw new AppError(httpStatus.BAD_REQUEST, "This customer store was deleted!");
  }

  // Verify each product existence individually
  let totalSalesPrice = 0;
  let totalPurchasePrice = 0;
  let discountGiven = 0;

  for (const product of products) {
    const productDetails = await ProductModel.findById(product.productId);

    if (!productDetails) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Product not found: Product ID ${product.productId}`
      );
    }

    const salesPrice = productDetails.salesPrice || 0;
    const purchasePrice = productDetails.purchasePrice || 0;
    const quantity = product.quantity || 1;
    const discount = product.discount || 0;

    totalSalesPrice += salesPrice * quantity;
    totalPurchasePrice += purchasePrice * quantity;
    discountGiven += discount;
  }

  const orderAmount = totalSalesPrice - discountGiven;
  const profitAmount = orderAmount - totalPurchasePrice;
  const profitPercentage =
    totalPurchasePrice > 0 ? (profitAmount / totalPurchasePrice) * 100 : 0;
  const openBalance =
    orderAmount - (payLoad.paymentAmountReceived || 0) - discountGiven;

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
    openBalance,
    profitAmount,
    profitPercentage,
    paymentStatus: payLoad.paymentStatus || "notPaid",
    products: payLoad.products,
  };

  const createdOrder = await OrderModel.create(orderData);
  return createdOrder;
};


const generateOrderInvoicePdf = async (id: string): Promise<Buffer> => {
  const order = await OrderModel.findOne({ _id: id, isDeleted: false })
    .populate("products.productId")
    .populate("storeId")
    .lean();

  console.log(order);
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found or deleted");
  }

  const pdfBuffer = await generateSalesOrderInvoicePdf(order);
  return pdfBuffer;
};

const getAllOrdersFromDB = async () => {
  const result = await OrderModel.find({ isDeleted: false }).populate(
    "products.productId"
  );
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
  const checkExistingStore = await CustomerModel.findOne({
    _id: payload.storeId,
    isDeleted: false,
  });
  if (!checkExistingStore) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This customer store does not exist!"
    );
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
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Order not found or already deleted"
    );
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

// Fetch all product for sheet
const getProductsGroupedByCategory = async () => {
  const grouped = await ProductModel.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: "$categoryInfo" },
    {
      $group: {
        _id: "$categoryId",
        category: { $first: "$categoryInfo" },
        products: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        category: {
          _id: "$category._id",
          name: "$category.name",
          description: "$category.description",
        },
        products: 1,
      },
    },
  ]);

  return grouped;
};

// Helper function to generate combinations of 2 or 3 elements from an array
function getCombinations<T>(array: T[], size: number): T[][] {
  const results: T[][] = [];
  
  function combine(start: number, current: T[]) {
    if (current.length === size) {
      results.push([...current]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      current.push(array[i]);
      combine(i + 1, current);
      current.pop();
    }
  }
  
  combine(0, []);
  return results;
}


const getProductSegmentation = async (topN: number = 10): Promise<{ combination: string[]; frequency: number }[]> => {
  const orders = await OrderModel.find({ isDeleted: false }).lean();
  
  // Fetch all product IDs from orders
  const productIds = [...new Set(orders.flatMap(order => order.products.map(p => p.productId.toString())))];
  
  // Fetch product names from ProductModel
  const products = await ProductModel.find({ _id: { $in: productIds } }).select('_id name').lean();
  const productNameMap = new Map(products.map(p => [p._id.toString(), p.name || 'Unknown Product']));
  
  // Dictionary to store combination frequencies
  const combinationCounts: { [key: string]: number } = {};

  // Process each order
  for (const order of orders) {
    // Extract product IDs from the order
    const productIds = order.products.map(p => p.productId.toString()).sort();
    
    // Generate combinations of 2 and 3 products
    const combinations2 = getCombinations(productIds, 2);
    const combinations3 = getCombinations(productIds, 3);
    
    // Combine all combinations
    const allCombinations = [...combinations2, ...combinations3];
    
    // Count frequency of each combination
    for (const combo of allCombinations) {
      const comboKey = combo.join(",");
      combinationCounts[comboKey] = (combinationCounts[comboKey] || 0) + 1;
    }
  }

  // Convert to array and sort by frequency
  const result = Object.entries(combinationCounts)
    .map(([key, frequency]) => ({
      combination: key.split(",").map(id => productNameMap.get(id) || 'Unknown Product'),
      frequency,
    }))
    .sort((a, b) => b.frequency - a.frequency || a.combination.length - b.combination.length)
    .slice(0, topN);

  return result;
};


export const OrderServices = {
  createOrderIntoDB,
  getAllOrdersFromDB,
  getSingleOrderFromDB,
  updateOrderIntoDB,
  deleteOrderIntoDB,
  generateOrderInvoicePdf,
  getProductsGroupedByCategory,
  getProductSegmentation
};
