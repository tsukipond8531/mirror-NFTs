import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { NftService } from './nft/nft.service';
import { Web3Controller } from './web3/web3.controller';
import { Web3Service } from './web3/web3.service';
import { FilterService } from './filter/filter.service';
import { ChainType, EventType } from './filter/schemas/filter.schema';
import { ScannerService } from './scanner/scanner.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';

function successfullResult(result: any): any {
  return {
      statusCode: 200,
      body: JSON.stringify({
          message: "Successfull",
          result: result,
      })
  }
}

/**
 * Controller for handling login requests.
 */
@Controller()
@ApiTags('app')
export class AppController {
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

  /**
   * Handles the login request.
   * @param owner_address - The address of the owner.
   * @param nft_address - The address of the NFT.
   * @param token_id - The ID of the token.
   * @returns A Promise that resolves to the login response.
   */
  @Get('mirrorToken/:owner_address/:nft_address/:token_id')
  async mirrorToken(
    @Param('owner_address') owner_address: string, 
    @Param('nft_address') nft_address: string,
    @Param('token_id') token_id: number,
  ): Promise<any> {
    const isDeployed = await this.nftService.findOneByL1Address(nft_address);
    const L2NftContract = isDeployed.l2Address;
    if (isDeployed) {
      const isOwner = this.L1WebService.isOwner(nft_address, isDeployed.abi, owner_address, token_id);
      
      if (isOwner) {
        const [_, tokenUri] = await this.L1WebService.getNFTMetadata(nft_address, isDeployed.abi, token_id);        
        // Check if token is minted
        const isMinted = await this.L2WebService.isMinted(L2NftContract, isDeployed.abi, token_id);
        if (!isMinted) {
          // Mint new token
          console.log("Minting new token");
          await this.L2WebService.mintNFT(L2NftContract, isDeployed.abi, owner_address, token_id);
          await this.L2WebService.setTokenURI(L2NftContract, isDeployed.abi, token_id, tokenUri);
        }
      }  
      return successfullResult({
        ownerAddress: owner_address,
        L1NftAddress: nft_address,
        L2NftAddress: L2NftContract,
        tokenId: token_id,
      });
    }
  }

  @Get('update/:L2NftAddress/:token_id')
  async updateL1Contract(
    @Param('L2NftAddress') L2NftAddress: string, 
    @Param('token_id') tokenId: number
  ) {
    // Get the L1 address of the NFT
    const constracts = await this.nftService.findOneByL2Address(L2NftAddress);
    if (constracts) {
      // Fetch the metadata from L2
      const [_, tokenUri] = await this.L2WebService.getNFTMetadata(
        L2NftAddress, 
        constracts.abi, 
        tokenId
      );
      console.log(tokenUri);
      // Set the token URI
      await this.L1WebService.setTokenURI(
        constracts.l1Address, 
        constracts.abi, 
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

  @Post('mirrorContract/:nftAddress')
  @ApiBody({type: Object})
  async mirrorContract(
    @Param('nftAddress') nftAddress: string,
    @Body('constructorArgs') constructorArgs: any[],
  ) {
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