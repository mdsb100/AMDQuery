aQuery.define( "json/package", function( $, undefinded ) {
  "use strict"; //启用严格模式
  var main = [ "main/data", "main/attr", "main/class", "main/communicate", "main/CustomEvent", "main/css", "main/position", "main/dom", "main/event", "main/object", "main/query", "main/position", "main/parse" ],
    html5 = [ "html5/animate.transform", "html5/applicationCache", "html5/canvas.extend", "html5/css3", "html5/css3.transition.animate", "html5/Storage", "html5/threed.canvas.extend", "html5/Worker" ],
    ui = [ "ui/button", "ui/draggable", "ui/flex", "ui/keyboard", "ui/navitem", "ui/navmenu", "ui/scrollableview", "ui/swapindicator", "ui/swappable", "ui/swapview", "ui/tabbar", "ui/tabbutton", "ui/tabview" ];

  return {
    main: main,
    html5: html5,
    ui: ui
  };

} );