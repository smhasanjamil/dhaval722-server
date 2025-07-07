import { Types } from "mongoose";

export enum WeightUnit {
  KILOGRAM = "KILOGRAM",
  POUND = "POUND",
  OUNCE = "OUNCE",
  LITRE = "LITRE",
  PIECE = "PIECE",
  GRAM = "GRAM",
  MILLIGRAM = "MILLIGRAM",
  MILLILITRE = "MILLILITRE",
}

export enum PackingUnit {
  BOX = "BOX",
  PACKET = "PACKET",
  CARTON = "CARTON",
  BAG = "BAG",
  BOTTLE = "BOTTLE",
}

export enum DimensionUnit {
  CM = "CM",
  INCH = "INCH",
}

export interface IProduct {
  name: string;
  packetQuantity: number;
  isDeleted: boolean;
  packingUnit: PackingUnit;
  weight: number;
  weightUnit: WeightUnit;
  categoryId: Types.ObjectId;
  reorderPointOfQuantity: number;
  salesPrice: number;
  purchasePrice: number;
  barcodeString: string;
  itemNumber: string;
  quantity: number;
  warehouseLocation: string;
  packageDimensions?: {
    length: number;
    width: number;
    height: number;
    unit: DimensionUnit;
  };
  createdAt?: Date;
  updatedAt?: Date;
  competitorPrice?: number;
}