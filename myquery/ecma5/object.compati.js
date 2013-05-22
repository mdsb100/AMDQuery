define("ecma5/objcet.compati", function () {
    "use strict"; //启用严格模式
    var fun = function () { }, obj = {
        getPrototypeOf: fun
        , getOwnPropertyDescriptor: fun
        , getOwnPropertyNames: fun
        , create: fun
        , defineProperty: fun
        , defineProperties: fun
        , seal: fun
        , freeze: fun
        , preventExtensions: fun
        , isSealed: fun
        , isFrozen: fun
        , isExtensible: fun
        , keys: fun
    }
    for (var i in obj) {
        Object.prototype[i] || (Object.prototype[i] = obj[i]);
    }

    return Object;

});