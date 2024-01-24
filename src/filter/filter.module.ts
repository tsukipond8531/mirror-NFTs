import {Module} from "@nestjs/common";
import {FilterController} from "./filter.controller";
import {FilterService} from "./filter.service";
import { DatabaseModule } from "src/database/database.module";
import { filterProviders } from "./filter.providers";

@Module({
    imports: [DatabaseModule],
    controllers: [FilterController],
    providers: [FilterService, ...filterProviders],
    exports: [FilterService]
})
export class FilterModule {}