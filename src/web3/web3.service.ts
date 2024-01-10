// import {ethers} from 'ethers'
import { ethers } from 'ethers'
import { MockERC721__factory } from 'smart-contracts';
import { NftService } from '../nft/nft.service';
import { Injectable } from '@nestjs/common';
import { ChainType, EventType } from 'src/filter/schemas/filter.schema';
import { IndexerService } from 'src/indexer/indexer.service';

@Injectable()
export class Web3Service {
  private l1Provider: ethers.JsonRpcProvider;
  private l2Provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet; // This will hold the wallet derived from the private key

  constructor(
    private readonly nftService: NftService, 
    private readonly indexerService: IndexerService
  ) {
    // Initialize the provider with the Alchemy entrypoint
    this.l1Provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_ENDPOINT_L1 as string);
    this.l2Provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_ENDPOINT_L2 as string);

    // Get the wallet from the private key
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, this.l2Provider);
  }

  async isOwner(nftAddress: string, ownerAddress: string, token_id: number, ): Promise<boolean> {
    // Create a new contract instance
    const factory = new MockERC721__factory();
    const contract = new ethers.Contract(nftAddress, factory.interface, this.l1Provider);
    
    // Get the owner of the contract
    const owner = await contract.ownerOf(token_id);
    
    // Check if the owner address is the owner of the contract
    return owner.toLowerCase() === ownerAddress.toLowerCase();
  }

  async getNFTMetadata(nftAddress: string, tokenId: number): Promise<string> {

    // Create a new contract instance
    const factory = new MockERC721__factory();
    const contract = new ethers.Contract(nftAddress, factory.interface, this.l1Provider);
    
    // Get the token URI
    const tokenURI = await contract.tokenURI(tokenId);
    
    // Return the token URI
    return tokenURI;
  }

  async getNFTBaseURI(nftAddress: string): Promise<string> {
      
    // Create a new contract instance
    const factory = new MockERC721__factory();
    const contract = new ethers.Contract(nftAddress, factory.interface, this.l1Provider);
    
    // Get the token URI
    const tokenURI = await contract.getBaseURI();
    
    // Return the token URI
    return tokenURI;
  }

  async deploy(nftAddress: string, baseUri: string): Promise<string> {
    
    // Create a contract factory
    const mock721Factory = new MockERC721__factory(this.wallet);

    // Deploy the contract
    const facotry = await mock721Factory.deploy();
    const contractAddress = await facotry.getAddress();
    
    // Store into database
    await this.nftService.create(nftAddress, contractAddress as string);
    const contract = new ethers.Contract(contractAddress, facotry.interface, this.wallet);
    await contract.deployed();
    // Set the base URI
    await contract.setBaseURI(baseUri);
    // Tell the indexer to create new filters
    await this.indexerService.createFilter(ChainType.L1, EventType.Transfer, nftAddress);
    await this.indexerService.createFilter(ChainType.L2, EventType.Transfer, contractAddress);
    // Return the contract address
    return contractAddress;
  }

  async mintNFT(nftAddress: string, ownerAddress: string, tokenId: number): Promise<string> {
    // Get the contract address
    const contractAddress = await this.nftService.findOne(nftAddress);
    // Create a contract instance

    const factory = new MockERC721__factory(this.wallet);
    const contract = new ethers.Contract(contractAddress.l2Address, factory.interface, this.wallet);
    
    // Mint a new token
    const tx = await contract.mint(ownerAddress, tokenId);
    await tx.wait();

    // Return the transaction hash
    return tx.hash;
  }

  async setTokenURI(nftAddress: string, tokenId: number, tokenURI: string): Promise<string> {
    // Get the contract address
    const contractAddress = await this.nftService.findOne(nftAddress);
    // Create a contract instance
    const factory = new MockERC721__factory(this.wallet);
    const contract = new ethers.Contract(contractAddress.l2Address, factory.interface, this.wallet);
    
    // Set the token URI
    const tx = await contract.setTokenURI(tokenId, tokenURI);
    await tx.wait();

    // Return the transaction hash
    return tx.hash;
  }

  async getBlockNumber(): Promise<number> {
    const blockNumber = await this.l2Provider.getBlockNumber();
    return blockNumber;
  }
}