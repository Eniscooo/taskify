import { BadRequestException, NotFoundException, type ArgumentsHost } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { AllExceptionsFilter } from './filters/all-exceptions.filter.js';
import { koboToNaira, nairaToKobo } from './money.js';
import { toPage } from './pagination.js';

describe('money', () => {
  it('round-trips naira through kobo', () => {
    expect(nairaToKobo(385_000)).toBe(38_500_000n);
    expect(koboToNaira(38_500_000n)).toBe(385_000);
  });

  it('handles prices above the 32-bit integer range', () => {
    expect(koboToNaira(nairaToKobo(45_000_000))).toBe(45_000_000);
  });
});

describe('toPage', () => {
  const rows = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

  it('returns a cursor when there is another page', () => {
    expect(toPage(rows, 2, (r) => r.id)).toEqual({ items: ['a', 'b'], nextCursor: 'b' });
  });

  it('returns a null cursor on the last page', () => {
    expect(toPage(rows, 3, (r) => r.id)).toEqual({ items: ['a', 'b', 'c'], nextCursor: null });
  });
});

describe('AllExceptionsFilter', () => {
  function run(exception: unknown) {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const host = { switchToHttp: () => ({ getResponse: () => res }) } as unknown as ArgumentsHost;
    new AllExceptionsFilter().catch(exception, host);
    return { status: res.status.mock.calls[0]![0], body: res.json.mock.calls[0]![0] };
  }

  it('keeps custom codes and details from HttpExceptions', () => {
    const out = run(new BadRequestException({ code: 'VALIDATION_FAILED', message: 'Bad', details: [1] }));
    expect(out).toEqual({ status: 400, body: { error: { code: 'VALIDATION_FAILED', message: 'Bad', details: [1] } } });
  });

  it('derives a code from the status when none is given', () => {
    expect(run(new NotFoundException()).body.error.code).toBe('NOT_FOUND');
  });

  it('maps Prisma unique violations to 409', () => {
    const err = new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'test' });
    expect(run(err)).toMatchObject({ status: 409, body: { error: { code: 'CONFLICT' } } });
  });

  it('hides unexpected error details from clients', () => {
    const out = run(new Error('connection to db at 10.0.0.5 refused'));
    expect(out.status).toBe(500);
    expect(JSON.stringify(out.body)).not.toContain('10.0.0.5');
  });
});
