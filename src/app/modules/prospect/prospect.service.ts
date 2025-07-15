/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IProspect } from "./prospect.interface";
import { ProspectModel } from "./prospect.model";
import { CustomerModel } from "../customer/customer.model";
import { sendProspectDutyEmailToSalesPerson } from "../../utils/sendMail";
import { UserModel } from "../user/user.model";
import { ProductModel } from "../product/product.model";

const createProspectIntoDB = async (payload: IProspect) => {
  const prospectData = {
    ...payload,
    isDeleted: false,
  };

  const salesPersonExists = await UserModel.findById(payload.assignedSalesPerson);
  if(!salesPersonExists) {throw new AppError(httpStatus.BAD_REQUEST, "Sales person does not exist!")}

  sendProspectDutyEmailToSalesPerson("tohaba6760@jxbav.com","0000000","Store ABC")
  const createdProspect = await ProspectModel.create(prospectData);
  return createdProspect;
};

const getAllProspectsFromDB = async () => {
  const result = await ProspectModel.find({ isDeleted: false })
    .populate("assignedSalesPerson")
    .populate("quotedList.productObjId");
  return result;
};

const getMyProspectsFromDB = async (salesUserEmail: string) => {

  const salesPerson = await UserModel.findOne({email: salesUserEmail})
  if(!salesPerson){
    throw new AppError(httpStatus.BAD_REQUEST, "Sales person does not exist anymore!")
  }

  const result = await ProspectModel.find({assignedSalesPerson: salesPerson._id, isDeleted: false })
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
    // Check existence
    const existingProspect = await ProspectModel.findOne({ _id: id, isDeleted: false });
    if (!existingProspect) {
        throw new AppError(httpStatus.NOT_FOUND, "Prospect not found or already deleted");
    }

    // Validate assignedSalesPerson if provided
    if (payload.assignedSalesPerson) {
        const user = await UserModel.findById(payload.assignedSalesPerson);
        if (!user) {
            throw new AppError(httpStatus.BAD_REQUEST, "Assigned salesperson not found");
        }
    }

    // Validate each quoted product
    if (payload.quotedList && Array.isArray(payload.quotedList)) {
        for (const quote of payload.quotedList) {
            if (quote.productObjId) {
                const product = await ProductModel.findById(quote.productObjId);
                if (!product) {
                    throw new AppError(
                        httpStatus.BAD_REQUEST,
                        `Product with ID ${quote.productObjId} not found in quoted list`
                    );
                }
            }
        }
    }

    // Update and populate
    const updatedProspect = await ProspectModel.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    )
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

  // Create fully compatible customer data
  const customerData = {
    storeName: prospect.storeName,
    isCustomerSourceProspect: true,
    storePhone: prospect.storePhone ?? "N/A",
    storePersonEmail: prospect.storePersonEmail ?? "noemail@provided.com",
    salesTaxId: prospect.salesTaxId ?? "N/A",
    acceptedDeliveryDays: ["monday"], // default to Monday, or adjust based on business logic
    bankACHAccountInfo: "N/A", // or fetch from user input if needed
    storePersonName: prospect.storePersonName ?? "N/A",
    storePersonPhone: prospect.storePersonPhone ?? "N/A",
    billingAddress: prospect.shippingAddress ?? "N/A",
    billingState: prospect.shippingState ?? "N/A",
    billingZipcode: prospect.shippingZipcode ?? "00000",
    billingCity: prospect.shippingCity ?? "N/A",
    shippingAddress: prospect.shippingAddress ?? "N/A",
    shippingState: prospect.shippingState ?? "N/A",
    shippingZipcode: prospect.shippingZipcode ?? "00000",
    shippingCity: prospect.shippingCity ?? "N/A",
    creditApplication: "N/A", // no data in prospect, placeholder
    ownerLegalFrontImage: "N/A",
    ownerLegalBackImage: "N/A",
    voidedCheckImage: "N/A", // no data in prospect, placeholder
    miscellaneousDocImage: prospect.miscellaneousDocImage ?? undefined,
    isDeleted: false,
  };

  // Create the customer
  const createdCustomer = await CustomerModel.create(customerData);

  // Mark prospect as converted
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
  getMyProspectsFromDB
};