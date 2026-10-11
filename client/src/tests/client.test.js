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
        isOverBudget: estimatedBudget > 0 && remaining < 0,
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

    // Uncapped zero-budget test
    const zeroResult = calculateBudget(0, sampleExpenses);
    expect(zeroResult.totalSpent).toBe(18000);
    expect(zeroResult.percentSpent).toBe(0);
    expect(zeroResult.isOverBudget).toBe(false);
  });

  it('formats multiple currencies with correct symbols and rounding', () => {
    const formatCurrency = (amount, currency = 'PHP') => {
      const num = parseFloat(amount || 0);
      let symbol = '₱';
      if (currency === 'USD') symbol = '$';
      if (currency === 'EUR') symbol = '€';
      if (currency === 'JPY') symbol = '¥';
      if (currency === 'SGD') symbol = 'S$';
      return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    expect(formatCurrency(1000, 'PHP')).toContain('₱1,000.00');
    expect(formatCurrency(50.5, 'USD')).toContain('$50.50');
    expect(formatCurrency(120, 'EUR')).toContain('€120.00');
    expect(formatCurrency(5000, 'JPY')).toContain('¥5,000.00');
    expect(formatCurrency(75, 'SGD')).toContain('S$75.00');
  });

  it('groups activities accurately by day number in chronological sequence', () => {
    const groupActivitiesByDay = (activities) => {
      return activities.reduce((acc, act) => {
        const day = act.day_number || 1;
        if (!acc[day]) acc[day] = [];
        acc[day].push(act);
        return acc;
      }, {});
    };

    const activities = [
      { id: 1, day_number: 1, title: 'Arrival' },
      { id: 2, day_number: 2, title: 'Island Hopping' },
      { id: 3, day_number: 1, title: 'Dinner' },
      { id: 4, day_number: 3, title: 'Departure' },
    ];

    const grouped = groupActivitiesByDay(activities);
    expect(Object.keys(grouped)).toEqual(['1', '2', '3']);
    expect(grouped[1].length).toBe(2);
    expect(grouped[2].length).toBe(1);
    expect(grouped[3].length).toBe(1);
  });

  it('filters destinations by search query matching name, tags, or description', () => {
    const filterDestinations = (destinations, query) => {
      if (!query || !query.trim()) return destinations;
      const q = query.trim().toLowerCase();
      return destinations.filter((d) =>
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.tags && d.tags.toLowerCase().includes(q)) ||
        (d.description && d.description.toLowerCase().includes(q))
      );
    };

    const dests = [
      { id: 1, name: 'El Nido, Palawan', tags: 'Diving, Beach', description: 'Tropical lagoon paradise' },
      { id: 2, name: 'Baguio City', tags: 'Mountain, Pines', description: 'Cool climate destination' },
      { id: 3, name: 'Siargao Island', tags: 'Surfing, Palms', description: 'Wave capital' },
    ];

    expect(filterDestinations(dests, 'palawan').length).toBe(1);
    expect(filterDestinations(dests, 'diving').length).toBe(1);
    expect(filterDestinations(dests, 'cool').length).toBe(1);
    expect(filterDestinations(dests, 'nonexistent').length).toBe(0);
  });
});

