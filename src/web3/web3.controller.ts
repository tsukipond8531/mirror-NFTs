import {Controller} from "@nestjs/common";
import { Web3Service } from "./web3.service";
import { NftService } from "src/nft/nft.service";
import { IndexerService } from "src/indexer/indexer.service";
import { ConfigService } from "@nestjs/config";
import { MirrorERC721__factory, MockERC721__factory } from "smart-contracts";

@Controller()
export class Web3Controller {
    private readonly L1WebService: Web3Service;
    private readonly L2WebService: Web3Service;

    constructor(
        private readonly nftService: NftService,
        private readonly indexerService: IndexerService,
        private readonly configService: ConfigService,
    ) {
        this.L1WebService = new Web3Service(
            this.nftService, 
            this.indexerService,
            this.configService,
        );
        this.L1WebService.setProvider(
            this.configService.get<string>('ALCHEMY_ENDPOINT_L1')
        );
        this.L1WebService.setContractTarget(MockERC721__factory);
        this.L2WebService = new Web3Service(
            this.nftService,
            this.indexerService,
            this.configService,
        );
        this.L2WebService.setProvider(
            this.configService.get<string>('ALCHEMY_ENDPOINT_L2')
        );
        this.L2WebService.setContractTarget(MirrorERC721__factory);
    }

    getL1WebService(): Web3Service {
        return this.L1WebService;
    }

    getL2WebService(): Web3Service {
        return this.L2WebService;
    }
}