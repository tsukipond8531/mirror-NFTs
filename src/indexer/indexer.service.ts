import { ethers } from 'ethers';
import { Injectable, Logger } from '@nestjs/common';
import { MockERC721__factory } from 'smart-contracts';
import { Cron } from '@nestjs/schedule';
import { databaseProviders } from 'src/database/database.providers';
import { BlockService } from 'src/block/block.service';
import { ChainType, EventType } from 'src/filter/schemas/filter.schema';
import { FilterService } from 'src/filter/filter.service';

@Injectable()
export class IndexerService {
    private l1Provider: ethers.JsonRpcProvider;
    private l2Provider: ethers.JsonRpcProvider;
    private readonly logger = new Logger(IndexerService.name);
    
    constructor(
        private readonly blockService: BlockService,
        private readonly filterService: FilterService,
    ) {
        this.l1Provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_ENDPOINT_L1 as string);
        this.l2Provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_ENDPOINT_L2 as string);
    }

    @Cron('*/1 * * * *')
    async handleL1Cron() {
        this.logger.debug('Called every minute');
        const blockNumber = await this.l1Provider.getBlockNumber();

        const lastBlockNumber = await this.blockService.findAll();
        const l1Filters = await this.filterService.findAllByChain(ChainType.L1);

        for (const filter of l1Filters) {
            await this.createTransferFilter(filter.address, lastBlockNumber.blockNumber, blockNumber);
        }
    }

    @Cron('*/1 * * * *')
    async handleL2Cron() {
        this.logger.debug('Called every minute');
        const blockNumber = await this.l2Provider.getBlockNumber();
        
        const lastBlockNumber = await this.blockService.findAll();
        const l2Filters = await this.filterService.findAllByChain(ChainType.L2);

        for (const filter of l2Filters) {
            await this.createSessionEndedFilter(filter.address, lastBlockNumber.blockNumber, blockNumber);
        }
    }

    async createTransferFilter(nftAddress: string, fromBlock: number, toBlock: number): Promise<ethers.TopicFilter> {
        const factory = new MockERC721__factory();
        const contract = new ethers.Contract(nftAddress, factory.interface, this.l1Provider);
        const transferFilter = await contract.filters.Transfer().getTopicFilter();

        const eventDetection = await contract.queryFilter(transferFilter, fromBlock, toBlock);
        console.log(`Transfer filter created for ${nftAddress} from block ${fromBlock} to block ${toBlock}`);
        console.log(`Found ${eventDetection}`);

        return transferFilter;
    }

    async createSessionEndedFilter(nftAddress: string, fromBlock: number, toBlock: number): Promise<ethers.TopicFilter> {
        const factory = new MockERC721__factory();
        const contract = new ethers.Contract(nftAddress, factory.interface, this.l1Provider);
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