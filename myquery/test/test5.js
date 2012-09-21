/// <reference path="../myquery.js" />

require.config({ cache: {
    "test/a": function () {
        define("test/a", function () {
            return {
                alert: function () { console.log("a"); }
            }
        })
    },
    "test/b": function () {
        define("test/b", function () {
            return {
                alert: function () { console.log("b"); }
            }
        })
    },
    "test/c": function () {
        define("test/c", ["test/a", "test/b"], function () {
            return {
                alert: function () { console.log("c"); }
            }
        })
    },
    "test/d": function () {
        define("test/d", ["test/test3"], function () {
            return {
                alert: function () { console.log("d"); }
            }
        })
    }
}
});
