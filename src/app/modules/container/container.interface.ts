import { Types } from "mongoose";

export interface IContainer {
    _id: Types.ObjectId,
    containerNumber: string,
    containerName: string,
    containerStatus: "arrived" | "onTheWay" 
    deliveryDate: string,
    containerProducts: {
        productId: Types.ObjectId,
        packetSize: number;
        productQuantity: number,
    }[],
    isDeleted: boolean
}