$.require( [ "main/query", "hash/locationHash", "ui/scrollableview" ], function( query, locationHash ) {
  var scrollableview = $( "#scrollableview" );
  if ( scrollableview.length ) {
    scrollableview.uiScrollableview( "animateToElement", locationHash.scrollTo );
  }
} );