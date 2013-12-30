aQuery.define( "html5/Worker", function( $, undefined ) {
	"use strict";
  this.describe( "HTML5 Worker" );
	function MyWorker( path ) {
		if ( window.Worker ) {
			this.worker = new window.Worker( path || $.getPath( "html5/_Worker" ) );
		}
	}

	MyWorker.prototype = {
		constructor: MyWorker,
		addHandler: function( type, fun ) {
			/// <summary>添加worker事件</summary>
			/// <param name="type" type="String">事件名</param>
			/// <param name="fun" type="Function">方法</param>
			/// <returns type="self" />
			this.worker && this.worker.addEventListener( type, fun, false );
			return this;
		},
		on: function( type, fun ) {
			return this.addHandler( type, fun );
		},
		onError: function( fun ) {
			/// <summary>添加error事件</summary>
			/// <param name="fun" type="Function">方法</param>
			/// <returns type="self" />
			return this.on( "error", fun );
		},
		onMessage: function( fun ) {
			/// <summary>添加获得数据事件</summary>
			/// <param name="fun" type="Function">方法</param>
			/// <returns type="self" />
			return this.on( "message", fun );
		},

		postMessage: function( todo, context, paras ) {
			/// <summary>发送计算函数</summary>
			/// <param name="todo" type="Function">方法</param>
			/// <param name="context" type="Object">作用域</param>
			/// <param name="paras" type="Array">参数</param>
			/// <returns type="self" />
			this.worker && this.worker.postMessage( {
				todo: todo.toString(),
				paras: $.util.argToArray( arguments, 2 ),
				context: context || null
			} );
			return this;
		},
		terminate: function() {
			this.worker && this.worker.terminate();
			return this;
		}
	};
	return MyWorker;
} );