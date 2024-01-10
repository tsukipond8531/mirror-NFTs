import {Inject, Injectable} from "@nestjs/common";
import {Model} from "mongoose";
import { Block } from "./interfaces/block.interface";
import { ChainType } from "src/filter/schemas/filter.schema";
import { last } from "rxjs";

@Injectable()
export class BlockService {
    static blockModel: Model<Block>;
    constructor(@Inject('BLOCK_MODEL') private blockModel: Model<Block>) {
        const createdBlockL1 = new this.blockModel({
            chainType: ChainType.L1,
            blockNumber: 0
        });
        createdBlockL1.save();

        const createdBlockL2 = new this.blockModel({
            chainType: ChainType.L2,
            blockNumber: 0
        });
        createdBlockL2.save();
    }

    async create(chainType: ChainType, blockNumber: number): Promise<Block> {
        const createdBlock = new this.blockModel({
            chainType: chainType,
            blockNumber: blockNumber
        });   
        return createdBlock.save();
        
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
        const biggerThan = lastBlockNumber < blockNumber;

        if (biggerThan) {
            const updatedBlock = await this.blockModel.findOneAndUpdate(
                { chainType: chainType },
                { blockNumber: blockNumber },
                { new: false }
            );
            return updatedBlock.save();
        } else {
            throw new Error('Block number is smaller than the last block number');
        }
    }
}