import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { ProspectServices } from "./prospect.service";
import AppError from "../../errors/AppError";

const createProspect = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const result = await ProspectServices.createProspectIntoDB(body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Prospect created successfully",
    data: result,
  });
});

const getAllProspects = catchAsync(async (req: Request, res: Response) => {
  const result = await ProspectServices.getAllProspectsFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Prospects fetched successfully",
    data: result,
  });
});

const getMyProspects = catchAsync(async (req: Request, res: Response) => {
  const user = req?.user
  const result = await ProspectServices.getMyProspectsFromDB(user?.email);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your Assigned Prospects fetched successfully",
    data: result,
  });
});

const getSingleProspect = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProspectServices.getSingleProspectFromDB(id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Prospect not found");
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Prospect fetched successfully",
    data: result,
  });
});

const updateProspect = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatePayload = req.body;

  const result = await ProspectServices.updateProspectIntoDB(id, updatePayload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Prospect updated successfully",
    data: result,
  });
});

const deleteProspect = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProspectServices.deleteProspectIntoDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Prospect deleted successfully",
    data: result,
  });
});

const makeCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProspectServices.makeCustomerFromProspect(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Customer created from prospect successfully",
    data: result,
  });
});

export const ProspectControllers = {
  createProspect,
  getAllProspects,
  getSingleProspect,
  updateProspect,
  deleteProspect,
  makeCustomer,
  getMyProspects
};