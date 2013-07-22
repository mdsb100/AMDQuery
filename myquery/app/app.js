myQuery.define("app/app", ["base/promise", "main/query", "app/View", "app/Controller", "ecma5/array.compati"], function($, Promise, query, View, Controller, Array, undefined) {
    "use strict"; //启用严格模式
    //var views = [];
    var models = [];
    //var controller = [];
    var defaultViewSrc = "app/View";

    var getControllerSrcByViewSrc = function(viewSrc){
        var controllerSrc = viewSrc;

        if(viewSrc.indexOf("View") > -1){
            controllerSrc.replace("View", "Controller");
        }
        if(viewSrc.indexOf("view") > -1){
            controllerSrc.replace("view", "controller");
        }

        if(viewSrc != controllerSrc){
            return controllerSrc;
        }

        return "app/Controller"
    }

    var app = {
        __launch: function(appSrc, ready){
            MVCReady = new Promise();

            var eles = query.find("View").reserve(),
            viewSrc = "",
            controllerSrc = "";

            var views = [],
            controllers = [];

            eles.each(function(element) {
                //可以加载自己的View文件

                //注意销毁

                viewSrc = attr.getAttr(item, "src") || defaultViewSrc;
                controllerSrc = attr.getAttr(item, "controller") || getControllerSrcByViewSrc(viewSrc);

                MVCReady.then(function(){
                    var promise = new Promise();
                    require(viewSrc, function(View){
                        promise.resolve(new View(element));
                    });
                    return promise;
                }).then(function(view){
                    var promise = new Promise();
                    var modelsSrc = view.getModelsSrc();
                    if(modelsSrc.length){
                        require(modelsSrc, function(){
                            var models = $.util.argToArray(arguments).map(function(Model){
                                return new Model();
                            });
                            view.addModels(models);

                            promise.resolve(view)
                        });

                        return promise;
                    }
                    else{
                        return view;
                    }
                }).then(function(view){
                    var promise = new Promise();
                    require(controllerSrc, function(Controller){
                        promise.resolve(new Controller(view));
                    });
                    return promise;
                });

            });


            MVCReady.then(function(){
                ready.resolve();
                setTimeout(function(){
                    MVCReady.removeTree();
                    MVCReady = null;
                }, 0);
            });

            MVCReady.rootResolve();

            //ready.resolve();
        }

    };

    return app;
});