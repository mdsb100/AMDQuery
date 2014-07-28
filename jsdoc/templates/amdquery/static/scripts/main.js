$.require( [ "main/event", "main/query", "main/attr", "module/location", "ui/scrollableview" ], function( event, query, attr, location ) {

  $( ".prettyprinted" ).each( function( ele ) {
    var numbered = ele.innerHTML.split( "\n" );
    var counter = 0;
    for ( var i = 0, len = numbered.length, item, html = ""; i < len; i++ ) {
      item = numbered[ i ];
      html += i != len - 1 || len === 1 ? '<span class="linenumber" id="line' + ( i + 1 ) + '" >' + ( i + 1 ) + "</span>" + item + "\n" : "";
    }

    ele.innerHTML = html;
  } );

  var hash = location.getHash( "#" );

  if ( hash ) {
    var target = $( "#main" ).uiScrollableview( "getAnimationToElementById", hash );
    if ( target ) {
      $( "#main" ).uiScrollableview( "animateToElement", target );
    }
  }

  $( "body" ).delegate( "a", "click", function( e ) {
    if ( window.parent && window.parent.aQuery && window.parent.aQuery.trigger ) {
      var a = event.document.getTarget( e ),
        href = attr.getAttr( a, "href" );
      if ( href ) {
        var type = "api_iframe.hrefChange";
        window.parent.aQuery.trigger( type, null, {
          type: type,
          href: href,
          target: a,
        } );
      }
      event.document.preventDefault(e);
      return false;
    }
  } );

} );