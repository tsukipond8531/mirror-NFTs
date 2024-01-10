import {Inject, Injectable} from "@nestjs/common";
import {Model} from "mongoose";
import { Block } from "./interfaces/block.interface";
import { ChainType } from "src/filter/schemas/filter.schema";

/**
 * Service for managing blocks.
 */
@Injectable()
export class BlockService {
    static blockModel: Model<Block>;

    /**
     * Constructs a new BlockService.
     * @param blockModel The block model.
     */
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

    /**
     * Creates a new block.
     * @param chainType The chain type of the block.
     * @param blockNumber The block number.
     * @returns The created block.
     */
    async create(chainType: ChainType, blockNumber: number): Promise<Block> {
        const createdBlock = new this.blockModel({
            chainType: chainType,
            blockNumber: blockNumber
        });   
        return createdBlock.save();
    }

    /**
     * Finds a block by chain type.
     * @param chainType The chain type.
     * @returns The found block.
     */
    async find(chainType: ChainType): Promise<Block> {
        return this.blockModel.findOne({chainType}).exec();
    }

    /**
     * Finds all blocks.
     * @returns An array of blocks.
     */
    async findAll(): Promise<Block[]> {
        return this.blockModel.find().exec();
    }

    /**
     * Updates a block's block number if it is bigger than the last block number.
     * @param chainType The chain type of the block.
     * @param blockNumber The new block number.
     * @returns The updated block.
     * @throws Error if the block number is smaller than the last block number.
     */
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