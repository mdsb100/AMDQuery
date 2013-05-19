myQuery.define("ui/splitter", [
    "base/support",
    "module/Widget",
    "main/query",
    "main/class",
    "main/event",
    "main/dom",
    "main/attr",
    "module/src",
    "html5/css3",
    "ui/splitterpane"],

function($, support, Widget, query, cls, event, dom, attr, src, css3, splitterpane) {
    "use strict"; //启用严格模式
    var proto, splitter;
    if (support.box) {
        var boxFlexName = splitterpane.boxFlexName,
            originBoxFlexValue = document.documentElement.style[boxFlexName];

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
                if (opt.flex !== originBoxFlexValue) {
                    this.target.css(boxFlexName, opt.flex);
                }
                return this;
            },
            resize: function(width, height) {
                $.isNul(width) && this.setWidth(width);
                $.isNul(height) && this.setHeight(height);
            },
            setWidth: function(width) {
                this.target.width(width);
            },
            setHeight: function(height) {
                this.target.height(height);
            },
            _setFlex: function(flex) {
                this.options.flex = flex;
            },
            init: function(opt, target) {
                this._super(opt, target);
                this.render();
                return this;
            },
            customEventName: [],
            options: {
                flex: originBoxFlexValue
            },
            getter: {

            },
            setter: {

            },
            publics: {
                setWidth: Widget.AllowPublic,
                setHeight: Widget.AllowPublic,
                resize: Widget.AllowPublic
            },
            target: null,
            toString: function() {
                return "ui.splitter";
            },
            widgetEventPrefix: "splitter",
            destory: function(key) {
                this.target.css(boxFlexName, originBoxFlexValue);
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
            resize: function(width, height) {
                $.isNul(width) && this.setWidth(width);
                $.isNul(height) && this.setHeight(height);
            },
            setWidth: function(width) {
                this.target.width(width);
            },
            setHeight: function(height) {
                this.target.height(height);
            },
            _setFlex: function(flex) {
                if ($.isNum(flex) && flex >= 0) {
                    this.options.flex = flex;
                    //要通知父元素更改
                }
            },
            init: function(opt, target) {
                this._super(opt, target);

                return this;
            },
            customEventName: [],
            options: {
                flex: ""
            },
            getter: {

            },
            setter: {

            },
            publics: {
                setWidth: Widget.AllowPublic,
                setHeight: Widget.AllowPublic,
                resize: Widget.AllowPublic
            },
            target: null,
            toString: function() {
                return "ui.splitter";
            },
            widgetEventPrefix: "splitter"
        }
    }

    splitter = Widget.extend("ui.splitter", proto);

    return splitter;
});