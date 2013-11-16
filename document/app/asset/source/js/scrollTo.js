$.require( [ "main/query", "hash/locationHash", "ui/scrollableview", "module/initWidget" ], function( query, locationHash ) {
  var scrollableview = $( "#scrollableview" );
  if ( scrollableview.length ) {
    scrollableview.uiScrollableview( );
    scrollableview.uiScrollableview( "animateToElement", locationHash.scrollTo );
  }
} );