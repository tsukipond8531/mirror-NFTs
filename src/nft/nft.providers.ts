import { Mongoose } from "mongoose";
import { NftSchema } from "./schemas/nft.schema";

export const nftProviders = [
    {
        provide: 'NFT_MODEL',
        useFactory: (mongoose: Mongoose) => mongoose.model('Nft', NftSchema),
        inject: ['DATABASE_CONNECTION'],
    },
];