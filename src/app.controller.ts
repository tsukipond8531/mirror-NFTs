import { Controller, Get, Param } from '@nestjs/common';
import { NftService } from './nft/nft.service';
import { Web3Controller } from './web3/web3.controller';
import { Web3Service } from './web3/web3.service';
import { FilterService } from './filter/filter.service';
import { ChainType, EventType } from './filter/schemas/filter.schema';

/**
 * Controller for handling login requests.
 */
@Controller('login')
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
  @Get(':owner_address/:nft_address/:token_id')
  async login(
    @Param('owner_address') owner_address: string, 
    @Param('nft_address') nft_address: string,
    @Param('token_id') token_id: number,
  ): Promise<any> {

    const isOwner = this.L1WebService.isOwner(nft_address, owner_address, token_id);

    if (isOwner) {
      // TODO: Read nft metadata
      const metadata = await this.L1WebService.getNFTMetadata(nft_address, token_id);
      // console.log(metadata);
      const [baseUri, tokenUri] = metadata.split("/");

      const isDeployed = await this.nftService.findOne(nft_address);
      var l2NftAddress: string;

      if (isDeployed) {
        // Check if token is minted
        const isMinted = await this.L2WebService.isMinted(nft_address, token_id);
        if (!isMinted) {
          // Mint new token
          console.log("Minting new token");
          l2NftAddress = await this.L2WebService.mintNFT(nft_address, owner_address, token_id);
          await this.L2WebService.setTokenURI(nft_address, token_id, tokenUri);
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
      }

      // Create filter for session ended event
      await this.filterService.create(ChainType.L2, EventType.SessionEnded, l2NftAddress);
      
      return {
        "addr": owner_address,
        "l1Owns": nft_address,
        "l2Owns": l2NftAddress,
        "token": token_id,
      };
    } else {
      return {"error": "Not the owner of the NFT"};
    }
  }
}