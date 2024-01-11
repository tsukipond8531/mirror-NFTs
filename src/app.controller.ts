import { Controller, Get, Param } from '@nestjs/common';
import { NftService } from './nft/nft.service';
import { Web3Controller } from './web3/web3.controller';
import { Web3Service } from './web3/web3.service';
import { FilterService } from './filter/filter.service';
import { ChainType, EventType } from './filter/schemas/filter.schema';

/**
 * Controller for handling login requests.
 */
@Controller()
export class AppController {
  private readonly L1WebService: Web3Service;
  private readonly L2WebService: Web3Service;

  constructor(
    private readonly web3Controller: Web3Controller,
    private readonly nftService: NftService,
    private readonly filterService: FilterService,
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
  @Get('login/:owner_address/:nft_address/:token_id')
  async login(
    @Param('owner_address') owner_address: string, 
    @Param('nft_address') nft_address: string,
    @Param('token_id') token_id: number,
  ): Promise<any> {

    const isOwner = this.L1WebService.isOwner(nft_address, owner_address, token_id);

    if (isOwner) {
      // TODO: Read nft metadata
      const [baseUri, tokenUri] = await this.L1WebService.getNFTMetadata(nft_address, token_id);
      // console.log(metadata);
      

      const isDeployed = await this.nftService.findOne(nft_address);
      var l2NftAddress: string;

      if (isDeployed) {
        // Check if token is minted
        const isMinted = await this.L2WebService.isMinted(nft_address, token_id);
        if (!isMinted) {
          // Mint new token
          console.log("Minting new token");
          await this.L2WebService.mintNFT(isDeployed.l2Address, owner_address, token_id);
          await this.L2WebService.setTokenURI(isDeployed.l2Address, token_id, tokenUri);
        }
      } else {
        // Deploy new contract
        console.log("Deploying new contract");
        l2NftAddress = await this.L2WebService.deploy(nft_address, baseUri);
        // Mint new token
        console.log("Minting new token");
        await this.L2WebService.mintNFT(l2NftAddress, owner_address, token_id);
        await this.L2WebService.setTokenURI(l2NftAddress, token_id, tokenUri);

        // Create filter for transfer event
        await this.filterService.create(ChainType.L1, EventType.Transfer, nft_address);
        // Create filter for session ended event
        await this.filterService.create(ChainType.L2, EventType.SessionEnded, l2NftAddress);
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Successfully logged in",
          result: {
            ownerAddress: owner_address,
            L1NftAddress: nft_address,
            L2NftAddress: l2NftAddress,
            tokenId: token_id,
          }
        }),
      };
    }
  }

  @Get('update/:L2NftAddress/:token_id')
  async updateL1Contract(
    @Param('L2NftAddress') L2NftAddress: string, 
    @Param('token_id') tokenId: number
  ) {
    // Get the L1 address of the NFT
    const L1Address = await this.nftService.findOneByL2Address(L2NftAddress);
    if (L1Address) {
      // Fetch the metadata from L2
      const [_, tokenUri] = await this.L2WebService.getNFTMetadata(L2NftAddress, tokenId);
      console.log(tokenUri);
      // Set the token URI
      await this.L1WebService.setTokenURI(L1Address.l1Address, tokenId, tokenUri);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Successfully updated L1 contract",
          result: {
            L2NftAddress: L2NftAddress,
            tokenId: tokenId,
            tokenUri: tokenUri,
          }
        }),
      }
    }
  }
}