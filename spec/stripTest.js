describe('strip domain by publicsuffix.org', function () {
    var { stripDomain } = require('../index');

    it('strips domain by a simple match', function () {
        var suffixData = {
            match: [ 'com', 'biz' ],
            negMatch: []
        };
        expect(stripDomain(suffixData, 'm.facebook.com')).toBe('facebook.com');
    });

    it('strips domain the longest match', function () {
        var suffixData = {
            match: [ 'aaa', 's.*.com', 'bbb.com', 'ccc.com', 'biz' ],
            negMatch: []
        };
        expect(stripDomain(suffixData, 'www.cdn.s.ccc.com')).toBe('cdn.s.ccc.com');
    });

    it('ignores negative matches from match', function () {
        var suffixData = {
            match: [ '*.ck' ],
            negMatch: [ 'www.ck' ]
        };
        expect(stripDomain(suffixData, 'm.www.ck')).toBe('www.ck');
        expect(stripDomain(suffixData, 'm.com.ck')).toBe('m.com.ck');
    });

    it('return full domain on no match', function () {
        var suffixData = {
            match: [ 'com', 'biz' ],
            negMatch: []
        };
        expect(stripDomain(suffixData, 'www.wordpress.org')).toBe('www.wordpress.org');
    });
});

describe('strip domain on real data', function () {
    var suffixData = require('../publicsuffix.json');
    var { stripDomain } = require('../index');
    var { parseUrl } = require('../url');
    var urls = {
        "http://company.localdomain/index.html": "company.localdomain",
        "http://m.facebook.com": "facebook.com",
        "http://m.facebook.co.uk": "facebook.co.uk",
        "http://accounts.google.co.in": "google.co.in",
        "https://m.co.ck": "m.co.ck",
        "https://m.www.ck": "www.ck",
        "http://\u043A\u0446.\u0440\u0444/ru/": "xn--j1ay.xn--p1ai",  // both kc.rf in azbuka
        "http://xn--j1ay.xn--p1ai/ru/": "xn--j1ay.xn--p1ai",
        "http://www.youjizz.com/login.php": "youjizz.com",
        "https://en.wiktionary.org/w/index.php?title=Special:UserLogin&returnto=Wiktionary%3AMain+Page": "wiktionary.org",
        "https://signin.ebay.fr/ws/eBayISAPI.dll?SignIn&ru=http%3A%2F%2Fwww.ebay.fr%2F": "ebay.fr",
        "http://www.tmz.com/": "tmz.com",
        "https://www.yandex.kz/": "yandex.kz",
        "https://online.hmrc.gov.uk/login?GAREASONCODE=-1&GARESOURCEID=Common&GAURI=https://online.hmrc.gov.uk/home&Reason=-1&APPID=Common&URI=https://online.hmrc.gov.uk/home": "hmrc.gov.uk",
        "https://member.neteller.com/mobile/": "neteller.com",
        "http://aajtak.intoday.in/jokeele/login.php": "intoday.in",
        "http://bm.chinaz.com/web/login.aspx": "chinaz.com",
        "https://www.olx.in/account/?ref%5B0%5D%5Baction%5D=myaccount&ref%5B0%5D%5Bmethod%5D=index": "olx.in",
        "http://www.lifebuzz.com/": "lifebuzz.com",
        "http://web.cricbuzz.com/register/user/login": "cricbuzz.com",
        "https://signin.ebay.in/ws/eBayISAPI.dll?SignIn&ru=http%3A%2F%2Fwww.ebay.in%2F": "ebay.in",
        "https://d2ufo47lrtsv5s.cloudfront.net/user/login?destination=/front": "d2ufo47lrtsv5s.cloudfront.net",
        "http://passport.xywy.com/member/login.htm?ucback=http%3A%2F%2Fwww.xywy.com%2F": "xywy.com",
        "https://accounts.google.com/ServiceLogin?hl=en&continue=https://www.google.cz/%3Fgfe_rd%3Dcr%26ei%3DaRKmVdXLIeSk8wfLq5WABQ%26gws_rd%3Dssl#identifier": "google.com",
        "https://www.facebook.com/?_rdr=p": "facebook.com",
        "https://m.facebook.com/?_rdr&refsrc=https%3A%2F%2Fwww.facebook.com%2F": "facebook.com",
        "https://login.yahoo.com/config/login?.src=fpctx&.intl=us&.done=https%3A%2F%2Fwww.yahoo.com%2F": "yahoo.com",
        "https://login.yahoo.com/m?.src=fpctx&.intl=us&.done=https%3A%2F%2Fwww.yahoo.com%2F": "yahoo.com",
        "https://www.amazon.com/ap/signin/182-1361298-3830147?_encoding=UTF8&openid.assoc_handle=anywhere_v2_us&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%3F_encoding%3DUTF8%26ref_%3Dgno_mob_top": "amazon.com",
        "https://www.amazon.com/ap/signin?_encoding=UTF8&openid.assoc_handle=usflex&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fyourstore%2Fhome%3Fie%3DUTF8%26ref_%3Dnav_ya_signin": "amazon.com",
        "https://en.wikipedia.org/wiki/Special:UserLogin": "wikipedia.org",
        "https://en.m.wikipedia.org/wiki/Special:UserLogin": "wikipedia.org",
        "http://m.intl.taobao.com/?sprefer=sypc00": "taobao.com",
        "https://mobile.twitter.com/i/guest": "twitter.com",
        "https://twitter.com/login/error?redirect_after_login=%2F": "twitter.com",
        "https://login.live.com/login.srf?wa=wsignin1.0&rpsnv=12&ct=1436948922&rver=6.4.6456.0&wp=MBI_SSL_SHARED&wreply=https:%2F%2Fmail.live.com%2Fdefault.aspx%3Frru%3Dinbox&lc=1033&id=64855&mkt=en-us&cbcxt=mai": "live.com",
        "https://accounts.google.com/ServiceLogin?hl=en&continue=https://www.google.es/%3Fgws_rd%3Dssl#identifier":	"google.com",
        "https://www.paypal.com/cz/cgi-bin/webscr?cmd=_login-run": "paypal.com",
        "https://www.linkedin.com/uas/login?fromSignIn=true&trk=touch&session_redirect=https%3A%2F%2Ftouch.www.linkedin.com%2F%3Fsessionid%3D8814554020577280%26rs%3Dfalse%26redirectUrl%3D%2523stream%26ahoy%3Dno%23stream": "linkedin.com",
        "https://www.linkedin.com/uas/login?fromSignIn=true&trk=uno-reg-join-sign-in": "linkedin.com",
        "https://signin.ebay.com/ws/eBayISAPI.dll?SignIn&UsingSSL=1&pUserId=&co_partnerId=2&siteid=0&ru=http%3A%2F%2Fmy.ebay.com%2Fws%2FeBayISAPI.dll%3FMyEbayBeta%26MyEbay%3D%26gbh%3D1%26guest%3D1&pageType=3984": "ebay.com",
        "http://vk.com/": "vk.com",
        "http://m.vk.com/": "vk.com",
        "https://instagram.com/accounts/login/": "instagram.com",
        "http://www.reddit.com/": "reddit.com",
        "https://login.aliexpress.com/buyer.htm?spm=2114.11010108.1000002.7.yEqUZC&return=http%3A%2F%2Fwww.aliexpress.com%2F": "aliexpress.com",
        "http://m.sohu.com/?_trans_=000115_3w&jump=front": "sohu.com",
        "http://www.sohu.com/": "sohu.com",
        "https://e.mail.ru/login?fail=1": "mail.ru",
        "https://www.pinterest.com/login/": "pinterest.com",
        "https://wordpress.com/wp-login.php?redirect_to=https%3A%2F%2Fwordpress.com%2F": "wordpress.com",
        "https://www.tumblr.com/login?from_splash=1": "tumblr.com",
        "https://www.tumblr.com/login": "tumblr.com",
        "https://secure2.store.apple.com/us/sign_in?c=aHR0cDovL3N0b3JlLmFwcGxlLmNvbS91cy9idXktaXBvZC9pcG9kLXRvdWNofDFhb3NkMmU3Nzk2YjgyZTA3ZTUwZjgyMDc2MzJlNzliMjBhNGIzNjY0YWI1&r=SCDHYHP7CY4H9XK2H&s=aHR0cDovL3N0b3JlLmFwcGxlLmNvbS91cy9idXktaXBvZC9pcG9kLXRvdWNofDFhb3NkMmU3Nzk2YjgyZTA3ZTUwZjgyMDc2MzJlNzliMjBhNGIzNjY0YWI1&t=S99KKATD9FP9FHCP4": "apple.com",
        "https://secure.imdb.com/oauth/m_login?origpath=/&ref_=m_nv_lgin": "imdb.com"
    };

    it('processes samples correctly', function () {
        for (var key in urls) {
            var loc = parseUrl(key);
            expect(stripDomain(suffixData, loc.hostname)).toBe(urls[key]);
        }
    });
});

