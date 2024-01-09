import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import {CreateNftDto} from "./dto/create-nft.dto";
import {Nft} from "./interfaces/nft.interface";

@Injectable()
export class NftService {
    static nftModel: Model<Nft>;
    constructor(@Inject('NFT_MODEL') private nftModel: Model<Nft>) {}

    async create(l1Address: string, l2Address: string): Promise<Nft> {
        const createdNft = new this.nftModel({l1Address, l2Address});
        return createdNft.save();
    }

    async findAll(): Promise<Nft[]> {
        return this.nftModel.find().exec();
    }

    async findOne(l1_address: string): Promise<Nft> {
        return this.nftModel.findOne({ l1_address: l1_address });
    }
}