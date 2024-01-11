import {Module} from "@nestjs/common";
import { ScannerService } from "./scanner.service";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [ConfigModule.forRoot()],
    providers: [
        ConfigService,
        ScannerService
    ],
    exports: [ScannerService]
})
export class ScannerModule {}