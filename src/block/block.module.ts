import { Module } from "@nestjs/common";
import { BlockController } from "./block.controller";
import { BlockService } from "./block.service";
import { blockProviders } from "./block.providers";
import { DatabaseModule } from "src/database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [BlockController],
    providers: [BlockService, ...blockProviders],
    exports: [BlockService]
})
export class BlockModule {}