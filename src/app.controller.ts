import { Controller, Get, Param } from '@nestjs/common';
import { Web3Service } from './web3/web3.service';
import { NftService } from './nft/nft.service';

@Controller('login')
export class AppController {
  constructor(
    private readonly web3Service: Web3Service,
    private readonly nftService: NftService,
  ) {
    // TODO: Create two instances of the provider, one for L1 and one for L2
    // With this I should be able to handle both networks without writing more functions
  }

  @Get(':owner_address/:nft_address/:token_id')
  async login(
    @Param('owner_address') owner_address: string, 
    @Param('nft_address') nft_address: string,
    @Param('token_id') token_id: number,
  ): Promise<any> {

    const isOwner = this.web3Service.isOwner(nft_address, owner_address, token_id);

    if (isOwner) {
      // TODO: Read nft metadata
      const metadata = await this.web3Service.getNFTMetadata(nft_address, token_id);
      // console.log(metadata);
      const [baseUri, tokenUri] = metadata.split("/");

      const isDeployed = await this.nftService.findOne(nft_address);
      
      if (isDeployed) {
        // Mint new token
        console.log("Minting new token");
        await this.web3Service.mintNFT(nft_address, owner_address, token_id);
        await this.web3Service.setTokenURI(nft_address, token_id, tokenUri);
      } else {
        // Deploy new contract
        console.log("Deploying new contract");
        const newContractAddress = await this.web3Service.deploy(nft_address, baseUri);
        // Mint new token
        console.log("Minting new token");
        await this.web3Service.mintNFT(newContractAddress, owner_address, token_id);
        await this.web3Service.setTokenURI(newContractAddress, token_id, tokenUri);
      }
      return {
        "addr": owner_address,
        "owns": nft_address,
        "token": token_id,
      };
    } else {
      return {"error": "Not the owner of the NFT"};
    }
  }
}