/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IPayment } from "./payment.interface";
import { PaymentModel } from "./payment.model";
import { CustomerModel } from "../customer/customer.model";
import { OrderModel } from "../order/order.model";

const createPaymentIntoDB = async (payLoad: IPayment) => {
  const { storeId, forOrderId, checkNumber } = payLoad;

  // Check if checkNumber is already in use for non-deleted payments
  const checkExistingPayment = await PaymentModel.findOne({ checkNumber, idDeleted: false });
  if (checkExistingPayment) {
    throw new AppError(httpStatus.BAD_REQUEST, "This check number is already in use!");
  }

  // Verify storeId exists
  const existingCustomer = await CustomerModel.findOne({ _id: storeId, isdeleted: false });
  if (!existingCustomer) {
    throw new AppError(httpStatus.BAD_REQUEST, "Customer not found!");
  }

  // Verify forOrderId exists
  const existingOrder = await OrderModel.findOne({ _id: forOrderId, isDeleted: false });
  if (!existingOrder) {
    throw new AppError(httpStatus.BAD_REQUEST, "Order not found!");
  }

  const paymentData = {
    storeId: payLoad.storeId,
    forOrderId: payLoad.forOrderId,
    method: payLoad.method,
    date: payLoad.date,
    amount: payLoad.amount,
    checkNumber: payLoad.checkNumber,
    checkImage: payLoad.checkImage,
  };

  const createdPayment = await PaymentModel.create(paymentData);

  return createdPayment;
};

const getAllPaymentsFromDB = async () => {
  const result = await PaymentModel.find({ idDeleted: false })
    .populate("storeId")
    .populate("forOrderId");
  return result;
};

const getSinglePaymentFromDB = async (id: string) => {
  const result = await PaymentModel.findOne({ _id: id, idDeleted: false })
    .populate("storeId")
    .populate("forOrderId");
  return result;
};

const updatePaymentIntoDB = async (id: string, payload: Partial<IPayment>) => {
  const updateData = {
    storeId: payload.storeId,
    forOrderId: payload.forOrderId,
    method: payload.method,
    date: payload.date,
    amount: payload.amount,
    checkNumber: payload.checkNumber,
    checkImage: payload.checkImage,
  };

  // If updating storeId or forOrderId, verify they exist
  if (payload.storeId) {
    const existingCustomer = await CustomerModel.findOne({ _id: payload.storeId, isdeleted: false });
    if (!existingCustomer) {
      throw new AppError(httpStatus.BAD_REQUEST, "Customer not found!");
    }
  }

  if (payload.forOrderId) {
    const existingOrder = await OrderModel.findOne({ _id: payload.forOrderId, isDeleted: false });
    if (!existingOrder) {
      throw new AppError(httpStatus.BAD_REQUEST, "Order not found!");
    }
  }

  const updatedPayment = await PaymentModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .where({ idDeleted: false })
    .populate("storeId")
    .populate("forOrderId");

  if (!updatedPayment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found or already deleted");
  }

  return updatedPayment;
};

const deletePaymentIntoDB = async (id: string) => {
  const result = await PaymentModel.findByIdAndUpdate(
    id,
    { $set: { idDeleted: true } },
    { new: true }
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  return result;
};

export const PaymentServices = {
  createPaymentIntoDB,
  getAllPaymentsFromDB,
  getSinglePaymentFromDB,
  updatePaymentIntoDB,
  deletePaymentIntoDB,
};