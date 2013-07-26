myQuery.define( "app/View", [ "main/query", "main/object", "main/attr", "main/CustomEvent", "module/Widget", "app/Application" ], function( $, query, object, attr, CustomEvent, Widget, Application, undefined ) {
  "use strict"; //启用严格模式
  var View = object.extend( "View", {
    init: function( ViewElement ) {
      this._super( );
      this.element = ViewElement;
      // this.src = viewSrc;
      this.id = attr.getAttr( ViewElement, "id" ) || null;
      //不能有相同的两个src

      $.application.addView( this );
    },
    _getModelsElement: function( ) {
      //可能会错 找直接子元素
      return query.find( ">Model", this.element );
    },
    _getModelsSrc: function( ) {
      return this._getModelsElement( ).map( function( ele, arr ) {
        var src = attr.getAttr( ele, "src" );
        if(!src){
          $.console.error({fn: "require model", msg: "src must exist"}, true);
        }
        return src;
      } );
    },
    destory: function( ) {
      $.application.removeView( this );
    }
  }, {

  }, CustomEvent );

  object.providePropertyGetSet( View, {
    element: "-pu -r",
    // src: "-pu -r",
    modelsSrc: "-pu -r",
    id: "-pu -r"
  } );

  return View;
} );