import { Mongoose } from "mongoose";
import { BlockSchema } from "./schemas/block.schema";

export const blockProviders = [
    {
        provide: 'BLOCK_MODEL',
        useFactory: (mongoose: Mongoose) => mongoose.model('Block', BlockSchema),
        inject: ['DATABASE_CONNECTION'],
    },
];