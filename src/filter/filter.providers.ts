import { Mongoose } from "mongoose";
import { FilterSchema } from "./schemas/filter.schema";

export const filterProviders = [
    {
        provide: 'FILTER_MODEL',
        useFactory: (mongoose: Mongoose) => mongoose.model('Filter', FilterSchema),
        inject: ['DATABASE_CONNECTION'],
    },
];