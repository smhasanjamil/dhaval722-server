/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IContainer } from "./container.interface";
import { ContainerModel } from "./container.model";
import { ProductModel } from "../product/product.model";
import { xlToJson } from "../../utils/xlToJson";

const createContainerIntoDB = async (payLoad: IContainer) => {
  const { containerNumber, containerProducts } = payLoad;

  // Check if container number is already in use
  const checkExistingContainer = await ContainerModel.findOne({ containerNumber, isDeleted: false });
  if (checkExistingContainer) {
    throw new AppError(httpStatus.BAD_REQUEST, "This container number is already in use!");
  }

  // Verify all product IDs exist
  const productIds = containerProducts.map((p) => p.productId);
  const existingProducts = await ProductModel.find({ _id: { $in: productIds } });
  if (existingProducts.length !== productIds.length) {
    throw new AppError(httpStatus.BAD_REQUEST, "One or more products not found!");
  }

  const containerData = {
    containerNumber: payLoad.containerNumber,
    containerStatus: payLoad.containerStatus || "onTheWay",
    deliveryDate: payLoad.deliveryDate,
    containerProducts: payLoad.containerProducts,
  };

  const createdContainer = await ContainerModel.create(containerData);

  return createdContainer;
};

const getAllContainersFromDB = async () => {
  const result = await ContainerModel.find({ isDeleted: false }).populate("containerProducts.productId");
  return result;
};

const getSingleContainerFromDB = async (id: string) => {
  const result = await ContainerModel.findOne({ _id: id, isDeleted: false }).populate("containerProducts.productId");
  return result;
};

const updateContainerIntoDB = async (id: string, payload: Partial<IContainer>) => {
  const updateData = {
    containerNumber: payload.containerNumber,
    containerStatus: payload.containerStatus,
    deliveryDate: payload.deliveryDate,
    containerProducts: payload.containerProducts,
  };

  const updatedContainer = await ContainerModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .where({ isDeleted: false })
    .populate("containerProducts.productId");

  if (!updatedContainer) {
    throw new AppError(httpStatus.NOT_FOUND, "Container not found or already deleted");
  }

  return updatedContainer;
};

const deleteContainerIntoDB = async (id: string) => {
  const result = await ContainerModel.findByIdAndUpdate(
    id,
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Container not found");
  }

  return result;
};


const xlImportToAddContainerIntoDB = async (fileBuffer: Buffer) => {

    const jsonData = await xlToJson(fileBuffer);

    return jsonData;
};



export const ContainerServices = {
  createContainerIntoDB,
  getAllContainersFromDB,
  getSingleContainerFromDB,
  updateContainerIntoDB,
  deleteContainerIntoDB,
  xlImportToAddContainerIntoDB
};