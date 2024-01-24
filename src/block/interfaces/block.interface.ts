import {Document} from "mongoose";
import { ChainType } from "src/filter/schemas/filter.schema";

export interface Block extends Document {
    readonly blockNumber: number;
    readonly chainType: ChainType;
}
