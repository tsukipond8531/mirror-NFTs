import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import {Filter} from "./interfaces/filter.interface";
import { ChainType, EventType } from "./schemas/filter.schema";

/**
 * Service class for managing filters.
 */
@Injectable()
export class FilterService {
    static filterModel: Model<Filter>;

    /**
     * Constructs a new FilterService instance.
     * @param filterModel The filter model injected dependency.
     */
    constructor(@Inject('FILTER_MODEL') private filterModel: Model<Filter>) {}

    /**
     * Creates a new filter.
     * @param chainType The chain type.
     * @param eventType The event type.
     * @param contractAddress The contract address.
     * @returns A promise that resolves to the created filter.
     */
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

    /**
     * Retrieves all filters.
     * @returns A promise that resolves to an array of filters.
     */
    async findAll(): Promise<Filter[]> {
        return this.filterModel.find().exec();
    }

    /**
     * Retrieves all filters by chain type.
     * @param chainType The chain type.
     * @returns A promise that resolves to an array of filters.
     */
    async findAllByChain(chainType: ChainType): Promise<Filter[]> {
        return this.filterModel.find({chain: chainType}).exec();
    }

    /**
     * Retrieves a filter by event type and contract address.
     * @param eventType The event type.
     * @param contractAddress The contract address.
     * @returns A promise that resolves to the filter.
     */
    async findOne(eventType: EventType, contractAddress: string): Promise<Filter> {
        return await this.filterModel.findOne({
            eventType: eventType, 
            address: contractAddress, 
        }).exec();
    }

    async deleteFilter(filter: Filter) {
        await this.filterModel.deleteOne({filter}).exec();
    }
}