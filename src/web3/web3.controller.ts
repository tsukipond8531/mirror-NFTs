import {Controller, Inject} from "@nestjs/common";
import { Web3Service } from "./web3.service";
import { NftService } from "src/nft/nft.service";

@Controller()
export class Web3Controller {

    constructor(
        @Inject('L1WebService') private readonly L1WebService: Web3Service,
        @Inject('L2WebService') private readonly L2WebService: Web3Service,
        private readonly nftService: NftService,
    ) {
    }

    getL1WebService(): Web3Service {
        return this.L1WebService;
    }

    getL2WebService(): Web3Service {
        return this.L2WebService;
    }
}