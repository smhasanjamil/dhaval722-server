import { Schema, model } from "mongoose";
import { ICustomer } from "./customer.interface";

const customerSchema = new Schema<ICustomer>(
  {
    storeName: { type: String, required: true },
    storePhone: { type: String, required: true },
    storePersonEmail: { type: String, required: true },
    salesTaxId: { type: String, required: true },
    acceptedDeliveryDays: {
      type: [String],
      enum: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
      required: true,
    },
    bankACHAccountInfo: { type: String, required: true },
    storePersonName: { type: String, required: true },
    storePersonPhone: { type: String, required: true },
    billingAddress: { type: String, required: true },
    billingState: { type: String, required: true },
    billingZipcode: { type: String, required: true },
    billingCity: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    shippingState: { type: String, required: true },
    shippingZipcode: { type: String, required: true },
    shippingCity: { type: String, required: true },
    creditApplication: { type: String, required: true },
    ownerLegalFrontImage: { type: String, required: true },
    ownerLegalBackImage: { type: String, required: true },
    voidedCheckImage: { type: String, required: true },
    miscellaneousDocImage: { type: String},
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const CustomerModel = model<ICustomer>("Customer", customerSchema);