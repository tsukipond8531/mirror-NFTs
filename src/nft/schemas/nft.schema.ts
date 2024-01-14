import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { HydratedDocument} from 'mongoose';

export type NftDocument = HydratedDocument<Nft>;

@Schema()
export class Nft{
    @Prop()
    l1Address: string;

    @Prop()
    l2Address: string;

    @Prop()
    abi: any[];

    @Prop()
    byteCode: string;
}

export const NftSchema = SchemaFactory.createForClass(Nft);