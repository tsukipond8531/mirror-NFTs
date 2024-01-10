import { Module} from "@nestjs/common";
import { Web3Service } from "./web3.service";
import { NftModule } from "src/nft/nft.module";
import { IndexerModule } from "src/indexer/indexer.module";
import { IndexerService } from "src/indexer/indexer.service";
import { BlockModule } from "src/block/block.module";
import { BlockService } from "src/block/block.service";
import { FilterService } from "src/filter/filter.service";
import { blockProviders } from "src/block/block.providers";
import { DatabaseModule } from "src/database/database.module";
import { filterProviders } from "src/filter/filter.providers";
import { Web3Controller } from "./web3.controller";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        ConfigModule.forRoot(), 
        NftModule, 
        IndexerModule, 
        BlockModule, 
        DatabaseModule
    ],
    controllers: [Web3Controller],
    providers: [
        Web3Service, 
        IndexerService, 
        BlockService, ...blockProviders, 
        FilterService, ...filterProviders,
    ],
})
export class Web3Module {}