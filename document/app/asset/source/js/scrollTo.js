$.require( [ "main/query", "hash/locationHash", "ui/swapview", "ui/scrollableview", "module/initWidget" ], function( query, locationHash ) {
	//http://127.0.0.1:8080/document/app/app.html#navmenu=#Build!swapIndex=1!scrollTo=Detail
  var swapview = $( "#swapview" );
	if ( swapview.length ) {
		swapview.uiSwapview();
		var index = parseInt( locationHash.swapIndex || 0 );
		swapview.uiSwapview( "render", index, function() {
			var $scrollableview = $( this ).findWidgets( "ui.scrollableview" ).eq( index );
			var $toElement = $scrollableview.uiScrollableview( "getAnimationToElementByName", locationHash.scrollTo );
			$scrollableview.uiScrollableview( "animateToElement", $toElement );
		} );
	}
} );