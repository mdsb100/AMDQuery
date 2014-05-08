aQuery.define( "@app/app", [ "base/Promise", "main/event", "app/Application", "@app/controllers/index" ], function( $, Promise, event, Application ) {
	"use strict"; //启用严格模式
	var app = Application.extend( "Application", {
		init: function( promiseCallback ) {
			this._super();
			this.promise.then( function() {
				var promise = new Promise;
				setTimeout( function() {
					promise.resolve();
					promiseCallback.resolve();
				}, 0 );
				return promise;
			} );
		},
		launch: function() {

		}
	}, {
		global: {

		}
	}, Application );

	return app;
} );