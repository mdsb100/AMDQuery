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
            render: function(width, height) {
                var opt = this.options;
                this.target.css(boxOrientName, opt.orient);
                this.target.css(boxAlignName, opt.align);
                this.target.css(boxPackName, opt.pack);
                this.resize(width, height);
                return this;
            },
            resize: function(width, height) {
                $.isNul(width) || this.target.width(width);
                $.isNul(height) || this.target.height(height);

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
                resize: Widget.AllowPublic
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
            render: function(width, height) {
                return this.resize(width, height);
            },
            resize: function(width, height) {
                var opt = this.options;
                if (!$.isNul(width)) {
                    this.target.width(width);
                }
                if (!$.isNul(height)) {
                    this.target.height(height);
                }
                this.width = this.target.width();
                this.height = this.target.height();

                switch (opt.orient) {
                    case "horizontal":
                        this.toHorizontal();
                        break;
                    case "vertical":
                        this.toVertical();
                        break;
                }
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
                this.resize();
            },
            filterSplitter: function() {
                var child = this.target.child(),
                    $item,
                    splitter = [],
                    flex = 0,
                    $lastItem = null
                    traceWidth = this.width,
                    traceHeight = this.height;

                child.each(function(ele) {
                    $item = $(ele);
                    if (Widget.is($item, "ui.splitter")) {
                        $item.isSplitter = true;
                        flex += $item.splitter("flex");
                        $lastItem = $item;
                    } else {
                        traceWidth -= $item.width();
                        traceHeight -= $item.height();
                    }
                    splitter.push($item);
                });

                traceWidth = Math.max(traceWidth, 0);
                traceHeight = Math.max(traceHeight, 0);
                if($lastItem){
                    $lastItem.isLastItem = true;
                }
                return {
                    splitter: spliter,
                    flex: flex,
                    traceWidth: traceWidth,
                    traceHeight: traceHeight
                };
            },
            toHorizontal: function() {
                var ret = this.filterSplitter(),
                    splitter = ret.splitter,
                    flex = ret.flex,
                    traceWidth = ret.traceWidth,
                    traceHeight = ret.traceHeight,
                    $item, i = 0,
                    len = splitter.length,
                    trace = 0,
                    tempWidth = 0;

                for (; i < len; i++) {
                    $item = splitter[i];
                    $item.css("float", "left");
                    if($item.isSplitter && traceWidth > 0){
                        tempWidth = Math.round($item.splitter("flex") / flex * traceWidth);
                        $.item.splitter("setWidth", tempWidth);
                    }
                }

            },
            toVertical: function() {
                var ret = this.filterSplitter(),
                    splitter = ret.splitter,
                    flex = ret.flex,
                    traceWidth = ret.traceWidth,
                    traceHeight = ret.traceHeight,
                    $item, i = 0,
                    len = splitter.length,
                    trace = 0;
                    tempHeight = 0;

            },
            init: function(opt, target) {
                this._super(opt, target);
                this.width = 0;
                this.height = 0;
                this.traceWidth = 0;
                this.traceHeight = 0;
                this.render();
                return this;
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
                resize: Widget.AllowPublic
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