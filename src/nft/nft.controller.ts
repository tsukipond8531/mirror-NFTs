import {Controller, Get, Body, Post, Param, UseInterceptors, UploadedFile} from '@nestjs/common';
import {NftService} from './nft.service';
import {NftBody, Nft} from './interfaces/nft.interface';
import {ApiBody, ApiTags} from "@nestjs/swagger";
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';

const SUCCESSFULL_RESULT = {
    statusCode: 200,
    body: JSON.stringify({
        message: "Successfull",
    })
}

@ApiTags('nft')
@Controller('nft')
export class NftController{
    constructor(private readonly nftService: NftService) {}

    @Get()
    findAll(): Promise<Nft[]> {
        return this.nftService.findAll();
    }

    @Get(':l1_address')
    findOne(@Body() body: NftBody): Promise<Nft> {
        return this.nftService.findOneByL1Address(body.l1_address);
    }

    @Post('feedAbi/:l1Address/:l2Address')
    @UseInterceptors(FileInterceptor('abi'))
    @UseInterceptors(FileInterceptor('byteCode'))
    @ApiBody({type: [String]})
    async feedAbi(
        @Param('l1Address') l1Address: string,
        @Param('l2Address') l2Address: string,
        @UploadedFile() abi,
        @UploadedFile() byteCode,
    ): Promise<any> {
        const abiContent = JSON.parse(abi.buffer.toString('utf8'));
        const byteCodeContent = byteCode.buffer.toString('utf8');
        const alreadyExists = await this.nftService.findOneByL1Address(l1Address);
        if (!alreadyExists) {
            await this.nftService.create(l1Address, l2Address, abiContent);
        } else {
            await this.nftService.updateAbi(l1Address, abiContent, abiContent);
        }
        return SUCCESSFULL_RESULT;
    }
}
