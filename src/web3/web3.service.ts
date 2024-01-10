import { ethers } from 'ethers'
import { NftService } from '../nft/nft.service';
import { Injectable } from '@nestjs/common';
import { ChainType, EventType } from 'src/filter/schemas/filter.schema';
import { ConfigService } from '@nestjs/config';
import { FilterService } from 'src/filter/filter.service';

/**
 * Service for interacting with the Web3 provider and smart contracts.
 */
@Injectable()
export class Web3Service {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contractTarget: any;

  constructor(
    private readonly nftService: NftService, 
    private readonly filterService: FilterService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Set the Web3 provider endpoint.
   * @param endpoint The endpoint URL of the Web3 provider.
   */
  setProvider(endpoint: string): void {
    // Create a new provider
    this.provider = new ethers.JsonRpcProvider(endpoint);
    // Get the wallet from the private key
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Set the target contract for interacting with smart contracts.
   * @param contractTarget The target contract.
   */
  setContractTarget(contractTarget: any) {
    this.contractTarget = contractTarget;
  }

  /**
   * Get the contract instance from the contract address.
   * @param contractAddress The address of the contract.
   * @returns The contract instance.
   */
  getContractFromAddress(contractAddress: string): ethers.Contract {
    const factory = new this.contractTarget();
    return new ethers.Contract(contractAddress, factory.interface, this.provider);
  }

  /**
   * Check if the given address is the owner of the NFT.
   * @param nftAddress The address of the NFT contract.
   * @param ownerAddress The address to check ownership against.
   * @param token_id The ID of the token.
   * @returns A promise that resolves to a boolean indicating ownership.
   */
  async isOwner(nftAddress: string, ownerAddress: string, token_id: number, ): Promise<boolean> {
    // Create a new contract instance
    const factory = new this.contractTarget();
    const contract = new ethers.Contract(nftAddress, factory.interface, this.provider);
    
    // Get the owner of the contract
    const owner = await contract.ownerOf(token_id);
    
    // Check if the owner address is the owner of the contract
    return owner.toLowerCase() === ownerAddress.toLowerCase();
  }

  /**
   * Get the metadata of the NFT.
   * @param nftAddress The address of the NFT contract.
   * @param tokenId The ID of the token.
   * @returns A promise that resolves to the metadata of the NFT.
   */
  async getNFTMetadata(nftAddress: string, tokenId: number): Promise<string> {

    // Create a new contract instance
    const factory = new this.contractTarget();
    const contract = new ethers.Contract(nftAddress, factory.interface, this.provider);
    
    // Get the token URI
    const tokenURI = await contract.tokenURI(tokenId);
    
    // Return the token URI
    return tokenURI;
  }

  /**
   * Get the base URI of the NFT contract.
   * @param nftAddress The address of the NFT contract.
   * @returns A promise that resolves to the base URI of the NFT contract.
   */
  async getNFTBaseURI(nftAddress: string): Promise<string> {
      
    // Create a new contract instance
    const factory = new this.contractTarget();
    const contract = new ethers.Contract(nftAddress, factory.interface, this.provider);
    
    // Get the token URI
    const tokenURI = await contract.getBaseURI();
    
    // Return the token URI
    return tokenURI;
  }

  /**
   * Deploy a new NFT contract.
   * @param nftAddress The address of the NFT contract.
   * @param baseUri The base URI for the NFT contract.
   * @returns A promise that resolves to the address of the deployed contract.
   */
  async deploy(nftAddress: string, baseUri: string): Promise<string> {
    
    // Create a contract factory
    const factory = new this.contractTarget(this.wallet);

    // Deploy the contract
    const facotry = await factory.deploy();
    const contractAddress = await facotry.getAddress();
    
    // Store into database
    await this.nftService.create(nftAddress, contractAddress as string);
    const contract = new ethers.Contract(contractAddress, facotry.interface, this.wallet);
    await contract.deploymentTransaction().wait();
    // Set the base URI
    await contract.setBaseURI(baseUri);
    // Tell the indexer to create new filters
    await this.filterService.create(ChainType.L1, EventType.Transfer, nftAddress);
    await this.filterService.create(ChainType.L2, EventType.SessionEnded, contractAddress);
    
    // Return the contract address
    return contractAddress;
  }

  /**
   * Mint a new NFT token.
   * @param nftAddress The address of the NFT contract.
   * @param ownerAddress The address of the token owner.
   * @param tokenId The ID of the token.
   * @returns A promise that resolves to the transaction hash of the minting operation.
   */
  async mintNFT(nftAddress: string, ownerAddress: string, tokenId: number): Promise<string> {
    // Get the contract address
    const contractAddress = await this.nftService.findOne(nftAddress);
    // Create a contract instance

    const factory = new this.contractTarget(this.wallet);
    const contract = new ethers.Contract(contractAddress.l2Address, factory.interface, this.wallet);
    
    // Mint a new token
    const tx = await contract.mint(ownerAddress, tokenId);
    await tx.wait();

    // Create filter
    await this.filterService.create(ChainType.L2, EventType.SessionEnded, contractAddress.l2Address);

    // Return the transaction hash
    return tx.hash;
  }

  /**
   * Set the token URI of an NFT token.
   * @param nftAddress The address of the NFT contract.
   * @param tokenId The ID of the token.
   * @param tokenURI The URI of the token.
   * @returns A promise that resolves to the transaction hash of the setting operation.
   */
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

  /**
   * Get the current block number.
   * @returns A promise that resolves to the current block number.
   */
  async getBlockNumber(): Promise<number> {
    const blockNumber = await this.provider.getBlockNumber();
    return blockNumber;
  }
}