myQuery.define("app/Controller", ["main/object", "main/CustomEvent"], function($, object, CustomEvent, View, undefined) {
    "use strict"; //启用严格模式
    var Controller = object.extend("Controller", {
        init: function(view){
            this.view = view;
            this.models = view.getModels();        }
    }, {

    }, CustomEvent);

    object.providePropertyGetSet(Controller, {
        view: "-pu -r",
        models: "-pu -r"
    });

    return Controller;
});