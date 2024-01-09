import { Module } from "@nestjs/common";
import { IndexerService } from "./indexer.service";
import { IndexerController } from "./indexer.controller";
import { ScheduleModule} from '@nestjs/schedule';
import { BlockService } from "src/block/block.service";
import { blockProviders } from "src/block/block.providers";

@Module({
    imports: [ScheduleModule.forRoot()],
    controllers: [IndexerController],
    providers: [IndexerService, BlockService, ...blockProviders],
})

export class IndexerModule {}