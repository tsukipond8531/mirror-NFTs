import { Module} from "@nestjs/common";
import { Web3Service } from "./web3.service";
import { NftModule } from "src/nft/nft.module";
import { BlockModule } from "src/block/block.module";
import { BlockService } from "src/block/block.service";
import { FilterService } from "src/filter/filter.service";
import { blockProviders } from "src/block/block.providers";
import { DatabaseModule } from "src/database/database.module";
import { filterProviders } from "src/filter/filter.providers";
import { Web3Controller } from "./web3.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NftService } from "src/nft/nft.service";

@Module({
    imports: [
        ConfigModule.forRoot(), 
        NftModule, 
        BlockModule, 
        DatabaseModule
    ],
    controllers: [Web3Controller],
    providers: [
        ConfigService,
        {
            provide: 'L1WebService', useFactory: (
                nftservice: NftService, 
                filterService: FilterService, 
                configService: ConfigService
            ) => { 
            const web3Service = new Web3Service(nftservice, filterService, configService);
            web3Service.setProvider(configService.get<string>('ALCHEMY_ENDPOINT_L1'));
            return web3Service;
            },
            inject: [NftService, FilterService, ConfigService]
        },
        {
            provide: 'L2WebService', useFactory: (
                nftservice: NftService, 
                filterService: FilterService, 
                configService: ConfigService
            ) => { 
            const web3Service = new Web3Service(nftservice, filterService, configService);
            web3Service.setProvider(configService.get<string>('ALCHEMY_ENDPOINT_L2'));
            return web3Service;
            },
            inject: [NftService, FilterService, ConfigService]
        },
        BlockService, ...blockProviders, 
        FilterService, ...filterProviders,
    ],
    exports: ['L1WebService', 'L2WebService']
})
export class Web3Module {}