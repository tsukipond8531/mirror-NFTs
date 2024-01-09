import { ethers } from 'ethers';
import { Injectable, Logger } from '@nestjs/common';
import { MockERC721__factory } from 'smart-contracts';
import { Cron } from '@nestjs/schedule';
import { databaseProviders } from 'src/database/database.providers';
import { BlockService } from 'src/block/block.service';

@Injectable()
export class IndexerService {
    private l1Provider: ethers.JsonRpcProvider;
    private l2Provider: ethers.JsonRpcProvider;
    private contractAddress: string;
    private readonly logger = new Logger(IndexerService.name);
    
    constructor(private readonly blockService: BlockService, contractAddress: string) {
        this.l1Provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_ENDPOINT_L1 as string);
        this.l2Provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_ENDPOINT_L2 as string);
        this.contractAddress = contractAddress;
    }

    @Cron('*/1 * * * *')
    async handleCron() {
        this.logger.debug('Called every minute');
        const blockNumber = await this.l2Provider.getBlockNumber();
        
        const lastBlockNumber = await this.blockService.findAll();

        await this.createTransferFilter(
            this.contractAddress, 
            lastBlockNumber.blockNumber, 
            blockNumber
        );
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


}