// src/app/modules/container/container.model.ts

import { Schema, model, Types } from "mongoose";
import { IContainer } from "./container.interface";

const containerSchema = new Schema<IContainer>(
  {
    containerNumber: { type: String, required: true, unique: true },
    containerName: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },

    containerStatus: {
      type: String,
      enum: ["arrived", "onTheWay"],
      default: "onTheWay",
      required: true,
    },

    deliveryDate: { type: String, required: true },

    containerProducts: [
      {
        category:{ type: String, required: true },
        itemNumber:{ type: String, required: true},
        packetSize: { type: String, required: true }, 
        quantity: { type: Number, required: true },
        perCaseCost: { type: Number, required: true },
        purchasePrice: { type: Number, required: true },
        salesPrice: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const ContainerModel = model<IContainer>("Container", containerSchema);
