import { Types } from "mongoose";

export interface IContainer {
    _id: Types.ObjectId,
    containerNumber: string,
    containerStatus: "arrived" | "onTheWay" 
    deliveryDate: string,
    containerProducts: {
        productCategory: string,
        productId: Types.ObjectId,
        productQuantity: number,
    }[],
    isDeleted: boolean
}