import { ProductModel } from "../modules/product/product.model";

export const generateProductItemNumber = async() => {

      const product = await ProductModel.find();
      return  `PRO-${product.length+1}`

}