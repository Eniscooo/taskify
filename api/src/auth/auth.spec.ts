import { isNigerianMobile } from './phone.js';
import { uniqueUsername, usernameBase } from './username.js';

describe('isNigerianMobile', () => {
  it.each(['+2348034127790', '+2347061234567', '+2349012345678', '+2348112345678'])('accepts %s', (phone) => {
    expect(isNigerianMobile(phone)).toBe(true);
  });

  it.each(['08034127790', '2348034127790', '+234803412779', '+2346034127790', '+2348234127790', '+447700900123'])(
    'rejects %s',
    (phone) => {
      expect(isNigerianMobile(phone)).toBe(false);
    },
  );
});

describe('usernameBase', () => {
  it('uses the first name and last initial', () => {
    expect(usernameBase('Adaeze Okafor')).toBe('adaeze.o');
    expect(usernameBase('Tunde Ade Bakare')).toBe('tunde.b');
  });

  it('handles single names, accents and symbols', () => {
    expect(usernameBase('Chidi')).toBe('chidi');
    expect(usernameBase("Fúnmi O'Neil")).toBe('funmi.o');
    expect(usernameBase('***')).toBe('user');
  });
});

describe('uniqueUsername', () => {
  it('returns the base when it is free', async () => {
    expect(await uniqueUsername('Bola Adeyemi', async () => false)).toBe('bola.a');
  });

  it('adds a number when the base is taken', async () => {
    const taken = new Set(['bola.a']);
    const name = await uniqueUsername('Bola Adeyemi', async (u) => taken.has(u));
    expect(name).toMatch(/^bola\.a\d+$/);
  });
});
