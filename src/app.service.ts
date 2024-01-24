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
/**
 * Service class for handling application logic related to NFT mirroring.
 */
export class AppService {
    private readonly L1WebService: Web3Service;
    private readonly L2WebService: Web3Service;
    
    /**
     * Creates an instance of the AppService class.
     * @param web3Controller - The Web3Controller instance.
     * @param nftService - The NftService instance.
     * @param filterService - The FilterService instance.
     * @param scannerService - The ScannerService instance.
     */
    constructor(
        private readonly web3Controller: Web3Controller,
        private readonly nftService: NftService,
        private readonly filterService: FilterService,
        private readonly scannerService: ScannerService,
    ) {
        this.L1WebService = this.web3Controller.getL1WebService();
        this.L2WebService = this.web3Controller.getL2WebService();
    }

    /**
     * Mirrors a token from Layer 1 to Layer 2 blockchain.
     * 
     * @param ownerAddress - The address of the token owner.
     * @param nftAddress - The address of the NFT contract on Layer 1.
     * @param tokenId - The ID of the token to be mirrored.
     * @returns A Promise that resolves to the result of the mirroring operation.
     */
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

    /**
     * Updates the L1 contract with the token URI from the L2 contract.
     * @param L2NftAddress The address of the L2 contract.
     * @param tokenId The ID of the token.
     * @returns A successful result object containing the L2NftAddress, tokenId, and tokenUri.
     */
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

    /**
     * Mirrors a contract from Layer 1 (L1) to Layer 2 (L2).
     * 
     * @param nftAddress The address of the NFT contract on Layer 1.
     * @param constructorArgs The arguments to be passed to the contract constructor.
     * @returns A successful result object containing the Layer 1 address and Layer 2 address of the mirrored contract.
     */
    async mirrorContract(nftAddress: string, constructorArgs: any[]) {
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

