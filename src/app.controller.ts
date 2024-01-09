import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { Web3Service } from './web3/web3.service';

@Controller('login')
export class AppController {
  nftService: any;
  constructor(
    private readonly appService: AppService,
    private readonly web3Service: Web3Service,
  ) {}

  @Get(':owner_address/:nft_address/:token_id')
  login(
    @Param('owner_address') owner_address: string, 
    @Param('nft_address') nft_address: string,
    @Param('token_id') token_id: number,
  ): any {

    const isOwner = this.web3Service.isOwner(nft_address, owner_address, token_id);

    if (isOwner) {
      this.web3Service.deployNFT(nft_address);
      const isDeployed = this.nftService.find(nft_address);
      if (isDeployed) {
        // Mint new token
        this.web3Service.mintNFT(nft_address, owner_address, token_id);
      } else {
        // Deploy new contract
        this.web3Service.deployNFT(nft_address);
      }
      return {
        "addr": owner_address,
        "owns": nft_address};
    } else {
      return {"error": "Not the owner of the NFT"};
    }
  }
}