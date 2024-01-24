import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { HydratedDocument} from 'mongoose';
import { ChainType } from 'src/filter/schemas/filter.schema';

export type BlockDocument = HydratedDocument<Block>;

@Schema()
export class Block{
    @Prop()
    blockNumber: number;

    @Prop()
    chainType: ChainType;
}

export const BlockSchema = SchemaFactory.createForClass(Block);