import {Inject, Injectable} from "@nestjs/common";
import {Model} from "mongoose";
import { Block } from "./interfaces/block.interface";
import { ChainType } from "src/filter/schemas/filter.schema";

@Injectable()
export class BlockService {
    static blockModel: Model<Block>;
    constructor(@Inject('BLOCK_MODEL') private blockModel: Model<Block>) {}

    async create(chainType: ChainType, blockNumber: number): Promise<Block> {
        // Check if blockNumber is bigger than the last blockNumber
        const biggerThan = (await this.find(chainType)).blockNumber < blockNumber; ;

        if (!biggerThan) {
            const createdBlock = new this.blockModel({blockNumber});   
            return createdBlock.save();
        } else {
            throw new Error('Block number is smaller than the last block number');
        }
    }

    async find(chainType: ChainType): Promise<Block> {
        return this.blockModel.findOne({chainType}).exec();
    }

    async findAll(): Promise<Block[]> {
        return this.blockModel.find().exec();
    }

    async update(chainType: ChainType, blockNumber: number): Promise<Block> {
        // Check if blockNumber is bigger than the last blockNumber
        const lastBlockNumber = (await this.find(chainType)).blockNumber;
        const biggerThan = lastBlockNumber < blockNumber; ;

        if (biggerThan) {
            const updatedBlock = await this.blockModel.findOneAndUpdate(
                {chainType, lastBlockNumber}, 
                {chainType, blockNumber}, 
                {new: true}
            );
            return updatedBlock.save();
        } else {
            throw new Error('Block number is smaller than the last block number');
        }
    }
}