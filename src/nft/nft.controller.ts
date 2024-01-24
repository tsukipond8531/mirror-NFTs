import {Controller, Get, Body, Post, Param, UseInterceptors, UploadedFile, UploadedFiles} from '@nestjs/common';
import {NftService} from './nft.service';
import {NftBody, Nft} from './interfaces/nft.interface';
import {ApiBody, ApiTags} from "@nestjs/swagger";
import { FileFieldsInterceptor } from '@nestjs/platform-express';

const SUCCESSFULL_RESULT = {
    statusCode: 200,
    body: JSON.stringify({
        message: "Successfull",
    })
}

/**
 * Controller for handling NFT operations.
 */
@ApiTags('nft')
@Controller('nft')
export class NftController {
    constructor(private readonly nftService: NftService) {}

    /**
     * Get all NFTs.
     * @returns A promise that resolves to an array of NFTs.
     */
    @Get()
    findAll(): Promise<Nft[]> {
        return this.nftService.findAll();
    }

    /**
     * Find a specific NFT by L1 address.
     * @param body - The request body containing the L1 address.
     * @returns A promise that resolves to the found NFT.
     */
    @Get(':l1_address')
    findOne(@Body() body: NftBody): Promise<Nft> {
        return this.nftService.findOneByL1Address(body.l1_address);
    }

    /**
     * Feed ABI and bytecode for an NFT.
     * @param l1Address - The L1 address of the NFT.
     * @param l2Address - The L2 address of the NFT.
     * @param files - The uploaded files containing the ABI and bytecode.
     * @returns A promise that resolves to the result of the operation.
     */
    @Post('feedAbi/:l1Address/:l2Address')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'abi', maxCount: 1 },
            { name: 'byteCode', maxCount: 1 },
        ]),
    )
    @ApiBody({ type: [String] })
    async feedAbi(
        @Param('l1Address') l1Address: string,
        @Param('l2Address') l2Address: string,
        @UploadedFiles() files: { abi?, byteCode? },
    ): Promise<any> {
        const abiContent = JSON.parse(files.abi[0].buffer.toString('utf8'));
        const byteCodeContent = files.byteCode[0].buffer.toString('utf8');

        const alreadyExists = await this.nftService.findOneByL1Address(l1Address);
        if (!alreadyExists) {
            await this.nftService.create(l1Address, l2Address, abiContent, byteCodeContent);
        } else {
            await this.nftService.updateAbi(l1Address, abiContent, byteCodeContent);
        }
        return SUCCESSFULL_RESULT;
    }
}
