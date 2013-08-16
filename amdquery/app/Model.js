aQuery.define( "app/Model", [ "main/attr", "main/object", "main/CustomEvent" ], function( $, attr, object, CustomEvent, undefined ) {
  "use strict"; //启用严格模式
  //有instance 则需要去查找
  var Model = CustomEvent.extend( {
    init: function( modelElement ) {
      this._super( );
      this.element = modelElement;
      this.id = attr.getAttr( modelElement, "id" ) || null;
      this.src = attr.getAttr( modelElement, "src" );
      Model.collection.add( this );
    },
    destory: function( ) {
      Model.collection.remove( this );
    }
  }, {
    // getInstance: function( modelElement, ModelObject ) {
    //   var instance = attr.getAttr( modelElement, "instance" ),
    //   src = attr.getAttr( modelElement, "src" ),
    //   model = this.getModel( src );

    //   if ( instance || !model) {
    //     return ModelObject ? new ModelObject( modelElement ) : new Model( modelElement );
    //   }

    //   return model;
    // },
  } );

  var ModelCollection = object.Collection( Model, {} );

  Model.collection = new ModelCollection;

  object.providePropertyGetSet( Model, {
    element: "-pu -r",
    id: "-pu -r",
    src: "-pu -r"
  } );

  return Model;
} );