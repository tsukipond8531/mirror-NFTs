import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import {CreateNftDto} from "./dto/create-nft.dto";
import {Nft} from "./interfaces/nft.interface";

/**
 * Service class for managing NFTs.
 */
@Injectable()
export class NftService {
    static nftModel: Model<Nft>;
    constructor(@Inject('NFT_MODEL') private nftModel: Model<Nft>) {}

    /**
     * Creates a new NFT with the given L1 and L2 addresses.
     * If an NFT with the same L1 address already exists, it returns the existing NFT.
     * @param l1Address The L1 address of the NFT.
     * @param l2Address The L2 address of the NFT.
     * @returns The created or existing NFT.
     */
    async create(l1Address: string, l2Address: string): Promise<Nft> {
        const alreadyExists = await this.nftModel.findOne({l1Address: l1Address}).exec();

        if (!alreadyExists) {
            const createdNft = new this.nftModel({l1Address, l2Address});   
            return createdNft.save();
        } else {
            return alreadyExists;
        }
    }

    /**
     * Retrieves all NFTs.
     * @returns An array of NFTs.
     */
    async findAll(): Promise<Nft[]> {
        return this.nftModel.find().exec();
    }

    /**
     * Retrieves an NFT by its L1 address.
     * @param l1Address The L1 address of the NFT.
     * @returns The found NFT, or null if not found.
     */
    async findOne(l1Address: string): Promise<Nft> {
        return this.nftModel.findOne({l1Address: l1Address}).exec();
    }

    /**
     * Retrieves an NFT by its L2 address.
     * @param l2Address The L2 address of the NFT.
     * @returns The found NFT, or null if not found.
     */
    async findOneByL2Address(l2Address: string): Promise<Nft> {
        return this.nftModel.findOne({l2Address: l2Address}).exec();
    }
}