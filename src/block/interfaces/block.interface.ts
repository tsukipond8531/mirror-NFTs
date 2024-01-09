import {Document} from "mongoose";

export interface Block extends Document {
    readonly blockNumber: number;
}
