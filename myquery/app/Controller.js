myQuery.define( "app/Controller", [ "main/object", "main/CustomEvent" ], function( $, object, CustomEvent, View, undefined ) {
  "use strict"; //启用严格模式
  var Controller = object.extend( "Controller", {
    init: function( view, models ) {
      this._super( );
      this.view = view;
      this.models = models || [ ];
      this.id = view.getId( );
      Controller.addController( this );
    },
    addModels: function( models ) {
      if ( !$.isArr( models ) ) {
        models = $.util.argToArray( arguments );
      }
      this.models = this.models.concat( models );
    },
    destory: function( ) {
      Controller.removeController( this );
    }
  }, {
    controllers: [ ],
    getInstance: function( controllerElement, ControllerObject ) {
      return ControllerObject ? new ControllerObject( controllerElement ) : new Controller( controllerElement );
    },
    getController: function( id ) {
      var result;
      this.controllers.forEach( function( controller ) {
        if ( controller.getId( ) === id ) {
          result = controller;
        }
      } );
      return result;
    },
    addController: function( Controller ) {
      if ( this.controllers.indexOf( ) === -1 ) {
        this.controllers.push( Controller );
      }
    },
    removeController: function( ) {
      var index = this.controllers.indexOf( );
      if ( index > -1 ) {
        this.controllers.splice( index, 1 );
      }
    }
  }, CustomEvent );

  object.providePropertyGetSet( Controller, {
    view: "-pu -r",
    models: "-pu -r",
    id: "-pu -r"
  } );

  return Controller;
} );