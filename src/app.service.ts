import { Injectable } from '@nestjs/common';
import { Web3Controller } from './web3/web3.controller';
import { NftService } from './nft/nft.service';
import { FilterService } from './filter/filter.service';
import { ScannerService } from './scanner/scanner.service';
import { Web3Service } from './web3/web3.service';
import { ChainType, EventType } from './filter/schemas/filter.schema';

function successfullResult(result: any): any {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Successfull",
            result: result,
        })
    }
  }

@Injectable()
export class AppService {
    private readonly L1WebService: Web3Service;
    private readonly L2WebService: Web3Service;
    
    constructor(
        private readonly web3Controller: Web3Controller,
        private readonly nftService: NftService,
        private readonly filterService: FilterService,
        private readonly scannerService: ScannerService,
    ) {
        this.L1WebService = this.web3Controller.getL1WebService();
        this.L2WebService = this.web3Controller.getL2WebService();
    }

    async mirrorToken(ownerAddress: string, nftAddress: string, tokenId: number): Promise<any> {
        const isDeployed = await this.nftService.findOneByL1Address(nftAddress);
        const L2NftContract = isDeployed.l2Address;
        if (isDeployed) {
            const isOwner = this.L1WebService.isOwner(nftAddress, isDeployed.abi, ownerAddress, tokenId);
        
            if (isOwner) {
                const [_, tokenUri] = await this.L1WebService.getNFTMetadata(nftAddress, isDeployed.abi, tokenId);        
                // Check if token is minted
                const isMinted = await this.L2WebService.isMinted(L2NftContract, isDeployed.abi, tokenId);
                if (!isMinted) {
                // Mint new token
                console.log("Minting new token");
                await this.L2WebService.mintNFT(L2NftContract, isDeployed.abi, ownerAddress, tokenId);
                await this.L2WebService.setTokenURI(L2NftContract, isDeployed.abi, tokenId, tokenUri);
                }
            }  
            return successfullResult({
                ownerAddress: ownerAddress,
                L1NftAddress: nftAddress,
                L2NftAddress: L2NftContract,
                tokenId: tokenId,
            });
        }
    }

    async updateL1Contract(L2NftAddress: string, tokenId: number) {
        const contracts = await this.nftService.findOneByL2Address(L2NftAddress);
        if (contracts) {
            const [_, tokenUri] = await this.L2WebService.getNFTMetadata(L2NftAddress, contracts.abi, tokenId);
            console.log(tokenUri);

            await this.L1WebService.setTokenURI(
                contracts.l1Address, 
                contracts.abi, 
                tokenId, 
                tokenUri
            );
            return successfullResult({
                L2NftAddress: L2NftAddress,
                tokenId: tokenId,
                tokenUri: tokenUri,
              });
        }
    }

    async mirrorContract(nftAddress: string, constructorArgs: any[]) {
        // TODO: Fetch contract bytecode from database
        const nftContract = await this.nftService.findOneByL1Address(nftAddress);
        var abi;
        var byteCode;

        if (!nftContract.byteCode) {
            byteCode = await this.L1WebService.getByteCode(nftAddress);
            abi = await this.scannerService.getAbi(nftAddress);
        } else {
            byteCode  = nftContract.byteCode;
            abi = nftContract.abi;
        }
        // Deploy the contract on L2
        const l2Address = await this.L2WebService.deployFromByteCode(
            abi,
            byteCode,
            constructorArgs,
        );
        // Save the L1 and L2 address
        await this.nftService.create(nftAddress, l2Address, abi, byteCode);
        // Create filter for transfer event
        await this.filterService.create(ChainType.L1, EventType.Transfer, nftAddress);
        
        return successfullResult({
            L1Address: nftAddress,
            L2Address: l2Address,
        });
    };
}

