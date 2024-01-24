import { Controller, Get, Body } from "@nestjs/common";
import { BlockService } from "./block.service";
import { Block } from "./interfaces/block.interface";
import { ApiTags } from "@nestjs/swagger";

/**
 * Controller for handling block-related operations.
 */
@Controller("block")
@ApiTags("block")
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  /**
   * Retrieves all blocks.
   * @returns A promise that resolves to an array of blocks.
   */
  @Get()
  findAll(): Promise<Block[]> {
    return this.blockService.findAll();
  }
}