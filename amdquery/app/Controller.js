aQuery.define( "app/Controller", [
  "base/config",
  "base/ClassModule",
  "base/typed",
  "base/Promise",
  "main/query",
  "main/attr",
  "main/object",
  "main/CustomEvent",
  "app/View",
  "app/Model" ], function( $,
  config,
  ClassModule,
  typed,
  Promise,
  query,
  attr,
  object,
  CustomEvent,
  View,
  Model, undefined ) {
  "use strict"; //启用严格模式
  var Controller = CustomEvent.extend( "Controller", {
    init: function( view, models ) {
      this._super( );
      this._controllers = [ ];

      this.view = view;
      // 生成Models
      //this.models = Models || [ ];

      Controller.collection.add( this );

      this.promise = new Promise( function( ) {
        var promise = new Promise( );
        this.view.domReady( function( ) {
          promise.resolve( );
        } );
        return promise;
      } ).withContext( this ).then( function( ) {
        var promise = new Promise( );
        Controller.loadController( this.view.topElement, function( controllersFromDom ) {
          promise.resolve( controllersFromDom );
        } );
        return promise;
      } ).then( function( controllersFromDom ) {
        var promise = new Promise( ),
          controllers = controllersFromDom.concat( this.loadController( ) );
        Controller._promiseControllersReady( controllers, function( controllers ) {
          promise.resolve( controllers );
        } );
        return promise;
      } ).then( function( controllers ) {
        if ( controllers.length ) {
          for ( var i = controllers.length - 1, controller; i >= 0; i-- ) {
            controller = controllers[ i ];
            if ( controller.getId( ) ) {
              this[ controller.getId( ) ] = controller;
            }
          }
          this._controllers = controllers;
          return controllers;
        }
      } ).then( function( ) {
        this.onReady( );
        config.app.debug && console.log( "Controller " + ( this.constructor._AMD.id ) + " load" );
        this.trigger( "ready", this, {
          type: "ready"
        } );

      } );

      this.promise.rootResolve( );

    },
    loadController: function( ) {
      return [ ];
    },
    addModels: function( models ) {
      if ( !typed.isArr( models ) ) {
        models = $.util.argToArray( arguments );
      }
      this.models = this.models.concat( models );
    },
    destroy: function( ) {
      this.onDestroy( );

      this.promise.destroyFromRoot( );

      this.promise = null;

      for ( var i = this._controllers.length - 1; i >= 0; i-- ) {
        this._controllers[ i ].destroy( );
      }

      Controller.collection.removeController( this );

      this.view.destroy( );
    },
    ready: function( fn ) {
      // var self;
      // setTimeout( function( ) {
      this.promise.and( fn );
      // }, 0 );
      return this;
    },
    onDestroy: function( ) {

    },
    onReady: function( ) {

    }
  }, {
    getView: function( ) {

    },
    loadController: function( node, callback ) {
      var contollersElement = typed.isNode( node, "controller" ) ? $( node ) : query.find( "controller", node ),
        controller = [ ];

      if ( contollersElement.length ) {
        var
        element,
          src,
          i = 0,
          len = contollersElement.length,
          depend = [ ];

        for ( ; i < len; i++ ) {
          element = contollersElement[ i ];
          element.style.display = "block";
          src = attr.getAttr( element, "src" );
          src = $.util.removeSuffix( src );
          depend.push( src );
        }

        require( depend, function( ) {
          var Controllers = $.util.argToArray( arguments ),
            ret = [ ],
            i = 0,
            len = Controllers.length,
            controller;

          for ( ; i < len; i++ ) {
            controller = new Controllers[ i ]( );
            ret.push( controller );
            controller.view.replaceTo( contollersElement[ i ] );
            controller.id = attr.getAttr( contollersElement[ i ], "id" );
          }

          callback( ret );

        } );
      } else {
        callback( [ ] );
      }
    },
    _promiseControllersReady: function( controllers, callback ) {
      if ( !controllers.length ) {
        callback( [ ] );
      }
      for ( var i = 0, len = controllers.length, readyCount = len; i < len; i++ ) {
        controllers[ i ].ready( function( ) {
          readyCount--;
          if ( readyCount === 0 ) {
            callback( controllers );
          }
        } );
      }
    }
  } );

  var ControllerCollection = object.Collection( Controller, {} );

  Controller.collection = new ControllerCollection( );

  object.providePropertyGetSet( Controller, {
    id: "-pu -r"
  } );

  return Controller;
} );