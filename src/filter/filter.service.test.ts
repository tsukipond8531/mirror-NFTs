import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { Filter } from './interfaces/filter.interface';
import { FilterService } from './filter.service';
import { ChainType, EventType } from './schemas/filter.schema';

describe('FilterService', () => {
  let filterService: FilterService;
  let filterModel: Model<Filter>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilterService,
        {
          provide: 'FILTER_MODEL',
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    filterService = module.get<FilterService>(FilterService);
    filterModel = module.get<Model<Filter>>('FILTER_MODEL');
  });

  describe('create', () => {
    it('should create a new Filter if it does not already exist', async () => {
        const chainType = ChainType.L1;
        const eventType = EventType.Transfer;
        const contractAddress = 'contractAddress';
        const findOneSpy = jest.spyOn(filterModel, 'findOne').mockResolvedValue(null);
        const saveSpy = jest.spyOn(filterModel.prototype, 'save').mockResolvedValue({ chainType, eventType, contractAddress });

        const result = await filterService.create(chainType, eventType, contractAddress);

        expect(findOneSpy).toHaveBeenCalledWith({ chain: chainType, eventType, address: contractAddress });
        expect(saveSpy).toHaveBeenCalled();
        expect(result).toEqual({ chainType, eventType, contractAddress });
    });

    it('should return the existing Filter if it already exists', async () => {
        const chainType = ChainType.L1;
        const eventType = EventType.Transfer;
        const contractAddress = 'contractAddress';
        const findOneSpy = jest.spyOn(filterModel, 'findOne').mockResolvedValue({ chainType, eventType, contractAddress });

        const result = await filterService.create(chainType, eventType, contractAddress);

        expect(findOneSpy).toHaveBeenCalledWith({ chain: chainType, eventType, address: contractAddress });
        expect(result).toEqual({ chainType, eventType, contractAddress });
    });
  });

  describe('findAll', () => {
    it('should return an array of Filters', async () => {
      const findSpy = jest.spyOn(filterModel, 'find').mockResolvedValue([{ chainType: 'chainType', eventType: 'eventType', contractAddress: 'contractAddress' }]);

      const result = await filterService.findAll();

      expect(findSpy).toHaveBeenCalled();
      expect(result).toEqual([{ chainType: 'chainType', eventType: 'eventType', contractAddress: 'contractAddress' }]);
    });
  });

  describe('findAllByChain', () => {
    it('should return an array of Filters filtered by chainType', async () => {
      const chainType = ChainType.L1;
      const findSpy = jest.spyOn(filterModel, 'find').mockResolvedValue([{ chainType, eventType: 'eventType', contractAddress: 'contractAddress' }]);

      const result = await filterService.findAllByChain(chainType);

      expect(findSpy).toHaveBeenCalledWith({ chain: chainType });
      expect(result).toEqual([{ chainType, eventType: 'eventType', contractAddress: 'contractAddress' }]);
    });
  });

  describe('findOne', () => {
    it('should return a single Filter by eventType and contractAddress', async () => {
      const eventType = EventType.Transfer;
      const contractAddress = 'contractAddress';
      const findOneSpy = jest.spyOn(filterModel, 'findOne').mockResolvedValue({ chainType: 'chainType', eventType, contractAddress });

      const result = await filterService.findOne(eventType, contractAddress);

      expect(findOneSpy).toHaveBeenCalledWith({ eventType, address: contractAddress });
      expect(result).toEqual({ chainType: 'chainType', eventType, contractAddress });
    });
  });
});