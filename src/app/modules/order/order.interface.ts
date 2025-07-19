import { Types } from "mongoose";

export interface IOrder {
  _id: string;
  date: string;
  invoiceNumber: string;
  PONumber: string;
  storeId: Types.ObjectId;
  paymentDueDate: string;

  orderAmount: number; //total amount
  shippingCharge: number;
  discountGiven: number; //total discounts given in products section of order
  openBalance: number; //remained amount
  profitAmount: number; //vs base products' price total
  profitPercentage: number;
  paymentAmountReceived: number;

  shippingDate?: string;

  orderStatus: "verified" | "completed" | "cancelled";
  paymentStatus: "paid" | "notPaid" | "partiallyPaid" | "overPaid";
  // salesPerson: Types.ObjectId

  products: {
    productId: Types.ObjectId;
    quantity: number;
    discount: number;
  }[];
  isDeleted: boolean;
}
