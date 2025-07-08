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

export const customerUpdateSchema = new Schema<Partial<ICustomer>>(
  {
    storeName: { type: String },
    storePhone: { type: String },
    storePersonEmail: { type: String },
    salesTaxId: { type: String },
    acceptedDeliveryDays: {
      type: [String],
      enum: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    bankACHAccountInfo: { type: String },
    storePersonName: { type: String },
    storePersonPhone: { type: String },
    billingAddress: { type: String },
    billingState: { type: String },
    billingZipcode: { type: String },
    billingCity: { type: String },
    shippingAddress: { type: String },
    shippingState: { type: String },
    shippingZipcode: { type: String },
    shippingCity: { type: String },
    creditApplication: { type: String },
    ownerLegalFrontImage: { type: String },
    ownerLegalBackImage: { type: String },
    voidedCheckImage: { type: String },
    miscellaneousDocImage: { type: String },
    isDeleted: { type: Boolean },
  },
  { timestamps: false, _id: false }
);

export const CustomerModel = model<ICustomer>("Customer", customerSchema);