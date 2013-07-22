myQuery.define("app/Controller", ["main/object", "main/CustomeEvent", "app/View"], function($, object, CustomeEvent, View, undefined) {
    "use strict"; //启用严格模式
    var Controller = object.extend("Controller", {
        init: function(view){
            this.view = view;
            this.models = view.getModels();        }
    }, {

    }, CustomeEvent);

    object.providePropertyGetSet(Controller, {
        view: "-pu -r",
        models: "-pu -r"
    });

    return Controller;
});