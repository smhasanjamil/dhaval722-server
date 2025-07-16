import { OrderModel } from "../modules/order/order.model";
import { ProductModel } from "../modules/product/product.model";

export const generateProductItemNumber = async() => {

      const product = await ProductModel.find();
      return  `PRO-${product.length+1}`

}

export const generatePONumber = async() => {

      const order = await OrderModel.find();
      return  `ORD-${order.length+1}`

}

