aQuery.define( "@app/app", [ "app/Application", "@app/controller/index" ], function( $, Application ) {
  "use strict"; //启用严格模式
  //必须依赖index controller
  var app = Application.extend( "Application", {
    init: function( promiseCallback ) {
      this._super( promiseCallback );
    },
    launch: function( ) {

    }
  }, {
    global: {

    }
  }, Application );

  return app;
} );