myQuery.define("app/View", ["main/object", "main/attr", "main/CustomeEvent", "module/Widget"], function($, object, attr, CustomeEvent, Widget, undefined) {
    "use strict"; //启用严格模式
    var View = object.extend("View", {
        init: function(ViewElement, models){
        	this.element = ViewElement;
        	this.src = attr.getAttr(this.element, "src") || "app/View";
            //不能有相同的两个src 
        	this.modelsSrc = $.filterSame(query.find("Model", this.element).eles.map(function(ele, arr){
                return attr.getAttr(ele, "src");
            }));
            this.models = models || [];
        },
        getModelsSrc: function(){
        	return this._modelsSrc;
        },
        addModels: function(models){
            if(!$.isArr(models)){
                models = $.util.argToArray(arguments)
               
            }
            this.models = this._models.concat(models);
        }
    }, {

    }, CustomeEvent);

    object.providePropertyGetSet(View, {
        element: "-pu -r",
        src: "-pu -r",
        modelsSrc: "-pu -r"
        models: "-pu -r"
    });

    return View;
});