onmessage = function( e ) {
	var data = e.data,
		fun = ( new Function( "return " + data.todo ) )();
	postMessage( fun.apply( data.context, data.paras ) );
};