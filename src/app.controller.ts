import { Controller, Get, Param } from '@nestjs/common';
import { Web3Service } from './web3/web3.service';
import { NftService } from './nft/nft.service';

@Controller('login')
export class AppController {
  constructor(
    private readonly web3Service: Web3Service,
    private readonly nftService: NftService,
  ) {}

  @Get(':owner_address/:nft_address/:token_id')
  async login(
    @Param('owner_address') owner_address: string, 
    @Param('nft_address') nft_address: string,
    @Param('token_id') token_id: number,
  ): Promise<any> {

    const isOwner = this.web3Service.isOwner(nft_address, owner_address, token_id);

    if (isOwner) {
      const isDeployed = await this.nftService.findOne(nft_address);
    
      if (isDeployed) {
        // Mint new token
        console.log("Minting new token");
        await this.web3Service.mintNFT(nft_address, owner_address, token_id);
      } else {
        // Deploy new contract
        console.log("Deploying new contract");
        await this.web3Service.deployNFT(nft_address);
      }
      return {
        "addr": owner_address,
        "owns": nft_address};
    } else {
      return {"error": "Not the owner of the NFT"};
    }
  }
}