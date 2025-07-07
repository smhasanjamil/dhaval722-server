// src/app/modules/container/container.model.ts

import { Schema, model, Types } from "mongoose";
import { IContainer } from "./container.interface";

const containerSchema = new Schema<IContainer>(
  {
    containerNumber: { type: String, required: true, unique: true },
    isDeleted: {type: Boolean, default: false},
    containerStatus: {
      type: String,
      enum: ["arrived", "onTheWay"],
      default: "onTheWay",
      required: true,
    },
    deliveryDate: { type: String, required: true },
    containerProducts: [
      {
        productCategory: { type: String, required: true },
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productQuantity: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const ContainerModel = model<IContainer>("Container", containerSchema);
