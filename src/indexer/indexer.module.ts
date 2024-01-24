import { Module } from "@nestjs/common";
import { IndexerService } from "./indexer.service";
import { IndexerController } from "./indexer.controller";
import { ScheduleModule} from '@nestjs/schedule';
import { BlockService } from "src/block/block.service";
import { blockProviders } from "src/block/block.providers";
import { BlockModule } from "src/block/block.module";
import { DatabaseModule } from "src/database/database.module";
import { FilterModule } from "src/filter/filter.module";
import { FilterService } from "src/filter/filter.service";
import { filterProviders } from "src/filter/filter.providers";
import { NftService } from "src/nft/nft.service";
import { nftProviders } from "src/nft/nft.providers";
import { ConfigModule } from "@nestjs/config";
import { Web3Module } from "src/web3/web3.module";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ConfigModule.forRoot(),
        BlockModule, 
        DatabaseModule, 
        FilterModule,
        Web3Module,
    ],
    controllers: [IndexerController],
    providers: [
        IndexerService, 
        BlockService, ...blockProviders, 
        FilterService, ...filterProviders,
        NftService, ...nftProviders,
    ],
})

export class IndexerModule {}