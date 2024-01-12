import {Controller, Get, Inject, Param} from "@nestjs/common";
import { Web3Service } from "./web3.service";
import { NftService } from "src/nft/nft.service";
import { ChainType } from "src/filter/schemas/filter.schema";
import { Nft } from "src/nft/schemas/nft.schema";

const INVALID_CHAIN_TYPE = {
    statusCode: 400,
    body: JSON.stringify({
        message: "Invalid chain type",
    })

}

const UNSUPPORTED_FUNCTION = {
    statusCode: 400,
    body: JSON.stringify({
        message: "Unsupported function",
    })

}

function successfullResult(result: any): any {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Successfull",
            result: result,
        })
    }
}

@Controller('web3')
export class Web3Controller {

    constructor(
        @Inject('L1WebService') private readonly L1WebService: Web3Service,
        @Inject('L2WebService') private readonly L2WebService: Web3Service,
        private readonly nftService: NftService,
    ) {
    }

    getL1WebService(): Web3Service {
        return this.L1WebService;
    }

    getL2WebService(): Web3Service {
        return this.L2WebService;
    }

    @Get('isOwner/:chainType/:nftAddress/:tokenId/:ownerAddress')
    async isOwner(
        @Param('chainType') chainType: ChainType,
        @Param('nftAddress') nftAddress: string,
        @Param('tokenId') tokenId: number,
        @Param('ownerAddress') ownerAddress: string,
    ): Promise<any> {
        const [abi, webService] = await this._getProviderData(chainType, nftAddress);
        const supported = webService.supportsFunction(abi, 'ownerOf');

        if (abi && supported) {
            const isOwner = await webService.isOwner(nftAddress, abi, ownerAddress, tokenId);
            return successfullResult({owner: isOwner});
        } else if (!supported) {
            return UNSUPPORTED_FUNCTION;
        } else {
            return INVALID_CHAIN_TYPE;
        }
    }

    @Get('getNFTMetadata/:chainType/:nftAddress/:tokenId')
    async getNFTMetadata(
        @Param('chainType') chainType: ChainType,
        @Param('nftAddress') nftAddress: string,
        @Param('tokenId') tokenId: number,
    ): Promise<any> {
        const [abi, webService] = await this._getProviderData(chainType, nftAddress);
        const supported = webService.supportsFunction(abi, 'tokenURI');

        if (abi && supported) {
            const [_, tokenUri] = await webService.getNFTMetadata(nftAddress, abi, tokenId);
            return successfullResult({tokenUri: tokenUri});
        } else if (!supported) {
            return UNSUPPORTED_FUNCTION;
        } else {
            return INVALID_CHAIN_TYPE;
        }
    }

    @Get('baseURI/:chainType/:nftAddress')
    async getBaseURI(
        @Param('chainType') chainType: ChainType,
        @Param('nftAddress') nftAddress: string,
    ): Promise<any> {
        const [abi, webService] = await this._getProviderData(chainType, nftAddress);
        const supported = webService.supportsFunction(abi, 'baseURI');

        if (abi && supported) {
            const baseURI = await webService.getNFTBaseURI(nftAddress, abi);
            return successfullResult({baseURI: baseURI});
        } else if (!supported) {
            return UNSUPPORTED_FUNCTION;
        } else {
            return INVALID_CHAIN_TYPE;
        }
    }

    @Get('isMinted/:chainType/:nftAddress/:tokenId')
    async isMinted(
        @Param('chainType') chainType: ChainType,
        @Param('nftAddress') nftAddress: string,
        @Param('tokenId') tokenId: number,
    ): Promise<any> {
        const [abi, webService] = await this._getProviderData(chainType, nftAddress);
        if (abi) {
            const isMinted = await webService.isMinted(nftAddress, abi, tokenId);
            return successfullResult({isMinted: isMinted});
        } else {
            return INVALID_CHAIN_TYPE;
        }
    }

    @Get('mint/:chainType/:nftAddress/:tokenId/:ownerAddress')
    async mint(
        @Param('chainType') chainType: ChainType,
        @Param('nftAddress') nftAddress: string,
        @Param('tokenId') tokenId: number,
        @Param('ownerAddress') ownerAddress: string,
    ): Promise<any> {
        const [abi, webService] = await this._getProviderData(chainType, nftAddress);
        const supported = webService.supportsFunction(abi, 'mint');

        if (abi && supported) {
            await webService.mintNFT(nftAddress, abi, ownerAddress, tokenId);
            return successfullResult({tx: true});
        } else if (!supported) {
            return UNSUPPORTED_FUNCTION;
        } else {
            return INVALID_CHAIN_TYPE;
        }
    }

    @Get('setTokenURI/:chainType/:nftAddress/:tokenId/:tokenURI')
    async setTokenURI(
        @Param('chainType') chainType: ChainType,
        @Param('nftAddress') nftAddress: string,
        @Param('tokenId') tokenId: number,
        @Param('tokenURI') tokenURI: string,
    ): Promise<any> {
        const [abi, webService] = await this._getProviderData(chainType, nftAddress);
        const supported = webService.supportsFunction(abi, 'setTokenURI');
        if (abi && supported) {
            await webService.setTokenURI(nftAddress, abi, tokenId, tokenURI);
            return successfullResult({tx: true});
        } else if (!supported) {
            return UNSUPPORTED_FUNCTION;
        } else {
            return INVALID_CHAIN_TYPE;
        }
    }

    @Get('setBaseURI/:chainType/:nftAddress/:baseURI')
    async setBaseURI(
        @Param('chainType') chainType: ChainType,
        @Param('nftAddress') nftAddress: string,
        @Param('baseURI') baseURI: string,
    ): Promise<any> {
        const [abi, webService] = await this._getProviderData(chainType, nftAddress);
        const supported = webService.supportsFunction(abi, 'setBaseURI');
        if (abi && supported) {
            await webService.setBaseURI(nftAddress, abi, baseURI);
            return successfullResult({tx: true});
        } else if (!supported) {
            return UNSUPPORTED_FUNCTION;
        } else {
            return INVALID_CHAIN_TYPE;
        }
    }


    async _getProviderData(chainType: ChainType, nftAddress: string): Promise<[any[], Web3Service]> {
        var contracts: Nft;
        var webService: Web3Service;
        switch (chainType) {
            case ChainType.L1:
                contracts = await this.nftService.findOneByL1Address(nftAddress);
                webService = this.L1WebService;
                break;
            case ChainType.L2:
                contracts = await this.nftService.findOneByL1Address(nftAddress);
                webService = this.L2WebService;
                break;
            default:
                return null;
        }
        return [contracts.abi, webService];
    }
    
}