describe('strip language codes from path', function () {
    var { stripPath } = require('../index');

    it('keeps path with no languages as is', function () {
        expect(stripPath('/hello/world')).toBe('/hello/world');
    });

    it('ignores partial matches', function () {
        expect(stripPath('/hello.doc')).toBe('/hello.doc');
    });

    it('keeps root path as is', function () {
        expect(stripPath('/')).toBe('/');
    });

    it('keeps empty path as is', function () {
        expect(stripPath('')).toBe('');
    });

    it('removes 2 char codes', function () {
        expect(stripPath('/en/')).toBe('/');
    });

    it('removes 3 char codes', function () {
        expect(stripPath('/bbc/')).toBe('/');
    });

    it('removes ietf char codes with a dash', function () {
        expect(stripPath('/en-US/')).toBe('/');
    });

    it('removes ietf char codes with an underscore', function () {
        expect(stripPath('/en_US/')).toBe('/');
    });

    it('removes multiple char codes', function () {
        expect(stripPath('/hello/en/en-US/index.html')).toBe('/hello/index.html');
    });

    it('removes url-encoded char codes', function () {
        expect(stripPath('/en%2DUS')).toBe('');
    });
});

describe('normalizeUrl', function () {
    var { normalizeUrl } = require('../index');
    var suffixData = require('../publicsuffix.json');

    it('removes subdomain, languages, queries and fragments', function () {
        expect(normalizeUrl(suffixData, 'https://www.example.com/de/de-ch/index.html;jsessionid=abcd')).toBe('https://example.com/index.html');
    });

    it('replaces subdomain and languages by a wildcard', function () {
        expect(normalizeUrl(suffixData, 'https://www.abc.example.com/de/de-ch/index.html;jsessionid=abcd', '*')).toBe('https://*example.com/*/*/index.html');
    });
});

describe('matchUrl', function () {
    var { matchUrl } = require('../match');
    var parseUrl = require('../url').parseUrl;

    it('compares exact domain+path match', function () {
        expect(matchUrl('https://www.abc.example.com/de/de-ch/index.html;jsessionid=abcd', 'https://www.abc.example.com/de/de-ch/index.html')).toBe(true);
    });

    it('compares wildcard domain+path match', function () {
        expect(matchUrl('https://www.abc.example.com/de/de-ch/index.html;jsessionid=abcd', 'https://*example.com/*/*/index.html')).toBe(true);
    });

    it('compares window.location-like url', function () {
        expect(matchUrl(parseUrl('https://www.abc.example.com/de/de-ch/index.html;jsessionid=abcd'), 'https://*example.com/*/*/index.html')).toBe(true);
    });

    it('matches no chacater with a wildcard', function () {
        expect(matchUrl('https://example.com/de/de-ch/index.html', 'https://*example.com/*/*/index.html')).toBe(true);
    });

    it('substrings of domain part do not match', function () {
        expect(matchUrl('https://mein-example.com/de/de-ch/index.html', 'https://*example.com/*/*/index.html')).toBe(false);
    });
});
