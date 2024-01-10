import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { HydratedDocument} from 'mongoose';

export enum ChainType {
    L1 = 1,
    L2 = 2,
}

export enum EventType {
    Transfer = 1,
    SessionEnded = 2,
}

export type FilterDocument = HydratedDocument<Filter>;

@Schema()
export class Filter{
    @Prop()
    chain: ChainType;

    @Prop()
    eventType: EventType;

    @Prop()
    address: string;
}

export const FilterSchema = SchemaFactory.createForClass(Filter);