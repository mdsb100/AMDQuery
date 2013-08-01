aQuery.define( "app/Application", [ "base/promise", "base/typed", "main/attr", "main/CustomEvent", "main/query", "main/object", "app/Model", "app/View", "app/Controller", "ecma5/array.compati" ], function( $, Promise, typed, attr, CustomEvent, query, object, BaseModel, BaseView, BaseController, Array, undefined ) {
  "use strict"; //启用严格模式
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
  };

  var Application = object.extend( "Application", {
    init: function( promiseCallback ) {
      this._super( );
      this.ready = new Promise( );
      this.__promiseCallback = promiseCallback;
    },
    getAppRelativePath: function( path ) {
      if ( path ) {
        path = path.indexOf( "/" ) == 0 ? "" : "/" + path;
        return require.variable( "app" ) + path;
      } else {
        return "";
      }
    },
    _findViewElement: function( parent ) {
      var children = query.find( ">*", parent ),
        viewElements = [ ],
        lave = [ ],
        ele,
        i = 0;

      for ( i = children.length - 1; i >= 0; i-- ) {
        ele = children[ i ];
        if ( typed.isNode( ele, "View" ) ) {
          viewElements.push( ele );
        } else {
          lave.push( ele );
        }
      }


      for ( i = lave.length - 1; i >= 0; i-- ) {
        ele = lave[ i ];
        viewElements = viewElements.concat( this._findViewElement( ele ) );
      }

      return viewElements;
    },
    load: function( ) {
      var self = this;

      var ready = this.ready,
        eles = this._findViewElement( document.body );

      eles.forEach( function( element ) {
        //注意销毁
        var viewSrc = self.getAppRelativePath( attr.getAttr( element, "src" ) ) || defaultViewSrc;
        var controllerSrc = self.getAppRelativePath( attr.getAttr( element, "controller" ) || getControllerSrcByViewSrc( viewSrc ) );

        ready = ready.then( function( ) {

        } );

        // ready = ready.then( function( ) {
        //   var promise = this;
        //   require( viewSrc, function( View ) {
        //     promise.resolve( BaseView.getInstance( element, View ) );
        //   } );
        //   return promise;
        // } ).then( function( view ) {
        //   var promise = this;

        //   var modelsSrc = view._getModelsSrc( ).map( function( src ) {
        //     return self.getAppRelativePath( src );
        //   } );

        //   var modelsElement = view._getModelsElement( );

        //   if ( modelsSrc.length ) {
        //     require( modelsSrc, function( ) {
        //       var models = $.util.argToArray( arguments ).map( function( Model, index ) {
        //         return BaseModel.getInstance( modelsElement[ index ], Model );
        //       } );
        //       promise.resolve( view );
        //     } );
        //     return promise;
        //   } else {
        //     return view;
        //   }
        // } ).then( function( view ) {
        //   var promise = this;
        //   require( controllerSrc, function( Controller ) {
        //     promise.resolve( BaseController.getInstance( element, Controller ) );
        //   } );
        //   return promise;
        // } );

      } );

      ready.then( function( ) {
        self.launch( );
        self.__promiseCallback.resolve( );
        delete self.__promiseCallback;
      } );

      ready.rootResolve( );
    },

    launch: function( ) {

      return self.trigger( "launch", self );
    }
  }, {

  }, CustomEvent );

  return Application;
}, "1.0.0" );