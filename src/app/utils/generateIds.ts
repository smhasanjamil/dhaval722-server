import { ContainerModel } from "../modules/container/container.model";
import { OrderModel } from "../modules/order/order.model";
import { ProductModel } from "../modules/product/product.model";

export const generateProductItemNumber = async () => {
  const product = await ProductModel.find();
  return `PRO-${product.length + 1}`;
};

export const generatePONumber = async () => {
  const order = await OrderModel.find();
  return `ORD-${order.length + 1}`;
};

export const generateInvoiceNumber = async (
  storeName: string,
  date: string
) => {
  const randomFourDigits = Math.floor(1000 + Math.random() * 9000);

  const capitalizedStoreName = storeName.toUpperCase();

  return `INV-${capitalizedStoreName}#${date.slice(0, 10)}#${randomFourDigits}`;
};

export const generateContainerNumber = async () => {
  const count = await ContainerModel.countDocuments();
  return `CON-${count + 1}`;
};
