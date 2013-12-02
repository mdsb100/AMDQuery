$.require( [ "main/query", "hash/locationHash", "ui/swapview", "ui/scrollableview", "module/initWidget" ], function( query, locationHash ) {
	var swapview = $( "#swapview" );
	if ( swapview.length ) {
		swapview.uiSwapview();
		swapview.uiSwapview( "render", parseInt( locationHash.swapIndex || 0 ), function() {
			var
			$scrollableview = $( this ).findWidgets( "ui.scrollableview" ),
				$toElement = $scrollableview.uiScrollableview( "getAnimationToElementByName", locationHash.scrollTo );

			$scrollableview.uiScrollableview( "animateToElement", $toElement );
		} );
	}
} );