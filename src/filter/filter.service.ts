import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import {Filter} from "./interfaces/filter.interface";
import { ChainType, EventType } from "./schemas/filter.schema";

@Injectable()
export class FilterService {
    static filterModel: Model<Filter>;
    constructor(@Inject('FILTER_MODEL') private filterModel: Model<Filter>) {}

    async create(chainType: ChainType, eventType: EventType, contractAddress: string): Promise<Filter> {
        // TODO check if filter already exists
        const filterExists = await this.filterModel.findOne({
            chain: chainType, 
            eventType: eventType, 
            address: contractAddress, 
        }).exec();
        if (!filterExists) {
            const createdFilter = new this.filterModel({
                chain: chainType, 
                eventType: eventType, 
                address: contractAddress, 
            });   
            return createdFilter.save();
        } else {
            return filterExists;
        }
    }

    async findAll(): Promise<Filter[]> {
        return this.filterModel.find().exec();
    }

    async findAllByChain(chainType: ChainType): Promise<Filter[]> {
        return this.filterModel.find({chain: chainType}).exec();
    }

    async findOne(eventType: EventType, contractAddress: string): Promise<Filter> {
        return await this.filterModel.findOne({
            eventType: eventType, 
            address: contractAddress, 
        }).exec();
    }
}