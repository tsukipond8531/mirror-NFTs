import { ethers } from 'ethers'
import { NftService } from '../nft/nft.service';
import { Injectable } from '@nestjs/common';
import { ChainType, EventType } from 'src/filter/schemas/filter.schema';
import { IndexerService } from 'src/indexer/indexer.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Web3Service {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contractTarget: any;

  constructor(
    private readonly nftService: NftService, 
    private readonly indexerService: IndexerService,
    private readonly configService: ConfigService,
  ) {
    // Get the wallet from the private key
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  setProvider(endpoint: string): void {
    // Create a new provider
    this.provider = new ethers.JsonRpcProvider(endpoint);
  }

  setContractTarget(contractTarget: any) {
    this.contractTarget = contractTarget;
  }

  async isOwner(nftAddress: string, ownerAddress: string, token_id: number, ): Promise<boolean> {
    // Create a new contract instance
    const factory = new this.contractTarget();
    const contract = new ethers.Contract(nftAddress, factory.interface, this.provider);
    
    // Get the owner of the contract
    const owner = await contract.ownerOf(token_id);
    
    // Check if the owner address is the owner of the contract
    return owner.toLowerCase() === ownerAddress.toLowerCase();
  }

  async getNFTMetadata(nftAddress: string, tokenId: number): Promise<string> {

    // Create a new contract instance
    const factory = new this.contractTarget();
    const contract = new ethers.Contract(nftAddress, factory.interface, this.provider);
    
    // Get the token URI
    const tokenURI = await contract.tokenURI(tokenId);
    
    // Return the token URI
    return tokenURI;
  }

  async getNFTBaseURI(nftAddress: string): Promise<string> {
      
    // Create a new contract instance
    const factory = new this.contractTarget();
    const contract = new ethers.Contract(nftAddress, factory.interface, this.provider);
    
    // Get the token URI
    const tokenURI = await contract.getBaseURI();
    
    // Return the token URI
    return tokenURI;
  }

  async deploy(nftAddress: string, baseUri: string): Promise<string> {
    
    // Create a contract factory
    const factory = new this.contractTarget(this.wallet);

    // Deploy the contract
    const facotry = await factory.deploy();
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

    const factory = new this.contractTarget(this.wallet);
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
    const factory = new this.contractTarget(this.wallet);
    const contract = new ethers.Contract(contractAddress.l2Address, factory.interface, this.wallet);
    
    // Set the token URI
    const tx = await contract.setTokenURI(tokenId, tokenURI);
    await tx.wait();

    // Return the transaction hash
    return tx.hash;
  }

  async getBlockNumber(): Promise<number> {
    const blockNumber = await this.provider.getBlockNumber();
    return blockNumber;
  }
}