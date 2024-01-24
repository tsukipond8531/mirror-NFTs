import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

function successfullResult(result: any): any {
  return {
      statusCode: 200,
      body: JSON.stringify({
          message: "Successfull",
          result: result,
      })
  }
}

/**
 * Controller for handling login requests.
 */
@Controller()
@ApiTags('app')
export class AppController {

  constructor(
    private readonly appService: AppService,
  ) {
  }

  /**
   * Handles the login request.
   * @param owner_address - The address of the owner.
   * @param nft_address - The address of the NFT.
   * @param token_id - The ID of the token.
   * @returns A Promise that resolves to the login response.
   */
  @Get('mirrorToken/:owner_address/:nft_address/:token_id')
  async mirrorToken(
    @Param('owner_address') owner_address: string, 
    @Param('nft_address') nft_address: string,
    @Param('token_id') token_id: number,
  ): Promise<any> {
    return this.appService.mirrorToken(owner_address, nft_address, token_id);
  }

  /**
   * Handles the update request for L1 contract.
   * @param L2NftAddress - The address of the L2 NFT.
   * @param tokenId - The ID of the token.
   * @returns A Promise that resolves to the update response.
   */
  @Get('update/:L2NftAddress/:token_id')
  async updateL1Contract(
    @Param('L2NftAddress') L2NftAddress: string, 
    @Param('token_id') tokenId: number
  ) {
    return this.appService.updateL1Contract(L2NftAddress, tokenId);
  }

  /**
   * Handles the mirror contract request.
   * @param nftAddress - The address of the NFT.
   * @param constructorArgs - The constructor arguments for the contract.
   * @returns A Promise that resolves to the mirror contract response.
   */
  @Post('mirrorContract/:nftAddress')
  @ApiBody({type: Object})
  async mirrorContract(
    @Param('nftAddress') nftAddress: string,
    @Body('constructorArgs') constructorArgs: any[],
  ) {
    return this.appService.mirrorContract(nftAddress, constructorArgs);
  }
}