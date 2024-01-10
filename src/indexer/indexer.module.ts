import { Module } from "@nestjs/common";
import { IndexerService } from "./indexer.service";
import { IndexerController } from "./indexer.controller";
import { ScheduleModule} from '@nestjs/schedule';
import { BlockService } from "src/block/block.service";
import { blockProviders } from "src/block/block.providers";
import { BlockModule } from "src/block/block.module";
import { DatabaseModule } from "src/database/database.module";

@Module({
    imports: [ScheduleModule.forRoot(), BlockModule, DatabaseModule],
    controllers: [IndexerController],
    providers: [IndexerService, BlockService, ...blockProviders],
})

export class IndexerModule {}