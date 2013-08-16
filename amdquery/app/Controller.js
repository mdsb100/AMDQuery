aQuery.define( "app/Controller", [ "base/typed", "base/Promise", "main/query", "main/attr", "main/object", "main/CustomEvent", "app/View", "app/Model" ], function( $, typed, Promise, query, attr, object, CustomEvent, View, Model, undefined ) {
  "use strict"; //启用严格模式
  var Controller = CustomEvent.extend( "Controller", {
    init: function( id, contollerElement, view, models ) {
      this._super( );
      this.id = id;
      this.view = view;
      this.models = models || [ ];
      Controller.collection.add( this );
      var self = this;
      this.view.on( "domReady", function( ) {

      } );
    },
    event: function( e ) {

    },
    _initHandler: function( ) {
      var self = this;
      this.event = function( e ) {
        switch ( e.type ) {
          case "domReady":
            self.onReady( );
            break;
        }
      };
    },
    addModels: function( models ) {
      if ( !typed.isArr( models ) ) {
        models = $.util.argToArray( arguments );
      }
      this.models = this.models.concat( models );
    },
    destory: function( ) {
      Controller.collection.removeController( this );
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

  var ControllerCollection = object.Collection( Controller );

  Controller.collection = new ControllerCollection;

  object.providePropertyGetSet( Controller, {
    view: "-pu -r",
    models: "-pu -r",
    id: "-pu -r"
  } );

  return Controller;
} );