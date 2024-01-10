import { Controller, Get, Param } from '@nestjs/common';
import { NftService } from './nft/nft.service';
import { Web3Controller } from './web3/web3.controller';
import { MirrorERC721__factory, MockERC721__factory } from 'smart-contracts';
import { Web3Service } from './web3/web3.service';

@Controller('login')
export class AppController {
  private readonly L1WebService: Web3Service;
  private readonly L2WebService: Web3Service;

  constructor(
    private readonly web3Controller: Web3Controller,
    private readonly nftService: NftService,
  ) {
    this.L1WebService = this.web3Controller.getL1WebService();
    const MockContractModule = MockERC721__factory;
    this.L1WebService.setContractTarget(MockContractModule);

    this.L2WebService = this.web3Controller.getL2WebService();
    const mirrorContractModule = MirrorERC721__factory;
    this.L2WebService.setContractTarget(mirrorContractModule);
  }

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
      
      if (isDeployed) {
        // Mint new token
        console.log("Minting new token");
        await this.L2WebService.mintNFT(nft_address, owner_address, token_id);
        await this.L2WebService.setTokenURI(nft_address, token_id, tokenUri);
      } else {
        // Deploy new contract
        console.log("Deploying new contract");
        const newContractAddress = await this.L2WebService.deploy(nft_address, baseUri);
        // Mint new token
        console.log("Minting new token");
        await this.L2WebService.mintNFT(newContractAddress, owner_address, token_id);
        await this.L2WebService.setTokenURI(newContractAddress, token_id, tokenUri);
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