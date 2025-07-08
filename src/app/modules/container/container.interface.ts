import { Types } from "mongoose";

export interface IContainer {
    _id: Types.ObjectId,
    containerNumber: string,
    containerName: string,
    containerStatus: "arrived" | "onTheWay" 
    deliveryDate: string,
    containerProducts: {
        itemNumber: string,
        packetSize: number;
        productQuantity: number,
        purchasePrice: number,
        salesPrice: number,
        perCaseCost: number
    }[],
    isDeleted: boolean
}