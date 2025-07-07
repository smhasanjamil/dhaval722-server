import status from "http-status";
import AppError from "../../errors/AppError";
import { IProduct } from "./product.interface";
import { ProductModel } from "./product.model";
import { CategoryModel } from "../category/category.model";
import { generateProductItemNumber } from "../../utils/generateProductItemNumber";

const createProductInDB = async ( payload: IProduct | IProduct[]) => {
  // Ensure we're always working with an array internally
  const productsArray = Array.isArray(payload) ? payload : [payload];

  const createdProducts: IProduct[] = [];

  for (const productPayload of productsArray) {
    // 1️⃣ Validate category
    const category = await CategoryModel.findById(productPayload.categoryId);
    if (!category) {
      throw new AppError(status.NOT_FOUND, `Category not found for product: ${productPayload.name || "Unnamed Product"}`);
    }

    // 2️⃣ Check duplicate barcode or item number
    const existing = await ProductModel.findOne({
      $or: [
        { barcodeString: productPayload.barcodeString },
        { itemNumber: productPayload.itemNumber },
      ],
    });
    if (existing) {
      throw new AppError(
        status.CONFLICT,
        `Product with barcode ${productPayload.barcodeString} or item number already exists`
      );
    }

    const itemNumber = await generateProductItemNumber();

    const productData = { ...productPayload, itemNumber };
    const createdProduct = await ProductModel.create(productData);

    createdProducts.push(createdProduct);
  }

  return Array.isArray(payload) ? createdProducts : createdProducts[0];
};

// Get All Products From DB
const getAllProductsFromDB = async () => {
  return await ProductModel.find({ isDeleted: false }).sort({ createdAt: -1 });
};

const getAllPacketSizesFromDB = async () => {
  const packetSizes = await ProductModel.distinct("packetSize", { isDeleted: false });
  return packetSizes;
};



// Get single product
const getSingleProductFromDB = async (id: string) => {
  const product = await ProductModel.findOne({ _id: id, isDeleted: false });

  if (!product) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  return product;
};


// Update product
const updateProductInDB = async (id: string, payload: Partial<IProduct>) => {
  // 1. Check if product exists and not deleted
  const existingProduct = await ProductModel.findOne({ _id: id, isDeleted: false });
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
      isDeleted: false, // only check against non-deleted products
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
  const product = await ProductModel.findById(id);

  if (!product) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  product.isDeleted = true;
  const deletedProduct = await product.save();

  return deletedProduct;
};


export const ProductService = {
  createProductInDB,
  getAllProductsFromDB,
  getSingleProductFromDB,
  updateProductInDB,
  deleteProductFromDB,
  getAllPacketSizesFromDB
};
