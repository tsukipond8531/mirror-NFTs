import {Controller} from '@nestjs/common';
import {IndexerService} from './indexer.service';

@Controller()
export class IndexerController {
    constructor(private readonly indexerService: IndexerService) {
        
    }
}
