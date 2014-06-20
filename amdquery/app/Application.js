aQuery.define( "app/Application", [
  "base/config",
  "base/ClassModule",
  "base/Promise",
  "base/typed",
  "base/extend",
  "main/CustomEvent",
  "main/object",
  "main/query",
  "main/attr",
  "app/Model",
  "app/View",
  "app/Controller",
  "ecma5/array",
  "module/location" ], function( $, config, ClassModule, Promise, typed, utilExtend, CustomEvent, object, query, attr, BaseModel, BaseView, BaseController, utilArray, location, undefined ) {
  "use strict";
  this.describe( "Super Application Class" );
  var Application = CustomEvent.extend( "Application", {
    init: function( promiseCallback ) {
      this._super();

      $.application = this;

      this.global = {};

      utilExtend.easyExtend( this.global, this.constructor.global || {} );

      this._routerMap = {};

      this.promise = new Promise( function() {
        var promise = new Promise;
        this.beforeLoad( promise );
        this.trigger( CustomEvent.createEvent( "beforeLoad", this ) );
        return promise;
      } ).withContext( this ).then( function() {
        var controllerElement = this.parseRouter();

        return controllerElement || document.body;

      } ).then( function( node ) {
        this.index = BaseController.loadController( node )[ 0 ];
      } ).then( function() {
        this.launch( this.index );

        config.app.debug && $.logger( "app", this.constructor._AMD.id + " load" );

        this.trigger( CustomEvent.createEvent( "ready", this ) );

        promiseCallback && promiseCallback.resolve();

      } );

      this.promise.root().resolve();

    },
    getAppRelativePath: function( path ) {
      if ( path ) {
        path = path.indexOf( "/" ) === 0 ? "" : "/" + path;
        return ClassModule.variable( "app" ) + path;
      } else {
        return "";
      }
    },
    beforeLoad: function( promise ) {
      promise.resolve();
    },
    addRouter: function( key, value ) {
      this._routerMap[ key ] = value;
      return this;
    },
    parseRouter: function() {
      var appRouter = location.getHash( "appRouter" );

      if ( appRouter ) {
        var controllerSrc = this._routerMap[ appRouter ];
        if ( controllerSrc ) {
          var $body = $( document.body );
          $body.children( "controller" ).remove();
          var controllerElement = $( $.createEle( "controller" ) ).attr( "src", controllerSrc );
          $body.append( controllerElement );
          return controllerElement[ 0 ];
        }
      }
    },
    launch: function() {

    },
    ready: function( fn ) {
      this.promise.and( fn );
      return this;
    }
  }, {

  } );

  return Application;
} );