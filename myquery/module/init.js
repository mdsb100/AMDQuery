/// <reference path="../myquery.js" />
myQuery.define("module/init", ["main/query", "main/dom", "main/attr", "module/Widget"], function($, query, dom, attr, Widget, undefinded) {
	"use strict"; //启用严格模式

	var body = $("body"),
		image = $.config.ui.image,
		$image = $({
			position: "absolute",
			top: "50%",
			left: "50%"
		}, "img").attr("src", $.getPath("ui/images/", image)),
		$cover = $({
			width: "100%",
			height: "100%",
			position: "absolute",
			top: 0,
			left: 0,
			zIndex: 10001,
			backgroundColor: "white"
		}, "div").append($image).before(body.children()),
		widgetNames = [],
		init,
		widgetMap = {},
		fnNameReflect = {};

	$image.css({
		marginTop: -$image.width() + "px",
		marginLeft: -$image.height() + "px"
	});

	$("body *[myquery-widget]").each(function(ele) {
		var value = attr.getAttr(ele, "myquery-widget"),
			attrNames = $.isStr(value) && value != "" ? value.split(/;|,/) : [],
			len = attrNames.length,
			widgetName,
			widgetPath,
			temp,
			name,
			nameSpace,
			i = 0;
		for (; i < len; i++) {
			widgetName = attrNames[i]
			if (widgetName) {
				if (widgetName.indexOf(".") < 0) {
					nameSpace = "ui";
					name = widgetName;
				} else {
					temp = widgetName.split(".");
					nameSpace = temp[0];
					name = temp[1];
				}
				widgetPath = nameSpace + "/" + name;
				widgetName = nameSpace + "." + name;

				if(!widgetMap[widgetName]){
					widgetNames.push(widgetPath);

					widgetMap[widgetName] = [];
					fnNameReflect[widgetName] = $.util.camelCase(name, nameSpace);
				}		
			}
			widgetMap[widgetName] && widgetMap[widgetName].push(ele);
		};

	})

	init = {
		widgetNames: widgetNames,
		widgetMap: widgetMap,
		renderWidget: function(callback) {
			var self = this;
			if (this.widgetNames.length) {
				require(this.widgetNames, function() {
					var widgetName = 0,
						eles;
					for (widgetName in self.widgetMap) {
						eles = self.widgetMap[widgetName];
						self.initWidget(widgetName, eles);
					}
					self.showIndex();
					callback();
				});
			} else {
				self.showIndex();
				callback();
			}
			return this;
		},
		initWidget: function(widgetName, eles) {
			$(eles)[fnNameReflect[widgetName]]();
			return this;
		},
		showIndex: function() {
			setTimeout(function (argument) {
				$cover.remove();
				$cover = null;
			}, 200);
			return this;
		}
	};
	return init;
});