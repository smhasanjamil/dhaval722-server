import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { CategoryService } from "./category.service";

// Create a new Category
const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategoryIntoDB(req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

export const CategoryController = {
  createCategory,
};
