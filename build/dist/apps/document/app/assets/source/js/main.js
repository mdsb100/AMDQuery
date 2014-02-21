$.require( [ "main/query", "main/attr", "module/location", "ui/swapview", "ui/scrollableview" ], function( query, attr, location ) {
	//http://127.0.0.1:8080/document/app/app.html#navmenu=#Build!swapIndex=1!scrollTo=Detail
	var swapview = $( "#swapview" );

	if ( swapview.length ) {
		swapview.uiSwapview();
		var index = parseInt( location.getHash( "swapIndex" ) || 0 );
		swapview.uiSwapview( "render", index, function() {
			var $scrollableview = $( this ).findWidgets( "ui.scrollableview" ).eq( index );
			var $toElement = $scrollableview.uiScrollableview( "getAnimationToElementByName", location.getHash( "scrollTo" ) );
			$scrollableview.uiScrollableview( "animateToElement", $toElement );
		} );

		if ( window.parent && window.parent.aQuery ) {
			swapview.on( "swapview.change", function( e ) {
				var type = "document_iframe.swapIndexChange";
				window.parent.aQuery.trigger( type, null, {
					type: type,
					index: e.index
				} );
			} );

			swapview.findWidgets( "ui.scrollableview" ).on( "scrollableview.animateToElement", function( e ) {
				if ( e.overflow == "V" && e.toElement ) {
					var type = "document_iframe.scrollToChange";
					window.parent.aQuery.trigger( type, null, {
						type: type,
						name: attr.getAttr( e.toElement, "name" )
					} );
				}
			} );
		}

	}

	$( ".prettyprinted" ).each( function( ele ) {
		var numbered = ele.innerHTML.split( "\n" );
		var counter = 0;

		for ( var i = 0, len = numbered.length, item, html = ""; i < len; i++ ) {
			item = numbered[ i ];
			html += i != len - 1 ? "<span class='linenumber' >" + ( i + 1 ) + "</span>" + item + "\n" : "";
		}

		ele.innerHTML = html;
	} );

} );