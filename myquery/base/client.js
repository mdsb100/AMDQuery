/// <reference path="../myquery.js" />
// quote from colo.js by Andrew Brehaut, Tim Baumann

myQuery.define("base/client", function ($) {
    var reg = RegExp,
    client = {
        browser: {
            opera: false
            , chrome: false
            , safari: false
            , kong: false
            , firefox: false
            , ie: false
            , ie678: false
        }
        , engine: {
            opera: false
            , webkit: false
            , khtml: false
            , gecko: false
            , ie: false
            , ie678: false
        }
        , system: {}
        , language: ""
    };
    var 
        ua = navigator.userAgent
        , p = navigator.platform || ""
        , _browser = client.browser
        , _engine = client.engine
        , _system = client.system;

    client.language = (navigator.browserLanguage || navigator.language).toLowerCase();

    _system.win = p.indexOf("Win") == 0;
    if (_system.win) {
        if (/Win(?:dows)? ([^do]{2})\s?(\d+\.\d+)?/.test(ua)) {
            if (reg["$1"] == "NT") {
                switch (reg["$2"]) {
                    case "5.0":
                        _system.win = "2000";
                        break;
                    case "5.1":
                        _system.win = "XP";
                        break;
                    case "6.0":
                        _system.win = "Vista";
                        break;
                    default:
                        _system.win = "NT";
                        break;
                }
            }
            else if (reg["$1"]) {
                _system.win = "ME";
            }
            else {
                _system.win = reg["$1"];
            }
        }
    }

    _system.mac = p.indexOf("Mac") == 0;
    _system.linux = p.indexOf("Linux") == 0;
    _system.iphone = ua.indexOf("iPhone") > -1;
    _system.ipod = ua.indexOf("iPod") > -1;
    _system.ipad = ua.indexOf("iPad") > -1;
    _system.pad = ua.indexOf("pad") > -1;
    _system.nokian = ua.indexOf("NokiaN") > -1;
    _system.winMobile = _system.win == "CE";
    _system.androidMobile = /Android/.test(ua);
    _system.ios = false;
    _system.wii = ua.indexOf("Wii") > -1;
    _system.ps = /playstation/i.test(ua);

    _system.x11 = p == "X11" || (p.indexOf("Linux") == 0);
    _system.appleMobile = _system.iphone || _system.ipad || _system.ipod;
    _system.mobile = _system.appleMobile || _system.androidMobile || /AppleWebKit.*Mobile./.test(ua) || _system.winMobile;

    if (/OS (\d).(\d).(\d) like Mac OS X/.test(ua)) {
        _system.ios = parseFloat(reg.$1 + "." + reg.$2 + reg.$3);
    }
    if (window.opera) {
        _engine.opera = _browser.opera = parseFloat(window.opera.version());
    }
    else if (/AppleWebKit\/(\S+)/.test(ua)) {
        _engine.webkit = parseFloat(reg["$1"]);
        if (/Chrome\/(\S+)/.test(ua)) {
            _browser.chrome = parseFloat(reg["$1"]);
        }
        else if (/Version\/(\S+)/.test(ua)) {
            _browser.safari = parseFloat(reg["$1"]);
        }
        else {
            var _safariVer = 1, wit = _engine.webki;
            if (_system.mac) {
                if (wit < 100) { _safariVer = 1; }
                else if (wit == 100) { _safariVer = 1.1; }
                else if (wit <= 125) { _safariVer = 1.2; }
                else if (wit < 313) { _safariVer = 1.3; }
                else if (wit < 420) { _safariVer = 2; }
                else if (wit < 529) { _safariVer = 3; }
                else if (wit < 533.18) { _safariVer = 4; }
                else if (wit < 533.49) { _safariVer = 5; }
                else { _safariVer = 5; }
            }
            else if (_system.win) {
                if (wit == 5) { _safariVer = 5; }
                else if (wit < 529) { _safariVer = 3; }
                else if (wit < 531.3) { _safariVer = 4; }
                else { _safariVer = 5; }
            }
            else if (_system.appleMobile) {
                if (wit < 526) { _safariVer = 3; }
                else if (wit < 531.3) { _safariVer = 4; }
                else { _safariVer = 5; }
            }
            _browser.safari = _safariVer;
        }
    }
    else if (/KHTML\/(\S+)/.test(ua) || /Konquersor\/([^;]+)/.test(ua)) {
        _engine.khtml = browser.kong = paresFloat(reg["$1"]);
    }
    else if (/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)) {
        _engine.gecko = parseFloat(reg["$1"]);
        //确定是不是Firefox
        if (/Firefox\/(\S+)/.test(ua)) {
            _browser.firefox = parseFloat(reg["$1"]);
        }
    }
    else if (/MSIE([^;]+)/.test(ua)) {
        _engine.ie = _browser.ie = parseFloat(reg["$1"]);
    }
    if ("\v" == "v") {
        _engine.ie678 = _browser.ie678 = _browser.ie;
    };

    $.extend($.client, client);

    return $.client;
}, "1.0.0");