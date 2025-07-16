import { Schema, model } from "mongoose";
import { ICustomer } from "./customer.interface";

// Regular expressions for validation
const phoneRegex = /^\+?[1-9]\d{1,14}$|^(\(\d{3}\)\s?|\d{3}-?)\d{3}-?\d{4}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const zipcodeRegex = /^\d{5}(-\d{4})?$/;
const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;

const customerSchema = new Schema<ICustomer>(
  {
    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      minlength: [1, "Store name cannot be empty"],
    },
    storePhone: {
      type: String,
      required: [true, "Store phone is required"],
      match: [phoneRegex, "Invalid store phone format (e.g., +1234567890, (123) 456-7890, 123-456-7890)"],
    },
    storePersonEmail: {
      type: String,
      required: [true, "Store person email is required"],
      match: [emailRegex, "Invalid email format (e.g., user@example.com)"],
      lowercase: true,
      trim: true,
    },
    salesTaxId: {
      type: String,
      required: [true, "Sales tax ID is required"],
      trim: true,
      minlength: [1, "Sales tax ID cannot be empty"],
    },
    acceptedDeliveryDays: {
      type: [String],
      enum: {
        values: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
        message: "{VALUE} is not a valid delivery day",
      },
      required: [true, "At least one delivery day is required"],
    },
    isCustomerSourceProspect: {
      type: Boolean,
      default: false,
    },
    bankACHAccountInfo: {
      type: String,
      required: [true, "Bank ACH account info is required"],
      trim: true,
      minlength: [1, "Bank ACH account info cannot be empty"],
    },
    storePersonName: {
      type: String,
      required: [true, "Store person name is required"],
      trim: true,
      minlength: [1, "Store person name cannot be empty"],
    },
    storePersonPhone: {
      type: String,
      required: [true, "Store person phone is required"],
      match: [phoneRegex, "Invalid store person phone format (e.g., +1234567890, (123) 456-7890, 123-456-7890)"],
    },
    billingAddress: {
      type: String,
      required: [true, "Billing address is required"],
      trim: true,
      minlength: [1, "Billing address cannot be empty"],
    },
    billingState: {
      type: String,
      required: [true, "Billing state is required"],
      trim: true,
      minlength: [1, "Billing state cannot be empty"],
    },
    billingZipcode: {
      type: String,
      required: [true, "Billing zipcode is required"],
      match: [zipcodeRegex, "Invalid billing zipcode format (e.g., 12345 or 12345-6789)"],
    },
    billingCity: {
      type: String,
      required: [true, "Billing city is required"],
      trim: true,
      minlength: [1, "Billing city cannot be empty"],
    },
    shippingAddress: {
      type: String,
      required: [true, "Shipping address is required"],
      trim: true,
      minlength: [1, "Shipping address cannot be empty"],
    },
    shippingState: {
      type: String,
      required: [true, "Shipping state is required"],
      trim: true,
      minlength: [1, "Shipping state cannot be empty"],
    },
    shippingZipcode: {
      type: String,
      required: [true, "Shipping zipcode is required"],
      match: [zipcodeRegex, "Invalid shipping zipcode format (e.g., 12345 or 12345-6789)"],
    },
    shippingCity: {
      type: String,
      required: [true, "Shipping city is required"],
      trim: true,
      minlength: [1, "Shipping city cannot be empty"],
    },
    creditApplication: {
      type: String,
      required: [true, "Credit application is required"],
      trim: true,
      minlength: [1, "Credit application cannot be empty"],
    },
    ownerLegalFrontImage: {
      type: String,
      required: [true, "Owner legal front image is required"],
      match: [urlRegex, "Invalid owner legal front image URL"],
    },
    ownerLegalBackImage: {
      type: String,
      required: [true, "Owner legal back image is required"],
      match: [urlRegex, "Invalid owner legal back image URL"],
    },
    voidedCheckImage: {
      type: String,
      required: [true, "Voided check image is required"],
      match: [urlRegex, "Invalid voided check image URL"],
    },
    miscellaneousDocImage: {
      type: String,
      match: [urlRegex, "Invalid miscellaneous document image URL"],
      optional: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const CustomerModel = model<ICustomer>("Customer", customerSchema);