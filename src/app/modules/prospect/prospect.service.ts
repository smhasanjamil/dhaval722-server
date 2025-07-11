/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IProspect } from "./prospect.interface";
import { ProspectModel } from "./prospect.model";
import { CustomerModel } from "../customer/customer.model";

const createProspectIntoDB = async (payload: IProspect) => {
  const prospectData = {
    ...payload,
    isDeleted: false,
  };

  const createdProspect = await ProspectModel.create(prospectData);
  return createdProspect;
};

const getAllProspectsFromDB = async () => {
  const result = await ProspectModel.find({ isDeleted: false })
    .populate("assignedSalesPerson")
    .populate("quotedList.productObjId");
  return result;
};

const getSingleProspectFromDB = async (id: string) => {
  const result = await ProspectModel.findOne({ _id: id, isDeleted: false })
    .populate("assignedSalesPerson")
    .populate("quotedList.productObjId")
    .lean();
  return result;
};

const updateProspectIntoDB = async (id: string, payload: Partial<IProspect>) => {
  const updatedProspect = await ProspectModel.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true }
  )
    .where({ isDeleted: false })
    .populate("assignedSalesPerson")
    .populate("quotedList.productObjId");

  if (!updatedProspect) {
    throw new AppError(httpStatus.NOT_FOUND, "Prospect not found or already deleted");
  }

  return updatedProspect;
};

const deleteProspectIntoDB = async (id: string) => {
  const result = await ProspectModel.findByIdAndUpdate(
    id,
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Prospect not found");
  }

  return result;
};

const makeCustomerFromProspect = async (id: string) => {
  // Fetch the prospect by ID
  const prospect = await ProspectModel.findOne({ _id: id, isDeleted: false }).lean();
  if (!prospect) {
    throw new AppError(httpStatus.NOT_FOUND, "Prospect not found or already deleted");
  }

  // Create customer data from prospect fields
  const customerData = {
    storeName: prospect.storeName,
    storePhone: prospect.storePhone,
    storePersonEmail: prospect.storePersonEmail,
    storePersonName: prospect.storePersonName,
    storePersonPhone: prospect.storePersonPhone,
    shippingAddress: prospect.address,
    shippingZipcode: prospect.zipcode,
    shippingCity: prospect.city,
    shippingState: prospect.state,
    isDeleted: false,
  };

  // Create new customer
  const createdCustomer = await CustomerModel.create(customerData);

  // Update prospect status to "converted"
  await ProspectModel.findByIdAndUpdate(
    id,
    { $set: { status: "converted" } },
    { new: true }
  );

  return createdCustomer;
};

export const ProspectServices = {
  createProspectIntoDB,
  getAllProspectsFromDB,
  getSingleProspectFromDB,
  updateProspectIntoDB,
  deleteProspectIntoDB,
  makeCustomerFromProspect,
};