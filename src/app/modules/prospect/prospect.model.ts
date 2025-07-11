// src/app/modules/prospect/prospect.model.ts

import { Schema, model, Types } from "mongoose";
import { IProspect } from "./prospect.interface";

const prospectSchema = new Schema<IProspect>(
  {
    // Basic identifiers
    storeName: { type: String, required: true, trim: true },
    storePhone: { type: String, required: true, trim: true },
    storePersonEmail: { type: String, required: true, trim: true },
    storePersonName: { type: String, required: true, trim: true },
    storePersonPhone: { type: String, required: true, trim: true },

    salesTaxId: {type: String},
    
    // Address
    address: { type: String , required: true},
    zipcode: { type: String},
    city: { type: String},
    state: { type: String},

    // Documents
    ownerLegalFrontImage: { type: String },
    ownerLegalBackImage: { type: String },
    miscellaneousDocImage: { type: String },

    // Prospect-specific fields
    leadSource: { type: String, trim: true },
    note: { type: String, trim: true },
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
    followUpActivities: {
      activityName: { type: String, trim: true },
      activityDate: { type: String, trim: true },
      activityMedium: {
        type: String,
        enum: ["call", "email", "talkInPerson", "whatsapp"],
      },
    },
    quotedList: [
      {
        productObjId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        itemNumber: { type: String, required: true, trim: true },
        itemName: { type: String, required: true, trim: true },
        price: { type: Number, required: true },
        packetSize: { type: String, required: true, trim: true },
      },
    ],
    competitorStatement: { type: String, trim: true },
    isDeleted: {type: Boolean, default: false}
  },
  {
    timestamps: true,
  }
);

export const ProspectModel = model<IProspect>("Prospect", prospectSchema);
