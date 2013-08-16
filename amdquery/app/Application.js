aQuery.define( "app/Application", [ "base/ClassModule", "base/promise", "base/typed", "main/CustomEvent", "main/object", "app/Model", "app/View", "app/Controller", "ecma5/array.compati" ], function( $, ClassModule, Promise, typed, CustomEvent, object, BaseModel, BaseView, BaseController, Array, undefined ) {
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
      // this.ready = new Promise( );
      // this.__promiseCallback = promiseCallback;
      this.index = null;
      this.load( );
    },
    getAppRelativePath: function( path ) {
      if ( path ) {
        path = path.indexOf( "/" ) == 0 ? "" : "/" + path;
        return ClassModule.variable( "app" ) + path;
      } else {
        return "";
      }
    },
    load: function( ) {
      // var self = this;

      // var ready = this.ready;
      if ( !this.index ) {
        this.index = Controller.loadController( document.body, "Index" );
      }
      // ready.then( function( ) {
      //   self.launch( );
      //   self.__promiseCallback.resolve( );
      //   delete self.__promiseCallback;
      // } );

      // ready.rootResolve( );
    },

    launch: function( ) {

    }
  }, {

  }, CustomEvent );

  return Application;
}, "1.0.0" );