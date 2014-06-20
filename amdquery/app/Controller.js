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
  "use strict";
  this.describe( "Super Controller Class" );
  var Controller = CustomEvent.extend( "Controller", {
    init: function( view, models ) {
      this._super();
      this._controllers = [];

      this.view = view;

      // this.view.initWidget( );

      var controllers = Controller.loadController( this.view.topElement );

      this._controllers = controllers;
      if ( controllers.length ) {
        for ( var i = controllers.length - 1, controller; i >= 0; i-- ) {
          controller = controllers[ i ];
          if ( controller.getId() ) {
            this[ controller.getId() ] = controller;
          }
        }
      }
      Controller.collection.add( this );

      config.app.debug && $.logger( "Controller", ( this.constructor._AMD.id ) + " load" );

    },
    loadController: function() {
      return [];
    },
    addModels: function( models ) {
      if ( !typed.isArray( models ) ) {
        models = $.util.argToArray( arguments );
      }
      this.models = this.models.concat( models );
    },
    destroy: function() {
      for ( var i = this._controllers.length - 1; i >= 0; i-- ) {
        this._controllers[ i ].destroy();
      }

      Controller.collection.removeController( this );

      this.view.destroy();
    },
    activate: function() {
      var event = {
        type: "activated"
      }
      this.trigger( event.type, this, event );
      return this
    },
    deactivate: function() {
      var event = {
        type: "deactivate"
      }
      this.trigger( event.type, this, event );
      return this;
    }
  }, {
    getView: function() {

    },
    // controller must be <controller></conroller>
    loadController: function( node ) {
      var contollersElement = typed.isNode( node, "controller" ) ? $( node ) : ( typed.isNode( node, "body" ) ? [ query.find( "controller", node )[ 0 ] ] : query.find( "controller", node ) ),
        controller = [],
        ret = [];

      if ( contollersElement.length && contollersElement[ 0 ] ) {
        var
          element,
          src,
          i = 0,
          len = contollersElement.length,
          ControllerModule = null,
          Controller = null;

        for ( ; i < len; i++ ) {
          element = contollersElement[ i ];
          //fix ie678
          element.style.display = "block";
          src = attr.getAttr( element, "src" );
          src = $.util.removeSuffix( src );
          ControllerModule = ClassModule.getModule( src );
          if ( !( ControllerModule && ControllerModule.isReady() ) ) {
            throw new Error( "If you Write '<Controller/>' in xml and auto init, you must define them in dependencies of controller file" );
          }
          controller = new ControllerModule.first( element );
          ret.push( controller );
          controller.setId( attr.getAttr( element, "id" ) );
        }

      }
      return ret;
    }
  } );

  var ControllerCollection = object.Collection( Controller, {} );

  Controller.collection = new ControllerCollection();

  object.createPropertyGetterSetter( Controller, {
    id: "-pu -r -w"
  } );

  return Controller;
} );