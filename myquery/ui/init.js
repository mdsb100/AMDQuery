/// <reference path="../myquery.js" />
myQuery.define("ui/init", ["main/query", "main/dom", "main/attr", "module/Widget"], function($, query, dom, attr, Widget, undefinded) {
	"use strict"; //启用严格模式
	debugger
	var body = $("body"),
		image = $.config.ui.image.split("."),
		cover = $({
			width: "100%",
			height: "100%",
			position: "absolute",
			top: 0,
			left: 0,
			zIndex: 10001
		}, "img", body).attr("src", $.getPath("ui/images/" + image[0], "." + image[1])),
		result = [];

	$("body *[myquery-ui]").each(function(ele) {
		var value = attr.getAttr(ele, "myquery-ui"),
			widgetNames = $.isStr(value) && value != "" ? value.split(/;|,/) : [],
			len = widgetNames.length,
			i = 0;
		for(; i < len; i++) {
			name = widgetNames[i]
			if(name && $.inArray(result, name) == -1) {
				result.push(name);
			}
		};

	})

	return {
		widgetNames: result,
		init: function() {

			return this.showIndex();
		},
		showIndex: function() {
			cover.remove();
			return this;
		}
	};
});