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
