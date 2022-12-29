import { getDayInFuture } from './util';

describe('Utils', () => {
  beforeEach(async () => {});

  it('should return a current date', () => {
    const date = new Date('2022-12-29T16:05:39.328Z');
    expect(getDayInFuture(0, date).toISOString()).toBe(
      '2022-12-29T00:00:00.000Z',
    );
    expect(getDayInFuture(1, date).toISOString()).toBe(
      '2022-12-30T00:00:00.000Z',
    );
    expect(getDayInFuture(3, date).toISOString()).toBe(
      '2023-01-02T00:00:00.000Z',
    );
  });
});
