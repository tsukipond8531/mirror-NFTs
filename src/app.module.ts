import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Web3Service } from './web3/web3.service';
import { NftModule } from './nft/nft.module';
import { NftService } from './nft/nft.service';
import { nftProviders } from './nft/nft.providers';
import { DatabaseModule } from './database/database.module';
import { Web3Module } from './web3/web3.module';
import { NftController } from './nft/nft.controller';
import { IndexerModule } from './indexer/indexer.module';

@Module({
  imports: [Web3Module, NftModule, DatabaseModule, IndexerModule],
  controllers: [AppController, NftController],
  providers: [
    AppService, 
    Web3Service, 
    NftService,
    ...nftProviders
  ],
})
export class AppModule {}
