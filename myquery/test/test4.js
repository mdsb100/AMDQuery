/// <reference path="../myquery.js" />

define("test/a", function () {
    return {
        alert: function () { console.log("a"); }
    }
});
define("test/b", function () {
    return {
        alert: function () { console.log("b"); }
    }
});
define("test/c", ["test/a", "test/b"], function () {
    return {
        alert: function () { console.log("c"); }
    }
});
define("test/test4", ["test/test7"], function () {
    return {
        alert: function () { console.log("test4"); }
    }
});  
