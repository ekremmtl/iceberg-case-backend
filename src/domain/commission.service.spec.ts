import { CommissionService } from './commission.service';

describe('CommissionService', () => {
  let service: CommissionService;

  beforeEach(() => {
    service = new CommissionService();
  });

  const base = {
    totalServiceFee: 10000,
    currency: 'GBP',
    listingAgentId: 'agent-a',
    sellingAgentId: 'agent-b',
  };

  describe('agency / agent pool split', () => {
    it('gives 50% to agency and 50% to agent pool', () => {
      const result = service.calculate(base);
      expect(result.agencyAmount).toBe(5000);
      expect(result.agentPoolAmount).toBe(5000);
    });

    it('passes totalServiceFee and currency through unchanged', () => {
      const result = service.calculate(base);
      expect(result.totalServiceFee).toBe(10000);
      expect(result.currency).toBe('GBP');
    });

    it('sets calculatedAt to a recent date', () => {
      const before = new Date();
      const result = service.calculate(base);
      expect(result.calculatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('Scenario 1 — same listing and selling agent', () => {
    it('gives full agent pool (50%) to the single agent', () => {
      const result = service.calculate({ ...base, sellingAgentId: 'agent-a' });
      expect(result.listingAgentAmount).toBe(5000);
      expect(result.sellingAgentAmount).toBe(0);
    });

    it('includes the correct reason strings', () => {
      const result = service.calculate({ ...base, sellingAgentId: 'agent-a' });
      expect(result.listingAgentReason).toMatch(/same agent/i);
      expect(result.sellingAgentReason).toMatch(/same as listing/i);
    });
  });

  describe('Scenario 2 — different listing and selling agents', () => {
    it('splits agent pool equally (25% each)', () => {
      const result = service.calculate(base);
      expect(result.listingAgentAmount).toBe(2500);
      expect(result.sellingAgentAmount).toBe(2500);
    });

    it('includes the correct reason strings', () => {
      const result = service.calculate(base);
      expect(result.listingAgentReason).toMatch(/listing agent/i);
      expect(result.sellingAgentReason).toMatch(/selling agent/i);
    });
  });

  describe('edge cases', () => {
    it('handles zero service fee', () => {
      const result = service.calculate({ ...base, totalServiceFee: 0 });
      expect(result.agencyAmount).toBe(0);
      expect(result.agentPoolAmount).toBe(0);
      expect(result.listingAgentAmount).toBe(0);
      expect(result.sellingAgentAmount).toBe(0);
    });

    it('handles non-round fee amounts correctly', () => {
      const result = service.calculate({ ...base, totalServiceFee: 3333 });
      expect(result.agencyAmount).toBeCloseTo(1666.5);
      expect(result.listingAgentAmount).toBeCloseTo(833.25);
      expect(result.sellingAgentAmount).toBeCloseTo(833.25);
    });

    it('agencyAmount + agentPoolAmount always equals totalServiceFee', () => {
      const result = service.calculate({ ...base, totalServiceFee: 7500 });
      expect(result.agencyAmount + result.agentPoolAmount).toBe(result.totalServiceFee);
    });

    it('listingAgentAmount + sellingAgentAmount always equals agentPoolAmount', () => {
      const result = service.calculate(base);
      expect(result.listingAgentAmount + result.sellingAgentAmount).toBe(result.agentPoolAmount);
    });
  });
});
