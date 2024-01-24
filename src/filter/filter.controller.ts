import {Controller, Get} from '@nestjs/common';
import { FilterService } from './filter.service';
import { Filter } from './schemas/filter.schema';
import { ApiTags } from '@nestjs/swagger';

@Controller('filter')
@ApiTags('filter')
export class FilterController{
    constructor(private readonly filterService: FilterService) {}

    @Get()
    async findAll(): Promise<Filter[]> {
        return this.filterService.findAll();
    }

}