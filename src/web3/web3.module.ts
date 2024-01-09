import { Module} from "@nestjs/common";
import { Web3Service } from "./web3.service";
import { NftModule } from "src/nft/nft.module";

@Module({
    imports: [NftModule],
    providers: [Web3Service],
})
export class Web3Module {}