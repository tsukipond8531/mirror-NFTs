// import {ethers} from 'ethers'
import { ethers } from 'ethers'
import { MockERC721__factory } from 'smart-contracts';
import { NftService } from '../nft/nft.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Web3Service {
  private l1Provider: ethers.JsonRpcProvider;
  private l2Provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet; // This will hold the wallet derived from the private key

  constructor(private readonly nftService: NftService) {
    // Initialize the provider with the Alchemy entrypoint
    this.l1Provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_ENDPOINT_L1 as string);
    this.l2Provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_ENDPOINT_L2 as string);

    // Get the wallet from the private key
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, this.l2Provider);
  }

  async isOwner(nftAddress: string, ownerAddress: string, token_id: number): Promise<boolean> {
    // Create a new contract instance
    const contract = new MockERC721__factory(this.wallet).attach(nftAddress);
  
    // Get the owner of the contract
    const owner = await contract.ownerOf(token_id);
    
    // Check if the owner address is the owner of the contract
    return owner.toLowerCase() === ownerAddress.toLowerCase();
  }

  async deployNFT(nftAddress: string): Promise<string> {
    
    // Create a contract factory
    const mock721Factory = new MockERC721__factory(this.wallet);

    // Deploy the contract
    const contract = await mock721Factory.deploy();
    const contractAddress = await contract.getAddress();
    
    // Store into database
    await this.nftService.create(nftAddress, contractAddress as string); // Call the create method on the instance

    // Return the contract address
    return contractAddress;
  }

  async mintNFT(nftAddress: string, ownerAddress: string, tokenId: number): Promise<string> {
    // Get the contract address
    const contractAddress = await this.nftService.findOne(nftAddress);

    // Create a contract instance
    const contract = new MockERC721__factory(this.wallet).attach(contractAddress.l2Address);
    // Mint a new token
    const tx = await contract.mint(ownerAddress, tokenId);
    await tx.wait();

    // Return the transaction hash
    return tx.hash;
  }
}