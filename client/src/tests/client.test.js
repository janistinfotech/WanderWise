import { describe, it, expect } from 'vitest';

describe('WanderWise Client Logic & Utilities', () => {
  it('formats currency with symbol and decimal precision', () => {
    const formatCurrency = (amount, currency = 'PHP') => {
      const num = parseFloat(amount || 0);
      const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₱';
      return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    expect(formatCurrency(25000, 'PHP')).toContain('₱');
    expect(formatCurrency(25000, 'PHP')).toContain('25,000.00');
    expect(formatCurrency(150, 'USD')).toContain('$');
    expect(formatCurrency(150, 'USD')).toContain('150.00');
  });

  it('accurately calculates remaining budget and over-budget states', () => {
    const calculateBudget = (estimatedBudget, expenses) => {
      const totalSpent = expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      const remaining = estimatedBudget - totalSpent;
      const percentSpent = estimatedBudget > 0 ? Math.round((totalSpent / estimatedBudget) * 100) : 0;
      return {
        totalSpent,
        remaining,
        percentSpent,
        isOverBudget: remaining < 0,
      };
    };

    const sampleExpenses = [
      { category: 'transportation', amount: 5000 },
      { category: 'accommodation', amount: 10000 },
      { category: 'food', amount: 3000 },
    ];

    const result = calculateBudget(20000, sampleExpenses);
    expect(result.totalSpent).toBe(18000);
    expect(result.remaining).toBe(2000);
    expect(result.percentSpent).toBe(90);
    expect(result.isOverBudget).toBe(false);

    // Over budget test
    const overExpenses = [...sampleExpenses, { category: 'activities', amount: 5000 }];
    const overResult = calculateBudget(20000, overExpenses);
    expect(overResult.totalSpent).toBe(23000);
    expect(overResult.remaining).toBe(-3000);
    expect(overResult.isOverBudget).toBe(true);
  });

  it('validates trip date ranges', () => {
    const isDateRangeValid = (startDate, endDate) => {
      if (!startDate || !endDate) return false;
      return new Date(endDate) >= new Date(startDate);
    };

    expect(isDateRangeValid('2026-11-01', '2026-11-05')).toBe(true);
    expect(isDateRangeValid('2026-11-05', '2026-11-01')).toBe(false);
    expect(isDateRangeValid('2026-11-01', '2026-11-01')).toBe(true);
    expect(isDateRangeValid('', '2026-11-05')).toBe(false);
  });
});
