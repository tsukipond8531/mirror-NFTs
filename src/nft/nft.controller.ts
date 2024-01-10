import {Controller, Get, Post, Body} from '@nestjs/common';
import {NftService} from './nft.service';
import {NftBody, Nft} from './interfaces/nft.interface';

@Controller('nft')
export class NftController{
    constructor(private readonly nftService: NftService) {}

    @Get()
    findAll(): Promise<Nft[]> {
        return this.nftService.findAll();
    }

    @Get(':l1_address')
    findOne(@Body() body: NftBody): Promise<Nft> {
        return this.nftService.findOne(body.l1_address);
    }
}