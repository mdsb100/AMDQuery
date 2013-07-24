myQuery.define( "app/Application", [ "base/promise", "main/attr", "main/CustomEvent", "main/query", "main/object", "app/View", "app/Controller", "ecma5/array.compati" ], function( $, Promise, attr, CustomEvent, query, object, View, Controller, Array, undefined ) {
  "use strict"; //启用严格模式
  //var views = [];
  var models = [ ];
  //var controller = [];
  var defaultViewSrc = "app/View";

  var getControllerSrcByViewSrc = function( viewSrc ) {
    var controllerSrc = viewSrc;

    if ( viewSrc.indexOf( "View" ) > -1 ) {
      controllerSrc.replace( "View", "Controller" );
    }
    if ( viewSrc.indexOf( "view" ) > -1 ) {
      controllerSrc.replace( "view", "controller" );
    }

    if ( viewSrc != controllerSrc ) {
      return controllerSrc;
    }

    return "app/Controller";
  }

  var Application = object.extend( "Application", {
    init: function( promiseCallback ) {
      this._super( );
      var self = this;

      var ready = new Promise( );

      var eles = query.find( "View" ),
        viewSrc = "",
        controllerSrc = "";

      this.views = [ ];
      this.controllers = [ ];
      this.models = [];

      eles.each( function( element ) {
        //注意销毁

        viewSrc = attr.getAttr( element, "src" ) || defaultViewSrc;
        controllerSrc = attr.getAttr( element, "controller" ) || getControllerSrcByViewSrc( viewSrc );

        ready = ready.then( function( ) {
          var promise = new Promise( );
          require( viewSrc, function( View ) {
            var view = new View( element );
            self.views.push(view);
            promise.resolve( view );
          } );
          return promise;
        } )
        .then(function(view){
            var promise = new Promise();
            var modelsSrc = view.getModelsSrc();
            if(modelsSrc.length){
                require(modelsSrc, function(){
                    var models = $.util.argToArray(arguments).map(function(Model){
                        return new Model();
                    });
                    view.addModels(models);
                    self.models = this.models.concat(models);
                    promise.resolve(view)
                });
                return promise;
            }
            else{
                return view;
            }
        })
        .then( function( view ) {
          var promise = new Promise( );
          require( controllerSrc, function( Controller ) {
            var controller = new Controller( view );
            self.controllers.push(controller);
            promise.resolve( controller );
          } );
          return promise;
        } );

      } );


      ready.then( function( ) {
        self.launch( );
        promiseCallback.resolve( );
      } );

      ready.rootResolve( );

      this.ready = ready;
    },
    launch: function( ) {

    }
  }, {

  }, CustomEvent );

  return Application;
} );