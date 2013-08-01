aQuery.define( "app/View", [ "main/query", "main/object", "main/attr", "main/CustomEvent", "module/Widget", ], function( $, query, object, attr, CustomEvent, Widget, undefined ) {
  "use strict"; //启用严格模式
  var View = object.extend( "View", {
    init: function( ViewElement ) {
      this._super( );
      this.element = ViewElement;
      // this.src = viewSrc;
      this.id = attr.getAttr( ViewElement, "id" ) || null;
      //不能有相同的两个src

      View.addView( this );
    },
    _getModelsElement: function( ) {
      //可能会错 找直接子元素
      //Collection
      return query.find( ">Model", this.element );
    },
    _getModelsSrc: function( ) {
      return this._getModelsElement( ).map( function( ele ) {
        var src = attr.getAttr( ele, "src" );
        if ( !src ) {
          $.console.error( {
            fn: "require model",
            msg: "src must exist"
          }, true );
        }
        return src;
      } );
    },
    destory: function( ) {
      View.removeView( this );
    }
  }, {
    views: [ ],
    getInstance: function( viewElement, ViewObject ) {
      return ViewObject ? new ViewObject( viewElement ) : new View( viewElement );
    },
    getView: function( id ) {
      var result;
      this.views.forEach( function( view ) {
        if ( view.getId( ) === id ) {
          result = view;
        }
      } );
      return result;
    },
    addView: function( view ) {
      if ( this.views.indexOf( ) === -1 ) {
        this.views.push( view );
      }
    },
    removeView: function( ) {
      var index = this.views.indexOf( );
      if ( index > -1 ) {
        this.views.splice( index, 1 );
      }
    }
  }, CustomEvent );

  object.providePropertyGetSet( View, {
    element: "-pu -r",
    // src: "-pu -r",
    modelsSrc: "-pu -r",
    id: "-pu -r"
  } );

  return View;
} );