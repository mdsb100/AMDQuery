aQuery.define( "app/Application", [ "base/ClassModule", "base/Promise", "base/typed", "main/CustomEvent", "main/object", "app/Model", "app/View", "app/Controller", "ecma5/array.compati" ], function( $, ClassModule, Promise, typed, CustomEvent, object, BaseModel, BaseView, BaseController, Array, undefined ) {
  "use strict"; //启用严格模式
  // need loading

  // var defaultViewSrc = "app/View";

  // var getControllerSrcByViewSrc = function( viewSrc ) {
  //   var controllerSrc = viewSrc;

  //   if ( viewSrc.indexOf( "View" ) > -1 ) {
  //     controllerSrc.replace( "View", "Controller" );
  //   }
  //   if ( viewSrc.indexOf( "view" ) > -1 ) {
  //     controllerSrc.replace( "view", "controller" );
  //   }

  //   if ( viewSrc != controllerSrc ) {
  //     return controllerSrc;
  //   }

  //   return "app/Controller";
  // };

  var Application = CustomEvent.extend( "Application", {
    init: function( promiseCallback ) {
      this._super( );

      var image = $.config.app.image,
        $image = $( {
          position: "absolute",
          top: "50%",
          left: "50%"
        }, "img" ).attr( "src", $.getPath( "ui/images/", image ) ),
        $cover = $( {
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 10001,
          backgroundColor: "white"
        }, "div" ).append( $image ).before( $( "body" ).children( ) );

      $image.css( {
        marginTop: -$image.width( ) + "px",
        marginLeft: -$image.height( ) + "px"
      } );

      var app = this;
      this.promise = new Promise( function( ) {
        var promise = this;

        Controller.loadController( document.body, function( controllers ) {
          app.index = controllers[ 0 ];
          app.index.ready( function( ) {
            promise.resolve( );
          } );
        } );

        return this;
      } ).then( function( ) {
        $cover.remove( );
        $cover = null;
        $image = null;

        app.launch( app.index );
        app.trigger( "ready", app, {
          type: "ready"
        } );

      } );

      this.promise.resolve( );

    },
    getAppRelativePath: function( path ) {
      if ( path ) {
        path = path.indexOf( "/" ) == 0 ? "" : "/" + path;
        return ClassModule.variable( "app" ) + path;
      } else {
        return "";
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