myQuery.define( "app/Controller", [ "main/object", "main/CustomEvent", "app/Application" ], function( $, object, CustomEvent, View, Application, undefined ) {
  "use strict"; //启用严格模式
  var Controller = object.extend( "Controller", {
    init: function( view, models ) {
      this._super( );
      this.view = view;
      this.models = models || [ ];
      this.id = view.getId();
      $.application.addController( this );
    },
    addModels: function( models ) {
      if ( !$.isArr( models ) ) {
        models = $.util.argToArray( arguments )

      }
      this.models = this.models.concat( models );
    },
    destory: function( ) {
      $.application.removeController( this );
    }
  }, {

  }, CustomEvent );

  object.providePropertyGetSet( Controller, {
    view: "-pu -r",
    models: "-pu -r",
    id: "-pu -r"
  } );

  return Controller;
} );