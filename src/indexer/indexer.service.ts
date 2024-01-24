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
    // @Cron('*/2 * * * *')
    // async handleL1Cron() {
    //     this.logger.debug('Called every 2 minutes');
    //     const blockNumber = await this.L1WebService.getBlockNumber();
    //     const lastBlockNumber = await this.blockService.find(ChainType.L1);
    //     if(lastBlockNumber) {
    //         const l1Filters = await this.filterService.findAllByChain(ChainType.L1);

    //         for (const filter of l1Filters) {
    //             await this.createTransferFilter(filter.address, lastBlockNumber.blockNumber, blockNumber);
    //         }

    //         await this.blockService.update(ChainType.L1, blockNumber);
    //     }
    // }

    /**
     * Creates a transfer filter for the given NFT address and block range.
     * @param nftAddress - The address of the NFT contract.
     * @param fromBlock - The starting block number.
     * @param toBlock - The ending block number.
     * @returns The created transfer filter.
     */
    async createTransferFilter(nftAddress: string, fromBlock: number, toBlock: number): Promise<ethers.TopicFilter> {
        const contracts = await this.nftService.findOneByL1Address(nftAddress);
        const contract = this.L1WebService.getContractFromAddress(nftAddress, contracts.abi);
        
        const transferFilter = await contract.filters.Transfer().getTopicFilter();

        const eventDetection = await contract.queryFilter(transferFilter, fromBlock, toBlock);
        console.log(`Transfer filter created for ${nftAddress} from block ${fromBlock} to block ${toBlock}`);

        // TODO: Transfer L2 NFT to new owner

        return transferFilter;
    }
}