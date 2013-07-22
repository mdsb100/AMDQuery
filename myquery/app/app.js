myQuery.define("app/app", ["base/promise", "main/query", "app/Controller"], function($, Promise, query, Controller, undefined) {
    "use strict"; //启用严格模式
    var views = [];
    var models = [];
    var controller = [];

    var ready;

    var app = {
        __launch: function(promise){
            ready = promise;

            ready.resolve();
        }

    };

    return app;
});