/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IContainer } from "./container.interface";
import { ContainerModel } from "./container.model";
import { ProductModel } from "../product/product.model";
import { xlToJson } from "../../utils/xlToJson";
import { ProductService } from "../product/product.service";
import { generateContainerNumber } from "../../utils/generateIds";

// export const createContainerIntoDB = async (payLoad: IContainer) => {

//     // ✅ Dynamically generate containerNumber
//   const containerNumber = await generateContainerNumber();
//   console.log("Generated Container Number:", containerNumber);

//   const {  containerProducts, containerStatus, shippingCost } = payLoad;

//   // Check if container number is already in use
//   const checkExistingContainer = await ContainerModel.findOne({
//     containerNumber,
//     isDeleted: false,
//   });
//   if (checkExistingContainer) {
//     throw new AppError(httpStatus.BAD_REQUEST, "This container number is already in use!");
//   }

//   // Validate each product by itemNumber and prepare for insertion
//   const failedEntries: any[] = [];
//   const enrichedContainerProducts: any[] = [];

//   for (const p of containerProducts) {
//     const existingProduct = await ProductModel.findOne({
//       itemNumber: p.itemNumber,
//     });

//     if (!existingProduct) {
//       failedEntries.push({
//         itemNumber: p.itemNumber,
//         reason: "Product not found",
//       });
//       continue;
//     }

//     //update inventory
//     (containerStatus == "onTheWay") ?
//     await ProductService.updateProductInDB(String(existingProduct._id), {incomingQuantity: existingProduct.incomingQuantity + p.quantity})
//     :
//     await ProductService.updateProductInDB(String(existingProduct._id), {quantity: existingProduct.quantity + p.quantity})

//     const perCaseCost = p.purchasePrice / p.quantity;

//     enrichedContainerProducts.push({
//       category: p.category,
//       itemNumber: p.itemNumber,
//       // packetSize: p.packetSize,
//       quantity: p.quantity,
//       perCaseCost: perCaseCost,
//       purchasePrice: p.purchasePrice,
//       salesPrice: p.salesPrice,
//     });
//   }

//   // If no valid products found, abort creation
//   if (enrichedContainerProducts.length === 0) {
//     throw new AppError(httpStatus.BAD_REQUEST, "No valid products found to add in the container.");
//   }

//   // 3️⃣ Create the container with valid products
//   const containerData = {
//     containerNumber: payLoad.containerNumber,
//     containerName: payLoad.containerName,
//     containerStatus: payLoad.containerStatus || "onTheWay",
//     deliveryDate: payLoad.deliveryDate,
//     containerProducts: enrichedContainerProducts,
//     shippingCost: payLoad.shippingCost
//   };

//   const createdContainer = await ContainerModel.create(containerData);

//   // 4️⃣ Return structured response
//   const containerEntry = {
//     createdContainer,
//     failedEntries,
//   };

//   return containerEntry;
// };

export const createContainerIntoDB = async (payLoad: IContainer) => {
  // ✅ Generate container number
  const containerNumber = await generateContainerNumber();
  console.log("Generated Container Number:", containerNumber);

  const { containerProducts, containerStatus, shippingCost } = payLoad;

  // ✅ Ensure uniqueness (optional if using DB unique index)
  const checkExistingContainer = await ContainerModel.findOne({
    containerNumber,
    isDeleted: false,
  });
  if (checkExistingContainer) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This container number is already in use!"
    );
  }

  const failedEntries: any[] = [];
  const enrichedContainerProducts: any[] = [];

  // ✅ Calculate total quantity for perCaseShippingCost
  const totalQuantity = containerProducts.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const perUnitShippingCost =
    shippingCost && totalQuantity > 0 ? shippingCost / totalQuantity : 0;

  for (const p of containerProducts) {
    const existingProduct = await ProductModel.findOne({
      itemNumber: p.itemNumber,
    });

    if (!existingProduct) {
      failedEntries.push({
        itemNumber: p.itemNumber,
        reason: "Product not found",
      });
      continue;
    }

    // ✅ Update inventory
    if (containerStatus === "onTheWay") {
      await ProductService.updateProductInDB(String(existingProduct._id), {
        incomingQuantity: existingProduct.incomingQuantity + p.quantity,
      });
    } else {
      await ProductService.updateProductInDB(String(existingProduct._id), {
        quantity: existingProduct.quantity + p.quantity,
      });
    }

    const perCaseCost = p.purchasePrice / p.quantity;

    enrichedContainerProducts.push({
      category: p.category,
      itemNumber: p.itemNumber,
      quantity: p.quantity,
      perCaseCost,
      perCaseShippingCost: perUnitShippingCost,
      purchasePrice: p.purchasePrice,
      salesPrice: p.salesPrice,
    });
  }

  if (enrichedContainerProducts.length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "No valid products found to add in the container."
    );
  }

  const containerData = {
    containerNumber, // ✅ use generated value
    containerName: payLoad.containerName,
    containerStatus: payLoad.containerStatus || "onTheWay",
    deliveryDate: payLoad.deliveryDate,
    containerProducts: enrichedContainerProducts,
    shippingCost,
  };

  const createdContainer = await ContainerModel.create(containerData);

  return {
    createdContainer,
    failedEntries,
  };
};

