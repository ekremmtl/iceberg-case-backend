import { BadRequestException } from '@nestjs/common';
import { StageTransitionService } from './stage-transition.service';
import { TransactionStage } from '../common/enums/transaction-stage.enum';

describe('StageTransitionService', () => {
  let service: StageTransitionService;

  beforeEach(() => {
    service = new StageTransitionService();
  });

  describe('valid transitions', () => {
    it('allows agreement → earnest_money', () => {
      expect(() =>
        service.validate(TransactionStage.AGREEMENT, TransactionStage.EARNEST_MONEY),
      ).not.toThrow();
    });

    it('allows earnest_money → title_deed', () => {
      expect(() =>
        service.validate(TransactionStage.EARNEST_MONEY, TransactionStage.TITLE_DEED),
      ).not.toThrow();
    });

    it('allows title_deed → completed', () => {
      expect(() =>
        service.validate(TransactionStage.TITLE_DEED, TransactionStage.COMPLETED),
      ).not.toThrow();
    });
  });

  describe('invalid transitions', () => {
    it('throws when skipping a stage (agreement → title_deed)', () => {
      expect(() =>
        service.validate(TransactionStage.AGREEMENT, TransactionStage.TITLE_DEED),
      ).toThrow(BadRequestException);
    });

    it('throws when skipping a stage (agreement → completed)', () => {
      expect(() =>
        service.validate(TransactionStage.AGREEMENT, TransactionStage.COMPLETED),
      ).toThrow(BadRequestException);
    });

    it('throws when going backwards (title_deed → earnest_money)', () => {
      expect(() =>
        service.validate(TransactionStage.TITLE_DEED, TransactionStage.EARNEST_MONEY),
      ).toThrow(BadRequestException);
    });

    it('throws when staying on the same stage (agreement → agreement)', () => {
      expect(() =>
        service.validate(TransactionStage.AGREEMENT, TransactionStage.AGREEMENT),
      ).toThrow(BadRequestException);
    });
  });

  describe('completed stage is final', () => {
    it('throws when trying to advance from completed', () => {
      expect(() =>
        service.validate(TransactionStage.COMPLETED, TransactionStage.AGREEMENT),
      ).toThrow(BadRequestException);
    });

    it('error message mentions already completed', () => {
      try {
        service.validate(TransactionStage.COMPLETED, TransactionStage.AGREEMENT);
      } catch (e: any) {
        expect(e.message).toMatch(/already completed/i);
      }
    });
  });

  describe('error message content', () => {
    it('includes the current and expected next stage in the message', () => {
      try {
        service.validate(TransactionStage.AGREEMENT, TransactionStage.COMPLETED);
      } catch (e: any) {
        expect(e.message).toContain(TransactionStage.AGREEMENT);
        expect(e.message).toContain(TransactionStage.EARNEST_MONEY);
      }
    });
  });
});
