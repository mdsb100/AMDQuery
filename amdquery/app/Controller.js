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

      var controllers = Controller.loadController( this.view.topElement );
      this._controllers = controllers;
      if ( controllers.length ) {
        for ( var i = controllers.length - 1, controller; i >= 0; i-- ) {
          controller = controllers[ i ];
          if ( controller.getId( ) ) {
            this[ controller.getId( ) ] = controller;
          }
        }
      }
      Controller.collection.add( this );

      config.app.debug && console.log( "Controller " + ( this.constructor._AMD.id ) + " load" );

    },
    addModels: function( models ) {
      if ( !typed.isArr( models ) ) {
        models = $.util.argToArray( arguments );
      }
      this.models = this.models.concat( models );
    },
    destroy: function( ) {
      for ( var i = this._controllers.length - 1; i >= 0; i-- ) {
        this._controllers[ i ].destroy( );
      }

      Controller.collection.removeController( this );

      this.view.destroy( );
    }
  }, {
    getView: function( ) {

    },
    loadController: function( node ) {
      var contollersElement = typed.isNode( node, "controller" ) ? $( node ) : query.find( "controller", node ),
        controller = [ ],
        ret = [ ];

      if ( contollersElement.length ) {
        var
        element,
          src,
          i = 0,
          len = contollersElement.length,
          ControllerModule = null,
          Controller = null;

        for ( ; i < len; i++ ) {
          element = contollersElement[ i ];
          element.style.display = "block";
          src = attr.getAttr( element, "src" );
          src = $.util.removeSuffix( src );
          ControllerModule = ClassModule.getModule( src );
          if ( !( ControllerModule && ControllerModule.isReady( ) ) ) {
            throw "If you Write '<Controller/>' in xml and auto init, you must define them in dependencies of controller file"
          }
          controller = new ControllerModule.first( element );
          ret.push( controller );
          controller.setId( attr.getAttr( element, "id" ) );
        }

      }

      return ret;
    },
    _promiseControllersReady: function( controllers, callback ) {
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
    id: "-pu -r -w"
  } );

  return Controller;
} );