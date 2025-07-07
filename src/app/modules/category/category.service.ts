import status from "http-status";
import AppError from "../../errors/AppError";
import { ICategory } from "./category.interface";
import { CategoryModel } from "./category.model";
import { ProductModel } from "../product/product.model";

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

// Get All Categories From DB
const getAllCategoriesFromDB = async () => {
  const categories = await CategoryModel.find().sort({ createdAt: -1 });
  return categories;
};

// Get Single Category From DB
const getSingleCategoryFromDB = async (categoryId: string) => {
  const category = await CategoryModel.findById(categoryId);

  if (!category) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  return category;
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

// Delete a category from the database
const deleteCategoryFromDB = async (id: string) => {
  // Check if category exists
  const category = await CategoryModel.findById(id);
  if (!category) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  // Check if any product is using this category
  const relatedProducts = await ProductModel.findOne({ categoryId: id });
  if (relatedProducts) {
    throw new AppError(
      status.CONFLICT,
      "Cannot delete category: products exist in this category"
    );
  }

  const deleted = await CategoryModel.findByIdAndDelete(id);
  return deleted;
};

export const CategoryService = {
  createCategoryIntoDB,
  updateCategoryInDB,
  getAllCategoriesFromDB,
  getSingleCategoryFromDB,
  deleteCategoryFromDB,
};
