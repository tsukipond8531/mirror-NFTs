import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { HydratedDocument} from 'mongoose';

export type BlockDocument = HydratedDocument<Block>;

@Schema()
export class Block{
    @Prop()
    blockNumber: number;
}

export const BlockSchema = SchemaFactory.createForClass(Block);