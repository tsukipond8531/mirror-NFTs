import { Module } from "@nestjs/common";
import { NftController } from "./nft.controller";
import { NftService } from "./nft.service";
import { nftProviders } from "./nft.providers";
import { DatabaseModule } from "src/database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [NftController],
    providers: [NftService, ...nftProviders],
    exports: [NftService]
})
export class NftModule {}