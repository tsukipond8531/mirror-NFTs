import {Controller, Inject} from "@nestjs/common";
import { Web3Service } from "./web3.service";
import { MirrorERC721__factory, MockERC721__factory } from "smart-contracts";

@Controller()
export class Web3Controller {

    constructor(
        @Inject('L1WebService') private readonly L1WebService: Web3Service,
        @Inject('L2WebService') private readonly L2WebService: Web3Service,
    ) {
        this.L1WebService.setContractTarget(MockERC721__factory);
        this.L2WebService.setContractTarget(MirrorERC721__factory);
    }

    getL1WebService(): Web3Service {
        return this.L1WebService;
    }

    getL2WebService(): Web3Service {
        return this.L2WebService;
    }
}