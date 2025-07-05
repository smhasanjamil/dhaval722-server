import status from "http-status";
import AppError from "../../errors/AppError";
import { IProduct } from "./product.interface";
import { ProductModel } from "./product.model";
import { CategoryModel } from "../category/category.model";

const createProductInDB = async (payload: IProduct): Promise<IProduct> => {
  //  Check if category exists
  const category = await CategoryModel.findById(payload.categoryId);
  if (!category) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  // Check for duplicate barcode or item number
  const existing = await ProductModel.findOne({
    $or: [
      { barcodeString: payload.barcodeString },
      { itemNumber: payload.itemNumber },
    ],
  });

  if (existing) {
    throw new AppError(
      status.CONFLICT,
      "Product with same barcode or item number already exists"
    );
  }

  const product = await ProductModel.create(payload);
  return product;
};

// Get All Products From DB
const getAllProductsFromDB = async () => {
  return await ProductModel.find().sort({ createdAt: -1 });
};

// Get single product
const getSingleProductFromDB = async (id: string) => {
  const product = await ProductModel.findById(id);

  if (!product) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  return product;
};

// Update product
const updateProductInDB = async (id: string, payload: Partial<IProduct>) => {
  // 1. Check if product exists
  const existingProduct = await ProductModel.findById(id);
  if (!existingProduct) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  // 2. If categoryId is present, validate it
  if (payload.categoryId) {
    const categoryExists = await CategoryModel.findById(payload.categoryId);
    if (!categoryExists) {
      throw new AppError(status.NOT_FOUND, "Invalid category ID");
    }
  }

  // 3. If barcode or itemNumber changed, check for conflicts
  if (payload.barcodeString || payload.itemNumber) {
    const conflict = await ProductModel.findOne({
      $or: [
        { barcodeString: payload.barcodeString },
        { itemNumber: payload.itemNumber },
      ],
      _id: { $ne: id },
    });

    if (conflict) {
      throw new AppError(
        status.CONFLICT,
        "Another product with same barcode or item number already exists"
      );
    }
  }

  // 4. Update product
  const updatedProduct = await ProductModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return updatedProduct;
};

// Delete Product From DB
const deleteProductFromDB = async (id: string) => {
  const deleted = await ProductModel.findByIdAndDelete(id);

  if (!deleted) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  return deleted;
};

export const ProductService = {
  createProductInDB,
  getAllProductsFromDB,
  getSingleProductFromDB,
  updateProductInDB,
  deleteProductFromDB,
};