// export const createContainerIntoDB = async (payLoad: IContainer) => {
//   // ✅ Generate container number
//   const containerNumber = await generateContainerNumber();
//   console.log("Generated Container Number:", containerNumber);

//   const { containerProducts, containerStatus, shippingCost } = payLoad;

//   // ✅ Ensure uniqueness (optional if using DB unique index)
//   const checkExistingContainer = await ContainerModel.findOne({
//     containerNumber,
//     isDeleted: false,
//   });
//   if (checkExistingContainer) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "This container number is already in use!"
//     );
//   }

//   const failedEntries: any[] = [];
//   const enrichedContainerProducts: any[] = [];

//   // ✅ Calculate total quantity for perCaseShippingCost
//   const totalQuantity = containerProducts.reduce(
//     (sum, item) => sum + item.quantity,
//     0
//   );

//   const perUnitShippingCost =
//     shippingCost && totalQuantity > 0 ? shippingCost / totalQuantity : 0;

//   for (const p of containerProducts) {
//     const existingProduct = await ProductModel.findOne({
//       itemNumber: p.itemNumber,
//     });

//     if (!existingProduct) {
//       failedEntries.push({
//         itemNumber: p.itemNumber,
//         reason: "Product not found",
//       });
//       continue;
//     }

//     // ✅ Update inventory
//     if (containerStatus === "onTheWay") {
//       await ProductService.updateProductInDB(String(existingProduct._id), {
//         incomingQuantity: existingProduct.incomingQuantity + p.quantity,
//       });
//     } else {
//       await ProductService.updateProductInDB(String(existingProduct._id), {
//         quantity: existingProduct.quantity + p.quantity,
//       });
//     }

//     const perCaseCost = p.purchasePrice / p.quantity;
//     const perCaseShippingCost = Number(
//       (perUnitShippingCost * p.quantity).toFixed(2)
//     );

//     enrichedContainerProducts.push({
//       category: p.category,
//       itemNumber: p.itemNumber,
//       quantity: p.quantity,
//       perCaseCost,
//       perCaseShippingCost, // ✅ Included here
//       purchasePrice: p.purchasePrice,
//       salesPrice: p.salesPrice,
//     });
//   }

//   if (enrichedContainerProducts.length === 0) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "No valid products found to add in the container."
//     );
//   }

//   const containerData = {
//     containerNumber,
//     containerName: payLoad.containerName,
//     containerStatus: payLoad.containerStatus || "onTheWay",
//     deliveryDate: payLoad.deliveryDate,
//     containerProducts: enrichedContainerProducts, // ✅ perCaseShippingCost included
//     shippingCost,
//   };

//   const createdContainer = await ContainerModel.create(containerData);

//   return {
//     createdContainer,
//     failedEntries,
//   };
// };

const getAllContainersFromDB = async () => {
  const result = await ContainerModel.find({ isDeleted: false });
  return result;
};

const getSingleContainerFromDB = async (id: string) => {
  const result = await ContainerModel.findOne({ _id: id, isDeleted: false });
  return result;
};

const updateContainerIntoDB = async (
  id: string,
  payload: Partial<IContainer>
) => {
  const updateData: Partial<IContainer> = {
    containerNumber: payload.containerNumber,
    containerStatus: payload.containerStatus,
    deliveryDate: payload.deliveryDate,
    containerProducts: payload.containerProducts,
  };

  if (payload.shippingCost) {
    updateData.shippingCost = payload.shippingCost;
  }

  const updatedContainer = await ContainerModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).where({ isDeleted: false });
  if (!updatedContainer) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Container not found or already deleted"
    );
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

const xlImportToAddContainerIntoDB = async (
  fileBuffer: Buffer,
  containerDetails: {
    containerNumber: string;
    containerName: string;
    containerStatus?: "arrived" | "onTheWay";
    deliveryDate: string;
    shippingCost: number;
  }
) => {
  // 1️⃣ Parse items from XLSX
  const jsonData = xlToJson(fileBuffer);

  // 2️⃣ Construct container payload using parsed items
  const containerPayload = {
    containerNumber: containerDetails.containerNumber,
    containerName: containerDetails.containerName,
    containerStatus: containerDetails.containerStatus || "onTheWay",
    deliveryDate: containerDetails.deliveryDate,
    shippingCost: containerDetails.shippingCost,
    containerProducts: jsonData,
    isDeleted: false,
  };

  // 3️⃣ Create the container in DB
  const createdContainerEntry = await createContainerIntoDB(containerPayload);

  // 4️⃣ Return created container entry for API response
  return createdContainerEntry;
};

export const ContainerServices = {
  createContainerIntoDB,
  getAllContainersFromDB,
  getSingleContainerFromDB,
  updateContainerIntoDB,
  deleteContainerIntoDB,
  xlImportToAddContainerIntoDB,
};
