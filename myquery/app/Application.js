myQuery.define( "app/Application", [ "base/promise", "main/attr", "main/CustomEvent", "main/query", "main/object", "ecma5/array.compati" ], function( $, Promise, attr, CustomEvent, query, object, Array, undefined ) {
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

      this.views = [ ];
      this.controllers = [ ];
      this.models = [ ];
      this.ready = new Promise( );
      this.__promiseCallback = promiseCallback;

    },
    load: function( ) {
      var self = this;

      var
      ready = this.ready,
      eles = query.find( "View" ),
      viewSrc = "",
      controllerSrc = "";

      eles.each( function( element ) {
        //注意销毁
        viewSrc = attr.getAttr( element, "src" ) || defaultViewSrc;
        controllerSrc = attr.getAttr( element, "controller" ) || getControllerSrcByViewSrc( viewSrc );

        ready = ready.then( function( ) {
          var promise = new Promise( );
          require( viewSrc, function( View ) {
            var view = new View( element );
            promise.resolve( view );
          } );
          return promise;
        } ).then( function( view ) {
          var promise = new Promise( );
          var modelsSrc = view._getModelsSrc( );
          var modelsElement = view._getModelsElement( );

          if ( modelsSrc.length ) {
            require( modelsSrc, function( ) {
              var models = $.util.argToArray( arguments ).map( function( Model, index ) {
                return new Model( modelsElement[index] );
              } );
              promise.resolve( view )
            } );
            return promise;
          } else {
            return view;
          }
        } ).then( function( view ) {
          var promise = new Promise( );
          require( controllerSrc, function( Controller ) {
            var controller = new Controller( view );
            promise.resolve( controller );
          } );
          return promise;
        } );

      } );


      ready.then( function( ) {
        self.launch( );
        self.trigger( "launch", self );
        self.__promiseCallback.resolve( );
        delete self.__promiseCallback;
      } );

      ready.rootResolve( );
    },
    _getView: function( id ) {
      var result;
      this.views.forEach( function( view, index ) {
        if ( view.getId( ) === id ) {
          result = view;
        }
      } );
      return result;
    },
    addView: function( view ) {
      if ( this.views.indexOf( ) === -1 ) {
        this.views.push( view )
      }
    },
    removeView: function( ) {
      var index = this.views.indexOf( );
      if ( index > -1 ) {
        this.views.splice( index, 1 );
      }
    },

    _getController: function( id ) {
      var result;
      this.controllers.forEach( function( controller, index ) {
        if ( controller.getId( ) === id ) {
          result = controller;
        }
      } );
      return result;
    },
    addController: function( ) {
      if ( this.controllers.indexOf( ) === -1 ) {
        this.controllers.push( view )
      }
    },
    removeController: function( ) {
      var index = this.controllers.indexOf( );
      if ( index > -1 ) {
        this.controllers.splice( index, 1 );
      }
    },

    _getModel: function( id ) {
      var result;
      this.models.forEach( function( models, index ) {
        if ( models.getId( ) === id ) {
          result = models;
        }
      } );
      return result;
    },
    addModel: function( ) {
      if ( this.models.indexOf( ) === -1 ) {
        this.models.push( view )
      }
    },
    removeModel: function( ) {
      var index = this.models.indexOf( );
      if ( index > -1 ) {
        this.models.splice( index, 1 );
      }
    },
    launch: function( ) {

    }
  }, {

  }, CustomEvent );

  return Application;
} );