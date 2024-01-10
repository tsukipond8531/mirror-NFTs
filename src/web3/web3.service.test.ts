import { Test, TestingModule } from '@nestjs/testing';
import { ethers } from 'ethers';
import { NftService } from '../nft/nft.service';
import { FilterService } from '../filter/filter.service';
import { ConfigService } from '@nestjs/config';
import { Web3Service } from './web3.service';

describe('Web3Service', () => {
  let web3Service: Web3Service;
  let nftService: NftService;
  let filterService: FilterService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Web3Service,
        NftService,
        FilterService,
        ConfigService,
      ],
    }).compile();

    web3Service = module.get<Web3Service>(Web3Service);
    nftService = module.get<NftService>(NftService);
    filterService = module.get<FilterService>(FilterService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('setProvider', () => {
    it('should set the provider and wallet', () => {
      const endpoint = 'http://localhost:8545';
      const privateKey = 'PRIVATE_KEY';

      jest.spyOn(configService, 'get').mockReturnValue(privateKey);

      web3Service.setProvider(endpoint);

      expect(web3Service['provider']).toBeInstanceOf(ethers.JsonRpcProvider);
      expect(web3Service['wallet']).toBeInstanceOf(ethers.Wallet);
    });
  });

  describe('setContractTarget', () => {
    it('should set the contract target', () => {
      const contractTarget = jest.fn();

      web3Service.setContractTarget(contractTarget);

      expect(web3Service['contractTarget']).toBe(contractTarget);
    });
  });

  describe('getContractFromAddress', () => {
    it('should return a contract instance', () => {
      const contractAddress = '0x1234567890abcdef';
      const mockContract = new ethers.Contract(contractAddress, [], web3Service['wallet']);

      jest.spyOn(web3Service, 'getContractFromAddress').mockReturnValue(mockContract);

      const result = web3Service.getContractFromAddress(contractAddress);

      expect(result).toBe(mockContract);
    });
  });
});