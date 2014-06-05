$.require( [ "main/query", "main/attr", "module/history", "ui/swapview", "ui/scrollableview" ], function( query, attr, history ) {
	//http://127.0.0.1:8080/document/app/app.html#navmenu=#Build!swapIndex=1!scrollTo=Detail
	var swapview = $( "#swapview" );

	if ( swapview.length ) {
		swapview.uiSwapview();

		function renderIndex( index, scrollTo ) {
			swapview.uiSwapview( "render", index, function() {
				if ( scrollTo ) {
					renderScrollTo( index, scrollTo );
				}
			} );
		}

		function renderScrollTo( index, scrollTo ) {
			var $scrollableview = swapview.findWidgets( "ui.scrollableview" ).eq( index );
			var $toElement = $scrollableview.uiScrollableview( "getAnimationToElementByName", scrollTo );
			if ( $toElement[ 0 ] ) {
				$scrollableview.uiScrollableview( "animateToElement", $toElement );
			} else {
				$scrollableview.uiScrollableview( "toTop" );
			}

		}

		history.on( 'ready', function( e ) {
			var index = parseInt( history.getTokenByKey( "swapIndex" ) || 0 );
			var scrollTo = history.getTokenByKey( "scrollTo" );
			renderIndex( index, scrollTo );
		} ).on( 'swapIndex.change', function( e ) {
			renderIndex( e.token );
		} ).on( 'scrollTo.change', function( e ) {
			var index = parseInt( history.getTokenByKey( "swapIndex" ) || 0 );
			renderScrollTo( index, e.token );
		} );

		swapview.on( "swapview.change", function( e ) {
			history.addByKeyValue( "swapIndex", e.index );
		} );

		swapview.findWidgets( "ui.scrollableview" ).on( "scrollableview.aclick", function( e ) {
			if ( e.toElement ) {
				history.addByKeyValue( "scrollTo", attr.getAttr( e.toElement, "name" ) );
			}
		} );

	}

	history.init();

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