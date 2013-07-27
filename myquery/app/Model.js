myQuery.define( "app/Model", [ "main/attr", "main/object", "main/CustomEvent" ], function( $, attr, object, CustomEvent, undefined ) {
  "use strict"; //启用严格模式
  //有instance 则需要去查找
  var Model = object.extend( "Model", {
    init: function( modelElement ) {
      this._super( );
      this.element = modelElement;
      this.id = attr.getAttr( modelElement, "id" ) || null;
      this.src = attr.getAttr( modelElement, "src" );
      Model.addModel( this );
    },
    destory: function( ) {
      Model.removeModel( this );
    }
  }, {
    models: [ ],
    getInstance: function( modelElement, ModelObject ) {
      var instance = attr.getAttr( modelElement, "instance" ),
      src = attr.getAttr( modelElement, "src" ),
      model = this.getModel( src );

      if ( instance || !model) {
        return ModelObject ? new ModelObject( modelElement ) : new Model( modelElement );
      }

      return model;
    },
    getModel: function( id ) {
      if ( !id ) {
        return undefined;
      }
      var result;
      this.models.forEach( function( model, index ) {
        if ( model.getId( ) === id || model.getSrc( ) === id ) {
          result = model;
        }
      } );
      return result;
    },
    addModel: function( Model ) {
      if ( this.models.indexOf( ) === -1 ) {
        this.models.push( Model );
      }
    },
    removeModel: function( ) {
      var index = this.models.indexOf( );
      if ( index > -1 ) {
        this.models.splice( index, 1 );
      }
    }
  }, CustomEvent );

  object.providePropertyGetSet( Model, {
    element: "-pu -r",
    id: "-pu -r",
    src: "-pu -r"
  } );

  return Model;
} );