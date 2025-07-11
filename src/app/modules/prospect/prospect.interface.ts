import { Types } from "mongoose";

export interface IProspect {
    _id: string;

    // Basic identifiers
    storeName: string;
    storePhone: string;
    storePersonEmail: string;
    storePersonName: string;
    storePersonPhone: string;
    salesTaxId?: string;
    
    // Addresses
    address: string;
    state?: string,
    zipcode?: string,
    city?: string,

    // Documents
    ownerLegalFrontImage?: string;
    ownerLegalBackImage?: string;
    miscellaneousDocImage?: string;

    // Prospect-specific fields
    leadSource?: string; 
    note?: string;
    status: "new" | "contacted" | "qualified" | "rejected" | "converted";
    assignedSalesPerson?: Types.ObjectId;
    followUpActivities?: {
        activityName: string,
        activityDate: string,
        activityMedium: "call" | "email" | "talkInPerson" | "whatsapp" 
    };
    quotedList : {
        productObjId: Types.ObjectId,
        itemNumber: string,
        itemName: string,
        price: number,
        packetSize: string
    }[]

    competitorStatement: string

    isDeleted: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}
