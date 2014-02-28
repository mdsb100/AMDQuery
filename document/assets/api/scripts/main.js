$.require( [ "main/event", "main/query", "main/attr", "module/location", "ui/scrollableview" ], function( event, query, attr, location ) {

	$( ".prettyprinted" ).each( function( ele ) {
		var numbered = ele.innerHTML.split( "\n" );
		var counter = 0;

		for ( var i = 0, len = numbered.length, item, html = ""; i < len; i++ ) {
			item = numbered[ i ];
			html += i != len - 1 ? "<span class='linenumber' >" + ( i + 1 ) + "</span>" + item + "\n" : "";
		}

		ele.innerHTML = html;
	} );

	$( "body" ).delegate( "a", "click", function() {
		if ( window.parent && window.parent.aQuery && window.parent.aQuery.trigger ) {

		}
	} );

} );