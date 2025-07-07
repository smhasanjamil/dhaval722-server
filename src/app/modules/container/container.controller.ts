import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { ContainerServices } from "./container.service";
import { ContainerModel } from "./container.model";
import AppError from "../../errors/AppError";

const createContainer = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const result = await ContainerServices.createContainerIntoDB(body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Container created successfully",
    data: result,
  });
});

const getAllContainers = catchAsync(async (req: Request, res: Response) => {
  const result = await ContainerServices.getAllContainersFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Containers fetched successfully",
    data: result,
  });
});

const getSingleContainer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ContainerServices.getSingleContainerFromDB(id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Container not found");
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Container fetched successfully",
    data: result,
  });
});

const updateContainer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatePayload = req.body;

  const existingContainer = await ContainerModel.findById(id);

  if (!existingContainer || existingContainer.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Container not found");
  }

  const result = await ContainerServices.updateContainerIntoDB(id, updatePayload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Container updated successfully",
    data: result,
  });
});

const deleteContainer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ContainerServices.deleteContainerIntoDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Container deleted successfully",
    data: result,
  });
});

export const ContainerControllers = {
  createContainer,
  getAllContainers,
  getSingleContainer,
  updateContainer,
  deleteContainer,
};