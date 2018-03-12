describe('reverse compare', function () {
    var { rcompare } = require('../publicsuffix');

    it('compares a < b', function () {
        expect(rcompare('a', 'b')).toBe(-1);
    });

    it('compares a == a', function () {
        expect(rcompare('a', 'a')).toBe(0);
    });

    it('compares a < ba', function () {
        expect(rcompare('a', 'ba')).toBe(-1);
    });

    it('compares aaa < aba', function () {
        expect(rcompare('aaa', 'aba')).toBe(-1);
    });

    it('compares unicode characters', function () {
        expect(rcompare('AA', '\u4141')).toBe(-1);
    });

    it('can recognizes wildcard prefix', function () {
        var asteriskrcompare = rcompare.wildcard('*');
        expect(asteriskrcompare('abc', '*c')).toBe(0);
    });

    it('still processes suffix with a wildcard prefix', function () {
        var asteriskrcompare = rcompare.wildcard('*');
        expect(asteriskrcompare('abc', '*b')).toBe(1);
    });
});

describe("parser", function () {
    var { parse } = require('../publicsuffix');

    it('recognizes and sorts standard format', function () {
        var contents = '\r\n\
// comment\r\n\
\r\n\
  \r\n\
a\r\
// more comment\r\n\
c  // end of line comment\n\
\r\n\
*.b\r\n\
!w.b';

        expect(parse(contents)).toEqual(['a', '*.b', '!w.b', 'c']);
    });

    it('punyencodes non-ASCII characters', function () {
        var contents = 'ascii\r\nxn--s9brj9c\r\nভারত';

        expect(parse(contents)).toEqual(['xn--45brj9c', 'xn--s9brj9c', 'ascii']);
    });
});
