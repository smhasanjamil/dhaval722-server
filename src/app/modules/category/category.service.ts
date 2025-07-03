import status from "http-status";
import AppError from "../../errors/AppError";
import { ICategory } from "./category.interface";
import { CategoryModel } from "./category.model";

// Insert category into database
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

// Update a category in the database
const updateCategoryInDB = async (
  categoryId: string,
  payload: Partial<ICategory>
) => {
  const category = await CategoryModel.findById(categoryId);
  if (!category) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  return await CategoryModel.findByIdAndUpdate(categoryId, payload, {
    new: true,
  });
};

export const CategoryService = {
  createCategoryIntoDB,
  updateCategoryInDB,
};
