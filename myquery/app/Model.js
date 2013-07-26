myQuery.define( "app/Model", [ "main/attr", "main/object", "main/CustomEvent", "app/Application" ], function( $, attr, object, CustomEvent, Application, undefined ) {
  "use strict"; //启用严格模式
  //有instance 则需要去查找
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

  object.providePropertyGetSet( Model, {
    element: "-pu -r",
    id: "-pu -r"
  } );

  return Model;
} );