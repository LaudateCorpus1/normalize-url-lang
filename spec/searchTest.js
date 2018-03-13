describe('reverse compare', function () {
    var { rcompare } = require('../search');

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

describe('binary search', function () {
    var { search } = require('../search');

    it('finds element in the middle of a sorted array', function () {
        expect(search([1, 3, 5, 7, 9], 5)).toBe(2);
    });

    it('finds element at the beginning of a sorted array', function () {
        expect(search([1, 3, 5, 7, 9], 1)).toBe(0);
    });

    it('finds element at the end of a sorted array', function () {
        expect(search([1, 3, 5, 7, 9], 9)).toBe(4);
    });

    it('return null on not found', function () {
        expect(search([1, 3, 5, 7, 9], 4)).toBeNull();
    });

    describe('with reverse wildcard comparator', function () {
        var { rcompare } = require('../search');

        it('finds a fully matching string', function () {
            expect(search(['org', 'com', 'biz'], '*com', rcompare.wildcard('*'))).toBe(1);
        });

        it('finds wildcard match', function () {
            expect(search(['org', '*com', 'biz'], '*avast.com', rcompare.wildcard('*'))).toBe(1);
        });

        it('finds wildcard match', function () {
            expect(search(['org', '*.avg.com', 'biz'], '*avast.com', rcompare.wildcard('*'))).toBeNull();
        });
    });
});
