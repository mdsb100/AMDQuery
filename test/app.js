aQuery.define( "@app/app", [ "app/Application", "@app/controllers/index", "@app/lib/testRefer" ], function( $, Application ) {
  "use strict"; //启用严格模式
  //必须依赖index controller
  var app = Application.extend( "TestApplication", {
    init: function( promiseCallback ) {
      this._super( promiseCallback );
    },
    launch: function( ) {

    },
    beforeLoad: function( promise ) {
      this.addRouter( "default", "@app/controllers/index.js" );
      this.addRouter( "router", "@app/controllers/router.js" );
      promise.resolve( );
    }
  }, {

  } );

  return app;
} );