import {Document} from "mongoose";
import { ChainType, EventType } from "../schemas/filter.schema";

export interface Filter extends Document {
    readonly chain: ChainType;
    readonly eventType: EventType;
    readonly address: string;
}