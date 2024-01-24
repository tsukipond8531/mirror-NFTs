import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { Nft } from './interfaces/nft.interface'
import { NftService } from './nft.service';

describe('NftService', () => {
  let nftService: NftService;
  let nftModel: Model<Nft>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NftService,
        {
          provide: 'NFT_MODEL',
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    nftService = module.get<NftService>(NftService);
    nftModel = module.get<Model<Nft>>('NFT_MODEL');
  });

  describe('create', () => {
    it('should create a new Nft if it does not already exist', async () => {
      const l1Address = '0x123';
      const l2Address = '0x456';
      const findOneSpy = jest.spyOn(nftModel, 'findOne').mockResolvedValue(null);
      const saveSpy = jest.spyOn(nftModel.prototype, 'save').mockResolvedValue({ l1Address, l2Address } as Nft);

      const result = await nftService.create(l1Address, l2Address, [], "");

      expect(findOneSpy).toHaveBeenCalledWith({ l1Address });
      expect(saveSpy).toHaveBeenCalled();
      expect(result).toEqual({ l1Address, l2Address });
    });

    it('should return the existing Nft if it already exists', async () => {
      const l1Address = '0x123';
      const l2Address = '0x456';
      const findOneSpy = jest.spyOn(nftModel, 'findOne').mockResolvedValue({ l1Address, l2Address } as Nft);

      const result = await nftService.create(l1Address, l2Address, [], "");

      expect(findOneSpy).toHaveBeenCalledWith({ l1Address });
      expect(result).toEqual({ l1Address, l2Address });
    });
  });

  describe('findAll', () => {
    it('should return an array of Nfts', async () => {
      const findSpy = jest.spyOn(nftModel, 'find').mockResolvedValue([{ l1Address: '0x123', l2Address: '0x456' }] as Nft[]);

      const result = await nftService.findAll();

      expect(findSpy).toHaveBeenCalled();
      expect(result).toEqual([{ l1Address: '0x123', l2Address: '0x456' }]);
    });
  });

  describe('findOne', () => {
    it('should return a single Nft by l1Address', async () => {
      const l1Address = '0x123';
      const findOneSpy = jest.spyOn(nftModel, 'findOne').mockResolvedValue({ l1Address, l2Address: '0x456' } as Nft);

      const result = await nftService.findOneByL1Address(l1Address);

      expect(findOneSpy).toHaveBeenCalledWith({ l1Address });
      expect(result).toEqual({ l1Address, l2Address: '0x456' });
    });
  });

  describe('findOneByL2Address', () => {
    it('should return a single Nft by l2Address', async () => {
      const l2Address = '0x456';
      const findOneSpy = jest.spyOn(nftModel, 'findOne').mockResolvedValue({ l1Address: '0x123', l2Address } as Nft);

      const result = await nftService.findOneByL2Address(l2Address);

      expect(findOneSpy).toHaveBeenCalledWith({ l2Address });
      expect(result).toEqual({ l1Address: '0x123', l2Address });
    });
  });
});