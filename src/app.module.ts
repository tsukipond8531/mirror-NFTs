import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Web3Service } from './web3/web3.service';
import { NftModule } from './nft/nft.module';
import { NftService } from './nft/nft.service';
import { DatabaseModule } from './database/database.module';
import { Web3Module } from './web3/web3.module';
import { NftController } from './nft/nft.controller';
import { IndexerModule } from './indexer/indexer.module';
import { IndexerController } from './indexer/indexer.controller';
import { BlockModule } from './block/block.module';
import { IndexerService } from './indexer/indexer.service';
import { BlockController } from './block/block.controller';
import { nftProviders } from './nft/nft.providers';
import { FilterModule } from './filter/filter.module';
import { FilterController } from './filter/filter.controller';
import { FilterService } from './filter/filter.service';
import { filterProviders } from './filter/filter.providers';
import { ConfigService } from '@nestjs/config';
import { Web3Controller } from './web3/web3.controller';

@Module({
  imports: [
    Web3Module, 
    NftModule, 
    DatabaseModule, 
    IndexerModule, 
    BlockModule, 
    FilterModule
  ],
  controllers: [
    AppController, 
    NftController, 
    IndexerController, 
    BlockController, 
    FilterController,
    Web3Controller
  ],
  providers: [
    AppService, 
    Web3Service, 
    NftService, ...nftProviders,
    IndexerService,
    FilterService, ...filterProviders,
    ConfigService,
    Web3Controller
  ],
})
export class AppModule {}
