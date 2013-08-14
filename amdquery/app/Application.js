aQuery.define( "app/Application", [ "base/ClassModule", "base/promise", "base/typed", "main/attr", "main/CustomEvent", "main/query", "main/object", "app/Model", "app/View", "app/Controller", "ecma5/array.compati" ], function( $, ClassModule, Promise, typed, attr, CustomEvent, query, object, BaseModel, BaseView, BaseController, Array, undefined ) {
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
        return require.variable( "app" ) + path;
      } else {
        return "";
      }
    },
    // _findViewElement: function( parent ) {
    //   var children = query.find( ">*", parent ),
    //     viewElements = [ ],
    //     lave = [ ],
    //     ele,
    //     i = 0;

    //   for ( i = children.length - 1; i >= 0; i-- ) {
    //     ele = children[ i ];
    //     if ( typed.isNode( ele, "View" ) ) {
    //       viewElements.push( ele );
    //     } else {
    //       lave.push( ele );
    //     }
    //   }


    //   for ( i = lave.length - 1; i >= 0; i-- ) {
    //     ele = lave[ i ];
    //     viewElements = viewElements.concat( this._findViewElement( ele ) );
    //   }

    //   return viewElements;
    // },
    load: function( ) {
      // var self = this;

      // var ready = this.ready;
      if ( !this.index ) {
        this.index = Application.loadController( document.body, "Index" );
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
    loadController: function( container, tagName ) {
      var contollerElement = query.find( tagName || "Require" ),
        self = this;

      if ( contollerElement[ 0 ] ) {
        var src = attr.getAttr( contollerElement, "src" );
        if ( ClassModule.contains( src ) ) {
          require.sync( );
        }
        return new require( src ).first;
      }
      return null;
    }
  }, CustomEvent );

  return Application;
}, "1.0.0" );