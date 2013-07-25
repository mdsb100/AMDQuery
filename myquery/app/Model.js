myQuery.define( "app/Model", [ "main/object", "main/CustomEvent", "app/Application" ], function( $, object, CustomEvent, Application, undefined ) {
  "use strict"; //启用严格模式
  var Model = object.extend( "Model", {
    init: function( modelElement ) {
      this._super( );
      this.element = modelElement;
      this.id = attr.getAttr( modelElement, "id" ) || null;
      $.application.addModel( this );
    },
    destory: function( ) {
      $.application.removeModel( this );
    }
  }, {

  }, CustomEvent );

  object.providePropertyGetSet( View, {
    element: "-pu -r",
    id: "-pu -r"
  } );

  return Model;
} );