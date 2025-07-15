/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { ICustomer } from "./customer.interface";
import { CustomerModel } from "./customer.model";
import { OrderModel } from "../order/order.model";
import { Types } from "mongoose";

const createCustomerIntoDB = async (payLoad: ICustomer) => {
  const { storePhone, storeName } = payLoad;

  const checkExistingCustomer = await CustomerModel.findOne({ storeName, isDeleted: false });

  if (checkExistingCustomer) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This store name is already in use!"
    );
  }

  const customerData = {
    storeName: payLoad.storeName,
    storePhone: payLoad.storePhone,
    storePersonEmail: payLoad.storePersonEmail,
    salesTaxId: payLoad.salesTaxId,
    acceptedDeliveryDays: payLoad.acceptedDeliveryDays,
    bankACHAccountInfo: payLoad.bankACHAccountInfo,
    storePersonName: payLoad.storePersonName,
    storePersonPhone: payLoad.storePersonPhone,
    billingAddress: payLoad.billingAddress,
    billingState: payLoad.billingState,
    billingZipcode: payLoad.billingZipcode,
    billingCity: payLoad.billingCity,
    shippingAddress: payLoad.shippingAddress,
    shippingState: payLoad.shippingState,
    shippingZipcode: payLoad.shippingZipcode,
    shippingCity: payLoad.shippingCity,
    creditApplication: payLoad.creditApplication,
    ownerLegalFrontImage: payLoad.ownerLegalFrontImage,
    ownerLegalBackImage: payLoad.ownerLegalBackImage,
    voidedCheckImage: payLoad.voidedCheckImage,
  };

  const createdCustomer = await CustomerModel.create(customerData);

  return createdCustomer;
};



const getAllCustomersFromDB = async () => {
  // Fetch all non-deleted customers
  const customers = await CustomerModel.find({ isDeleted: false }).lean();

  // Fetch all non-deleted orders
  const orders = await OrderModel.find({ isDeleted: false }).lean();

  // Create maps for order count, openBalance sum, and totalOrderAmount sum per storeId
  const orderCountMap = new Map<string, number>();
  const openBalanceMap = new Map<string, number>();
  const totalOrderAmountMap = new Map<string, number>();

  orders.forEach(order => {
    const storeId = order.storeId.toString();
    // Increment order count
    orderCountMap.set(storeId, (orderCountMap.get(storeId) || 0) + 1);
    // Sum openBalance
    openBalanceMap.set(storeId, (openBalanceMap.get(storeId) || 0) + (order.openBalance || 0));
    // Sum totalOrderAmount
    totalOrderAmountMap.set(storeId, (totalOrderAmountMap.get(storeId) || 0) + (order.orderAmount || 0));
  });

  // Add totalOrders, openBalance, and totalOrderAmount to each customer
  const result = customers.map(customer => ({
    ...customer,
    totalOrders: orderCountMap.get(customer._id.toString()) || 0,
    openBalance: openBalanceMap.get(customer._id.toString()) || 0,
    totalOrderAmount: totalOrderAmountMap.get(customer._id.toString()) || 0,
  }));

  return result;
};

const getSingleCustomerFromDB = async (id: string) => {
  const result = await CustomerModel.findOne({ _id: id, isDeleted: false }).lean();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found or already deleted");
  }

  // Aggregate order count, openBalance, and totalOrderAmount for this customer
  const orderStats = await OrderModel.aggregate([
    { $match: { storeId: new Types.ObjectId(id), isDeleted: false } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        openBalance: { $sum: "$openBalance" },
        totalOrderAmount: { $sum: "$orderAmount" },
      },
    },
  ]);

  return {
    ...result,
    totalOrders: orderStats[0]?.totalOrders || 0,
    openBalance: orderStats[0]?.openBalance || 0,
    totalOrderAmount: orderStats[0]?.totalOrderAmount || 0,
  };
};

const updateCustomerIntoDB = async (id: string, payload: Partial<ICustomer>) => {
  const updateData = {
    storeName: payload.storeName,
    storePhone: payload.storePhone,
    storePersonEmail: payload.storePersonEmail,
    salesTaxId: payload.salesTaxId,
    acceptedDeliveryDays: payload.acceptedDeliveryDays,
    bankACHAccountInfo: payload.bankACHAccountInfo,
    storePersonName: payload.storePersonName,
    storePersonPhone: payload.storePersonPhone,
    billingAddress: payload.billingAddress,
    billingState: payload.billingState,
    billingZipcode: payload.billingZipcode,
    billingCity: payload.billingCity,
    shippingAddress: payload.shippingAddress,
    shippingState: payload.shippingState,
    shippingZipcode: payload.shippingZipcode,
    shippingCity: payload.shippingCity,
    creditApplication: payload.creditApplication,
    ownerLegalFrontImage: payload.ownerLegalFrontImage,
    ownerLegalBackImage: payload.ownerLegalBackImage,
    voidedCheckImage: payload.voidedCheckImage,
  };

  const updatedCustomer = await CustomerModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).where({ isDeleted: false });

  if (!updatedCustomer) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found or already deleted");
  }

  return updatedCustomer;
};

const deleteCustomerIntoDB = async (id: string) => {
  const result = await CustomerModel.findByIdAndUpdate(
    id,
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
  }

  return result;
};

export const CustomerServices = {
  createCustomerIntoDB,
  getAllCustomersFromDB,
  getSingleCustomerFromDB,
  updateCustomerIntoDB,
  deleteCustomerIntoDB,
};