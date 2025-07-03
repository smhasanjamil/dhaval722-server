import status from "http-status";
import AppError from "../../errors/AppError";
import { ICategory } from "./category.interface";
import { CategoryModel } from "./category.model";

const createCategoryIntoDB = async (payload: ICategory) => {
  const existingCategory = await CategoryModel.findOne({ name: payload.name });

  if (existingCategory) {
    throw new AppError(
      status.CONFLICT,
      "Category with this name already exists"
    );
  }

  const result = await CategoryModel.create(payload);
  return result;
};

export const CategoryService = {
  createCategoryIntoDB,
};
