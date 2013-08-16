aQuery.define( "app/Controller", [ "base/typed", "main/query", "main/attr", "main/object", "main/CustomEvent", "app/View", "app/Model" ], function( $, typed, query, attr, object, CustomEvent, View, Model, undefined ) {
  "use strict"; //启用严格模式
  var Controller = object.extend( "Controller", {
    init: function( view, models ) {
      this._super( );
      this.view = view;
      this.models = models || [ ];
      this.id = view.getId( );
      Controller.collection.add( this );
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