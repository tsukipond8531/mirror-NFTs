import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import {CreateNftDto} from "./dto/create-nft.dto";
import {Nft} from "./interfaces/nft.interface";

@Injectable()
export class NftService {
    static nftModel: Model<Nft>;
    constructor(@Inject('NFT_MODEL') private nftModel: Model<Nft>) {}

    async create(l1Address: string, l2Address: string): Promise<Nft> {
        const alreadyExists = await this.nftModel.findOne({l1Address: l1Address}).exec();

        if (!alreadyExists) {
            const createdNft = new this.nftModel({l1Address, l2Address});   
            return createdNft.save();
        } else {
            return alreadyExists;
        }
    }

    async findAll(): Promise<Nft[]> {
        return this.nftModel.find().exec();
    }

    async findOne(l1Address: string): Promise<Nft> {
        return this.nftModel.findOne({l1Address: l1Address}).exec();
    }

    async findOneByL2Address(l2Address: string): Promise<Nft> {
        return this.nftModel.findOne({l2Address: l2Address}).exec();
    }
}