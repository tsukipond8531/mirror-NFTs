import { Document } from "mongoose";

export interface Nft extends Document {
    readonly l1Address: string;
    readonly l2Address: string;
}

export interface NftBody {
    readonly l1_address: string;
}