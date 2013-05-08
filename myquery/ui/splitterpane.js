myQuery.define("ui/splitterpane", [
    "base/support",
    "module/Widget",
    "main/query",
    "main/class",
    "main/event",
    "main/dom",
    "main/attr",
    "module/src",
    "html5/css3"],

function($, support, Widget, query, cls, event, dom, attr, src, css3) {
    "use strict"; //启用严格模式

    src.link({
        href: $.getPath("ui/css/splitterpane", ".css")
    });

    var domStyle = document.documentElement.style,
        boxFlexName = "",
        boxPackName = "",
        boxOrientName = "",
        boxAlignName = "";

    if ("boxFlex" in domStyle) {
        boxFlexName = "boxFlex";
        boxPackName = "boxPack";
        boxOrientName = "boxOrient";
        boxAlignName = "boxAlign";

    } else if (($.css3Head + "BoxFlex") in domStyle) {
        boxFlexName = $.css3Head + "BoxFlex";
        boxPackName = $.css3Head + "BoxPack";
        boxOrientName = $.css3Head + "BoxOrient";
        boxAlignName = $.css3Head + "BoxAlign";
    }

    support.box = !! boxFlexName;

    var splitterpane, proto;

    if (boxFlexName) {
        proto = {
            container: null,
            event: function() {},
            _initHandler: function() {
                var self = this;
                this.event = function(e) {

                }
                return this;
            },
            enable: function() {

                this.options.disabled = true;
                return this;
            },
            disable: function() {

                this.options.disabled = false;
                return this;
            },
            render: function() {
                var opt = this.options;
                this.target.css(boxOrientName, opt.orient);
                this.target.css(boxAlignName, opt.align);
                this.target.css(boxPackName, opt.pack);
                return this;
            },
            init: function(opt, target) {
                this._super(opt, target);
                this.target.addClass("splitterpane");
                this.render();
                return this;
            },
            _setOrient: function(orient) {
                var opt = this.options;
                switch (orient) {
                    case "horizontal":
                        opt.orient = orient;
                        break;
                    case "vertical":
                        opt.orient = orient;
                        break;
                }
            },
            customEventName: [],
            options: {
                orient: "horizontal",
                pack: "start",
                align: "start"
            },
            getter: {

            },
            setter: {

            },
            publics: {

            },
            target: null,
            toString: function() {
                return "ui.splitterpane";
            },
            widgetEventPrefix: "splitter",
            destory: function(key) {
                this.targt.removeClass("splitterpane");
                Widget.invoke("destory", this, key);
                return this;
            }
        }
    } else {
        proto = {
            container: null,
            event: function() {},
            _initHandler: function() {
                var self = this;
                this.event = function(e) {

                }
                return this;
            },
            enable: function() {

                this.options.disabled = true;
                return this;
            },
            disable: function() {

                this.options.disabled = false;
                return this;
            },
            render: function() {

                return this;
            },
            init: function(opt, target) {
                this._super(opt, target);

                return this;
            },
            customEventName: [],
            options: {

            },
            getter: {

            },
            setter: {

            },
            publics: {

            },
            target: null,
            toString: function() {
                return "ui.splitterpane";
            },
            widgetEventPrefix: "splitterpane"
        }
    }

    splitterpane = Widget.extend("ui.splitterpane", proto, {
        boxFlexName: boxFlexName
    });

    return splitterpane;
});