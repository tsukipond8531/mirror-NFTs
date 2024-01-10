import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { Block } from './interfaces/block.interface';
import { BlockService } from './block.service';
import { ChainType } from 'src/filter/schemas/filter.schema';

describe('BlockService', () => {
  let blockService: BlockService;
  let blockModel: Model<Block>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockService,
        {
          provide: 'BLOCK_MODEL',
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            findOneAndUpdate: jest.fn(),
            prototype: {
              save: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    blockService = module.get<BlockService>(BlockService);
    blockModel = module.get<Model<Block>>('BLOCK_MODEL');
  });

  describe('create', () => {
    it('should create a new Block', async () => {
      const chainType = ChainType.L1;
      const blockNumber = 0;
      const saveSpy = jest.spyOn(blockModel.prototype, 'save').mockResolvedValue({ chainType, blockNumber } as Block);

      const result = await blockService.create(chainType, blockNumber);

      expect(saveSpy).toHaveBeenCalled();
      expect(result).toEqual({ chainType, blockNumber });
    });
  });

  describe('find', () => {
    it('should find a Block by chainType', async () => {
      const chainType = ChainType.L1;
      const findOneSpy = jest.spyOn(blockModel, 'findOne').mockResolvedValue({ chainType, blockNumber: 0 } as Block);

      const result = await blockService.find(chainType);

      expect(findOneSpy).toHaveBeenCalledWith({ chainType });
      expect(result).toEqual({ chainType, blockNumber: 0 });
    });
  });

  describe('findAll', () => {
    it('should find all Blocks', async () => {
      const findSpy = jest.spyOn(blockModel, 'find').mockResolvedValue([{ chainType: ChainType.L1, blockNumber: 0 }] as Block[]);

      const result = await blockService.findAll();

      expect(findSpy).toHaveBeenCalled();
      expect(result).toEqual([{ chainType: ChainType.L1, blockNumber: 0 }]);
    });
  });

  describe('update', () => {
    it('should update a Block if blockNumber is bigger than the last blockNumber', async () => {
      const chainType = ChainType.L1;
      const blockNumber = 1;
      const lastBlockNumber = 0;
      const findOneSpy = jest.spyOn(blockModel, 'findOne').mockResolvedValue({ chainType, blockNumber: lastBlockNumber } as Block);
      const findOneAndUpdateSpy = jest.spyOn(blockModel, 'findOneAndUpdate').mockResolvedValue({ chainType, blockNumber } as Block);
      const saveSpy = jest.spyOn(blockModel.prototype, 'save').mockResolvedValue({ chainType, blockNumber } as Block);

      const result = await blockService.update(chainType, blockNumber);

      expect(findOneSpy).toHaveBeenCalledWith({ chainType });
      expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
        { chainType },
        { blockNumber },
        { new: false }
      );
      expect(saveSpy).toHaveBeenCalled();
      expect(result).toEqual({ chainType, blockNumber });
    });

    it('should throw an error if blockNumber is smaller than the last blockNumber', async () => {
      const chainType = ChainType.L1;
      const blockNumber = 0;
      const lastBlockNumber = 1;
      const findOneSpy = jest.spyOn(blockModel, 'findOne').mockResolvedValue({ chainType, blockNumber: lastBlockNumber } as Block);

      await expect(blockService.update(chainType, blockNumber)).rejects.toThrowError('Block number is smaller than the last block number');

      expect(findOneSpy).toHaveBeenCalledWith({ chainType });
    });
  });
});