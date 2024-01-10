import { Controller, Get, Body } from "@nestjs/common";
import { BlockService } from "./block.service";
import { Block } from "./interfaces/block.interface";

@Controller("block")
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Get()
  findAll(): Promise<Block[]> {
    return this.blockService.findAll();
  }
}