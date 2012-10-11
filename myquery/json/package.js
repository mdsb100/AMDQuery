/// <reference path="../myquery.js" />

myQuery.define("json/package", function ($, undefinded) {
    "use strict"; //启用严格模式
    var main = ["main/data", "main/attr", "main/class", "main/communicate", "main/CustomEvent", "main/dom", "main/event", "main/query"];
    return {
        main: main
    }

});