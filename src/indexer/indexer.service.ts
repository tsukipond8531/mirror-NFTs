import { ethers } from 'ethers';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BlockService } from 'src/block/block.service';
import { ChainType } from 'src/filter/schemas/filter.schema';
import { FilterService } from 'src/filter/filter.service';
import { Web3Service } from 'src/web3/web3.service';
import { NftService } from 'src/nft/nft.service';

/**
 * Service responsible for indexing and handling cron jobs for L1 and L2 chains.
 */
@Injectable()
export class IndexerService {
    /**
     * Logger instance for the IndexerService class.
     */
    private readonly logger = new Logger(IndexerService.name);
    
    constructor(
        private readonly blockService: BlockService,
        private readonly filterService: FilterService,
        private readonly nftService: NftService,
        @Inject('L1WebService') private readonly L1WebService: Web3Service,
        @Inject('L2WebService') private readonly L2WebService: Web3Service,
    ) {
    }

    /**
     * Cron job handler for L1 chain.
     * This method is called every 2 minutes.
     */
    @Cron('*/2 * * * *')
    async handleL1Cron() {
        this.logger.debug('Called every 2 minutes');
        const blockNumber = await this.L1WebService.getBlockNumber();
        console.log(`L1 Block number: ${blockNumber}`);
        const lastBlockNumber = await this.blockService.find(ChainType.L1);
        console.log("L1 DB Block:", lastBlockNumber);
        if(lastBlockNumber) {
            const l1Filters = await this.filterService.findAllByChain(ChainType.L1);

            for (const filter of l1Filters) {
                await this.createTransferFilter(filter.address, lastBlockNumber.blockNumber, blockNumber);
            }

            await this.blockService.update(ChainType.L1, blockNumber);
        }
    }

    /**
     * Cron job handler for L2 chain.
     * This method is called every minute.
     */
    @Cron('*/1 * * * *')
    async handleL2Cron() {
        this.logger.debug('Called every minute');
        const blockNumber = await this.L2WebService.getBlockNumber();
        console.log(`L2 Block number: ${blockNumber}`);
        const lastBlockNumber = await this.blockService.find(ChainType.L2);
        console.log("L2 DB Block:", lastBlockNumber);
        if (lastBlockNumber) {
            const l2Filters = await this.filterService.findAllByChain(ChainType.L2);

            for (const filter of l2Filters) {
                await this.createSessionEndedFilter(filter.address, lastBlockNumber.blockNumber, blockNumber);
            }

            await this.blockService.update(ChainType.L2, blockNumber);
        }
        
    }

    /**
     * Creates a transfer filter for the given NFT address and block range.
     * @param nftAddress - The address of the NFT contract.
     * @param fromBlock - The starting block number.
     * @param toBlock - The ending block number.
     * @returns The created transfer filter.
     */
    async createTransferFilter(nftAddress: string, fromBlock: number, toBlock: number): Promise<ethers.TopicFilter> {
        const contract = this.L1WebService.getContractFromAddress(nftAddress);
        const transferFilter = await contract.filters.Transfer().getTopicFilter();

        const eventDetection = await contract.queryFilter(transferFilter, fromBlock, toBlock);
        console.log(`Transfer filter created for ${nftAddress} from block ${fromBlock} to block ${toBlock}`);
        console.log(`Found ${eventDetection.values}`);

        // TODO: Transfer L2 NFT to new owner

        return transferFilter;
    }

    /**
     * Creates a session ended filter for the given NFT address and block range.
     * @param nftAddress - The address of the NFT contract.
     * @param fromBlock - The starting block number.
     * @param toBlock - The ending block number.
     */
    async createSessionEndedFilter(nftAddress: string, fromBlock: number, toBlock: number) {
        const contract = this.L2WebService.getContractFromAddress(nftAddress);
        const sessionEndedFilter = contract.filters.SessionEnded;

        const eventDetection = await contract.queryFilter(sessionEndedFilter, fromBlock, toBlock);
        console.log(`SessionEnded filter created for ${nftAddress} from block ${fromBlock} to block ${toBlock}`);
        for (const event of eventDetection) {
            // Parse event data
            // Event data contains the address of the owner and the token ID
            const ethAddress = event.data.slice(0, 66);
            console.log("ethAddress", ethAddress === '0x' + '0'.repeat(40) ? '0x' : ethAddress.replace(/^0x0*/, '0x'));
            console.log("tokenId", parseInt(event.data.slice(66), 16));
            const tokenId = parseInt(event.data.slice(66), 16);

            // Get the L1 address of the NFT
            const L1Address = await this.nftService.findOneByL2Address(nftAddress);
            // Fetch the metadata from L2
            const L2Metadata = await this.L2WebService.getNFTMetadata(nftAddress, tokenId);
            // TODO: I only need the tokenURI, not the baseURI.
            await this.L1WebService.setTokenURI(L1Address.l1Address, tokenId, L2Metadata);
        }
    }
}