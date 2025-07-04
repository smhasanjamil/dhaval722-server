/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IOrder } from "./order.interface";
import { OrderModel } from "./order.model";

const createOrderIntoDB = async (payLoad: IOrder) => {
  const { invoiceNumber } = payLoad;

  const checkExistingOrder = await OrderModel.findOne({ invoiceNumber, isDeleted: false });

  if (checkExistingOrder) {
    throw new AppError(httpStatus.BAD_REQUEST, "This invoice number is already in use!");
  }

  const orderData = {
    date: payLoad.date,
    invoiceNumber: payLoad.invoiceNumber,
    PONumber: payLoad.PONumber,
    storeName: payLoad.storeName,
    paymentDueDate: payLoad.paymentDueDate,
    orderAmount: payLoad.orderAmount,
    orderStatus: payLoad.orderStatus || "verified",
    paymentAmountReceived: payLoad.paymentAmountReceived || 0,
    discountGiven: payLoad.discountGiven || 0,
    openBalance: payLoad.openBalance || 0,
    profitAmount: payLoad.profitAmount || 0,
    profitPercentage: payLoad.profitPercentage || 0,
    paymentStatus: payLoad.paymentStatus || "notPaid",
    salesPerson: payLoad.salesPerson,
    products: payLoad.products,
  };

  const createdOrder = await OrderModel.create(orderData);

  return createdOrder;
};

const getAllOrdersFromDB = async () => {
  const result = await OrderModel.find({ isDeleted: false }).populate("salesPerson").populate("products.productId");
  return result;
};

const getSingleOrderFromDB = async (id: string) => {
  const result = await OrderModel.findOne({ _id: id, isDeleted: false })
    .populate("salesPerson")
    .populate("products.productId");
  return result;
};

const updateOrderIntoDB = async (id: string, payload: Partial<IOrder>) => {
  const updateData = {
    date: payload.date,
    invoiceNumber: payload.invoiceNumber,
    PONumber: payload.PONumber,
    storeName: payload.storeName,
    paymentDueDate: payload.paymentDueDate,
    orderAmount: payload.orderAmount,
    orderStatus: payload.orderStatus,
    paymentAmountReceived: payload.paymentAmountReceived,
    discountGiven: payload.discountGiven,
    openBalance: payload.openBalance,
    profitAmount: payload.profitAmount,
    profitPercentage: payload.profitPercentage,
    paymentStatus: payload.paymentStatus,
    salesPerson: payload.salesPerson,
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
};