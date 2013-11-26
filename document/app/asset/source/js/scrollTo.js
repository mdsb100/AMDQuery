$.require( [ "main/query", "hash/locationHash", "ui/swapview", "ui/scrollableview", "module/initWidget" ], function( query, locationHash ) {
	var swapview = $( "#swapview" );
	if ( swapview.length ) {
		swapview.uiSwapview();
		swapview.uiSwapview( "render", parseInt( locationHash.swapIndex || 0 ), function() {
			$( this ).findWidgets( "ui.scrollableview" ).uiScrollableview( "animateToElement", locationHash.scrollTo );
		} );
	}
} );