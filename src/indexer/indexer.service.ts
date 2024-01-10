import { ethers } from 'ethers';
import { Injectable, Logger } from '@nestjs/common';
import { MockERC721__factory } from 'smart-contracts';
import { Cron } from '@nestjs/schedule';
import { databaseProviders } from 'src/database/database.providers';
import { BlockService } from 'src/block/block.service';
import { ChainType, EventType } from 'src/filter/schemas/filter.schema';
import { FilterService } from 'src/filter/filter.service';
import { ConfigService } from '@nestjs/config';
import { Web3Service } from 'src/web3/web3.service';

@Injectable()
export class IndexerService {
    private l1Provider: ethers.JsonRpcProvider;
    private l2Provider: ethers.JsonRpcProvider;
    private readonly logger = new Logger(IndexerService.name);
    
    constructor(
        private readonly blockService: BlockService,
        private readonly filterService: FilterService,
        private readonly L1WebService: Web3Service,
        private readonly L2WebService: Web3Service,
    ) {}

    @Cron('*/2 * * * *')
    async handleL1Cron() {
        this.logger.debug('Called every minute');
        const blockNumber = await this.L1WebService.getBlockNumber();

        const lastBlockNumber = await this.blockService.find(ChainType.L1);
        const l1Filters = await this.filterService.findAllByChain(ChainType.L1);

        for (const filter of l1Filters) {
            await this.createTransferFilter(filter.address, lastBlockNumber.blockNumber, blockNumber);
        }

        await this.blockService.update(ChainType.L1, blockNumber);
    }

    @Cron('*/1 * * * *')
    async handleL2Cron() {
        this.logger.debug('Called every minute');
        const blockNumber = await this.l2Provider.getBlockNumber();
        
        const lastBlockNumber = await this.blockService.find(ChainType.L2);
        const l2Filters = await this.filterService.findAllByChain(ChainType.L2);

        for (const filter of l2Filters) {
            await this.createSessionEndedFilter(filter.address, lastBlockNumber.blockNumber, blockNumber);
        }

        await this.blockService.update(ChainType.L2, blockNumber);
    }

    async createTransferFilter(nftAddress: string, fromBlock: number, toBlock: number): Promise<ethers.TopicFilter> {
        const contract = this.L1WebService.getContractFromAddress(nftAddress);
        const transferFilter = await contract.filters.Transfer().getTopicFilter();

        const eventDetection = await contract.queryFilter(transferFilter, fromBlock, toBlock);
        console.log(`Transfer filter created for ${nftAddress} from block ${fromBlock} to block ${toBlock}`);
        console.log(`Found ${eventDetection}`);

        return transferFilter;
    }

    async createSessionEndedFilter(nftAddress: string, fromBlock: number, toBlock: number): Promise<ethers.TopicFilter> {
        const contract = this.L2WebService.getContractFromAddress(nftAddress);
        const sessionEndedFilter = await contract.filters.SessionEnded().getTopicFilter();

        const eventDetection = await contract.queryFilter(sessionEndedFilter, fromBlock, toBlock);
        console.log(`SessionEnded filter created for ${nftAddress} from block ${fromBlock} to block ${toBlock}`);
        console.log(`Found ${eventDetection}`);

        return sessionEndedFilter;
    }

    async createFilter(chainType: ChainType, eventType: EventType, contractAddress: string) {
        await this.filterService.create(chainType, eventType, contractAddress);
    }
}