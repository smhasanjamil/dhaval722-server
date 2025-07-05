import { Schema, model, Types } from "mongoose";
import { IOrder } from "./order.interface";

const orderSchema = new Schema<IOrder>(
  {
    date: { type: String, required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    PONumber: { type: String, required: true },
    storeName: { type: String, required: true },
    paymentDueDate: { type: String, required: true },
    orderAmount: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ["verified", "completed", "cancelled"],
      default: "verified",
    },
    isDeleted:{type: Boolean, default: false},
    paymentAmountReceived: { type: Number, default: 0 },
    discountGiven: { type: Number, default: 0 },
    openBalance: { type: Number, default: 0 },
    profitAmount: { type: Number, default: 0 },
    profitPercentage: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["paid", "notPaid", "partiallyPaid"],
      default: "notPaid",
    },
    // salesPerson: {
    //   type: Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        discount: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Calculate
orderSchema.pre("save", function (next) {

  // Calculate total discount from products array
  this.discountGiven = this.products.reduce((total: number, product: { discount: number }) => {
    return total + (product.discount || 0);
  }, 0);

  // Calculate openBalance
  this.openBalance = this.orderAmount - this.paymentAmountReceived - this.discountGiven;

  next();
});

export const OrderModel = model<IOrder>("Order", orderSchema);
