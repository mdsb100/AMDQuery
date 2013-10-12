aQuery.define( "app/Application", [
  "base/config",
  "base/ClassModule",
  "base/Promise",
  "base/typed",
  "main/CustomEvent",
  "main/object",
  "main/query",
  "main/attr",
  "app/Model",
  "app/View",
  "app/Controller",
  "ecma5/array.compati" ], function( $, config, ClassModule, Promise, typed, CustomEvent, object, query, attr, BaseModel, BaseView, BaseController, Array, undefined ) {
  "use strict"; //启用严格模式
  var Application = CustomEvent.extend( "Application", {
    init: function( promiseCallback ) {
      this._super( );

      this._routerMap = {};

      var image = config.app.image,
        $image = $( {
          position: "absolute",
          top: "50%",
          left: "50%"
        }, "img" ).attr( "src", ClassModule.getPath( "@app/asset/images/", image ) ),
        $cover = $( {
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 10001,
          backgroundColor: "white"
        }, "div" ).append( $image ).insertBefore( $( "body" ).children( ) );

      $image.css( {
        marginTop: -$image.width( ) + "px",
        marginLeft: -$image.height( ) + "px"
      } );

      var app = this;
      this.promise = new Promise( function( ) {
        var promise = new Promise;
        app.beforeLoad( promise );
        app.trigger( "beforeLoad", app, {
          type: "beforeLoad"
        } );
        return promise;
      } ).then( function( ) {
        var controllerElement = app.parseRouter( );

        return controllerElement || document.body;

      } ).then( function( node ) {
        var promise = new Promise;

        BaseController.loadController( node, function( controllers ) {
          app.index = controllers[ 0 ];
          app.index.ready( function( ) {
            promise.resolve( );
          } );
        } );

        return promise;
      } ).then( function( ) {
        setTimeout( function( ) {
          $cover.remove( );
          $cover = null;
          $image = null;
        }, 1000 )

        app.launch( app.index );

        config.app.consoleStatus && console.log( "app load" );

        app.trigger( "ready", app, {
          type: "ready"
        } );

        promiseCallback.resolve( );

      } );

      this.promise.rootResolve( );

    },
    getAppRelativePath: function( path ) {
      if ( path ) {
        path = path.indexOf( "/" ) == 0 ? "" : "/" + path;
        return ClassModule.variable( "app" ) + path;
      } else {
        return "";
      }
    },
    beforeLoad: function( promise ) {
      promise.resolve( );
    },
    addRouter: function( key, value ) {
      this._routerMap[ key ] = value;
      return this;
    },
    parseRouter: function( ) {
      var hash = window.location.hash,
        ret = hash.match( /\$(.*)\$/ )
        if ( ret && ret.length > 1 ) {
          var controllerSrc = this._routerMap[ ret[ 1 ] ];
          if ( controllerSrc ) {
            var $body = $( document.body );
            $body.children( "controller" ).remove( );
            var controllerElement = $( $.createEle( "controller" ) ).attr( "src", controllerSrc );
            $body.append( controllerElement );
            return controllerElement[ 0 ];
          }
        }
    },
    launch: function( ) {

    },
    ready: function( fn ) {
      this.promise.and( fn );
      return this;
    }
  }, {

  } );

  return Application;
}, "1.0.0" );