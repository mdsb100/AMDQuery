myQuery.define( "json/package", function( $, undefinded ) {
  "use strict"; //启用严格模式
  var main = [ "main/data", "main/attr", "main/class", "main/communicate", "main/CustomEvent", "main/dom", "main/event", "main/object", "main/query" ],
    html5 = [ "html5/animate.transform", "html5/applicationCache", "html5/canvas.extend", "html5/css3", "html5/css3.transition.animate", "html5/Storage", "html5/threed.canvas.extend", "html5/Worker" ];

  return {
    main: main,
    html5: html5
  }

} );