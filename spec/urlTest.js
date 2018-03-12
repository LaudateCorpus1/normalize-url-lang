describe('url parsing', function () {
    var { parseUrl } = require('../index');

    it('parses valid url into components', function () {
        expect(parseUrl('http://user:password@example.com:8080/path?query#fragment')).toEqual(jasmine.objectContaining({
            protocol: 'http:',
            hostname: 'example.com',
            pathname: '/path'
        }));
    });

    it('parses a few typical url examples', function () {
        var data = {
            'http://foo.com/blah_blah': { protocol: 'http:', hostname: 'foo.com', pathname: '/blah_blah' },
            'HTTP://FOO.COM/blah_blah/': { protocol: 'http:', hostname: 'foo.com', pathname: '/blah_blah/' },
            'http://foo.com/blah_blah_(wikipedia)': { protocol: 'http:', hostname: 'foo.com', pathname: '/blah_blah_' },
            'http://www.example.com/wpstyle/?p=364': { protocol: 'http:', hostname: 'www.example.com', pathname: '/wpstyle/' },
            'https://www.example.com/foo/?bar=baz#quux': { protocol: 'https:', hostname: 'www.example.com', pathname: '/foo/' },
            'http://userid:password@example.com:8080/': { protocol: 'http:', hostname: 'example.com', pathname: '/', port: '8080' },
            'gopher://127.0.0.1': { protocol: 'gopher:', hostname: '127.0.0.1', pathname: '' },  // do we want the pathname to be empty? may be
            'https://www.bank.cy/IBS/ControllerServlet;jsessionid=0001_9xUJ:VLQ0B': { protocol: 'https:', hostname: 'www.bank.cy', pathname: '/IBS/ControllerServlet' }
        };

        for (var url in data) {
            expect(parseUrl(url)).toEqual(jasmine.objectContaining(data[url]));
        }
    });

    it('accepts window.location as a parameter', function () {
        var location = {
            hash: '',
            host: 'bank.cy',
            hostname: 'bank.cy',
            href: 'https://bank.cy/IBS/ControllerServlet;jsessionid=0001_9xUJ:VLQ0B',
            origin: 'https://bank.cy',
            pathname: '/IBS/ControllerServlet;jsessionid=0001_9xUJ:VLQ0B',
            port: '',
            protocol: 'https:',
            search: ''
        };

        expect(parseUrl(location)).toEqual(jasmine.objectContaining({ protocol: 'https:', hostname: 'bank.cy', pathname: '/IBS/ControllerServlet' }));
    });
});
