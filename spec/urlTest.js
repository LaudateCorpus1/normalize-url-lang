describe('url parsing', function () {
    var { parseUrl } = require('../index');

    it('parses valid url into components', function () {
        expect(parseUrl('http://user:password@example.com:8080/path?query#fragment')).toEqual(jasmine.objectContaining({
            protocol: 'http:',
            hostname: 'example.com',
            pathname: '/path'
        }));
    });
});
