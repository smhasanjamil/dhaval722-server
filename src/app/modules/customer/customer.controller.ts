import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { CustomerServices } from "./customer.service";
import { CustomerModel } from "./customer.model";
import AppError from "../../errors/AppError";

const createCustomer = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const result = await CustomerServices.createCustomerIntoDB(body);

  const existing = await CustomerModel.findOne({storeName: body.storeName})
  if(existing){
        throw new AppError(httpStatus.BAD_REQUEST, "Customer store already exists with this name!");
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Customer created successfully",
    data: result,
  });
});

const getAllCustomers = catchAsync(async (req: Request, res: Response) => {
  const result = await CustomerServices.getAllCustomersFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Customers fetched successfully",
    data: result,
  });
});

const getSingleCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CustomerServices.getSingleCustomerFromDB(id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Customer fetched successfully",
    data: result,
  });
});

const updateCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatePayload = req.body;

  const existingCustomer = await CustomerModel.findById(id);

  if (!existingCustomer || existingCustomer.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
  }

  const result = await CustomerServices.updateCustomerIntoDB(id, updatePayload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Customer updated successfully",
    data: result,
  });
});

const deleteCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CustomerServices.deleteCustomerIntoDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Customer deleted successfully",
    data: result,
  });
});

export const CustomerControllers = {
  createCustomer,
  getAllCustomers,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
};