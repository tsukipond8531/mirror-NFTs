import {Inject, Injectable} from "@nestjs/common";
import {Model} from "mongoose";
import { Block } from "./interfaces/block.interface";

@Injectable()
export class BlockService {
    static blockModel: Model<Block>;
    constructor(@Inject('BLOCK_MODEL') private blockModel: Model<Block>) {}

    async create(blockNumber: number): Promise<Block> {
        // Check if blockNumber is bigger than the last blockNumber
        const biggerThan = (await this.findAll()).blockNumber < blockNumber; ;

        if (!biggerThan) {
            const createdBlock = new this.blockModel({blockNumber});   
            return createdBlock.save();
        } else {
            throw new Error('Block number is smaller than the last block number');
        }
    }

    async findAll(): Promise<Block> {
        return this.blockModel.find().exec()[-1];
    }
}