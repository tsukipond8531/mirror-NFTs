import {Controller} from '@nestjs/common';
import { Web3Controller } from 'src/web3/web3.controller';

@Controller()
export class IndexerController {
    constructor(private readonly web3Controller: Web3Controller) {
        
    }
}
