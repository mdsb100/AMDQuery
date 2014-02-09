aQuery.define( "@app/app", [ "base/Promise", "main/event", "app/Application", "@app/controller/index" ], function( $, Promise, event, Application ) {
	"use strict"; //启用严格模式
	//必须依赖index controller
	var app = Application.extend( "Application", {
		init: function( promiseCallback ) {
			this._super();
			this.promise.then( function() {
				var promise = new Promise;
				this.index.document.$content.once( "load", function() {
					promise.resolve();
					promiseCallback.resolve();
				} );

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