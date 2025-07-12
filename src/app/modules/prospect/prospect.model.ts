// src/app/modules/prospect/prospect.model.ts

import { Schema, model } from "mongoose";
import { IProspect } from "./prospect.interface";

const prospectSchema = new Schema<IProspect>(
  {
    storeName: { type: String, required: true },
    storePhone: { type: String },
    storePersonEmail: { type: String },
    storePersonName: { type: String },
    storePersonPhone: { type: String },
    salesTaxId: { type: String },

    shippingAddress: { type: String },
    shippingState: { type: String },
    shippingZipcode: { type: String },
    shippingCity: { type: String },

    miscellaneousDocImage: { type: String },

    leadSource: { type: String },
    note: { type: String },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "rejected", "converted"],
      required: true,
      default: "new",
    },
    assignedSalesPerson: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
   followUpActivities: [
      {
        activity: { type: String },
        activityDate: { type: String },
        activityMedium: {
          type: String,
          enum: ["call", "email", "meeting", "whatsapp"],
        },
      }
    ],
    quotedList: [
      {
        productObjId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        itemNumber: { type: String, required: true },
        itemName: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    competitorStatement: { type: String },

    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const ProspectModel = model<IProspect>("Prospect", prospectSchema);
