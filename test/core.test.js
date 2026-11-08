import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHSTS } from '../src/index.js';

test('parses a basic HSTS header', () => {
  const result = parseHSTS('max-age=31536000');
  assert.deepStrictEqual(result, {
    maxAge: 31536000,
    includeSubDomains: false,
    preload: false,
  });
});

test('parses includeSubDomains and preload flags', () => {
  const result = parseHSTS('max-age=31536000; includeSubDomains; preload');
  assert.deepStrictEqual(result, {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  });
});

test('is case-insensitive for directive names', () => {
  const result = parseHSTS('MAX-AGE=31536000; IncludeSubDomains; PRELOAD');
  assert.deepStrictEqual(result, {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  });
});

test('ignores unknown directives', () => {
  const result = parseHSTS('max-age=31536000; foo; bar=baz');
  assert.deepStrictEqual(result, {
    maxAge: 31536000,
    includeSubDomains: false,
    preload: false,
  });
});

test('tolerates whitespace around directives and equals', () => {
  const result = parseHSTS('  max-age = 31536000 ;  includeSubDomains  ; preload  ');
  assert.deepStrictEqual(result, {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  });
});

test('returns null when max-age is missing', () => {
  assert.equal(parseHSTS('includeSubDomains; preload'), null);
});

test('returns null when max-age is not a valid integer', () => {
  assert.equal(parseHSTS('max-age=abc'), null);
  assert.equal(parseHSTS('max-age=12.5'), null);
  assert.equal(parseHSTS('max-age=-1'), null);
});

test('returns null for empty or non-string input', () => {
  assert.equal(parseHSTS(''), null);
  assert.equal(parseHSTS('   '), null);
  assert.equal(parseHSTS(null), null);
  assert.equal(parseHSTS(undefined), null);
});

test('last max-age wins when duplicated', () => {
  const result = parseHSTS('max-age=100; max-age=200');
  assert.deepStrictEqual(result, {
    maxAge: 200,
    includeSubDomains: false,
    preload: false,
  });
});

test('ignores max-age without a value', () => {
  const result = parseHSTS('max-age; includeSubDomains');
  assert.equal(result, null);
});

test('accepts zero max-age', () => {
  const result = parseHSTS('max-age=0');
  assert.deepStrictEqual(result, {
    maxAge: 0,
    includeSubDomains: false,
    preload: false,
  });
});
