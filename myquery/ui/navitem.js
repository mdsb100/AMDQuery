myQuery.define("ui/navitem", [
    "base/client",
    "module/Widget",
    "main/class",
    "main/event",
    "main/dom",
    "main/attr",
    "module/animate",
    "html5/css3.transition.animate",
    "module/tween.extend",
    "module/effect"],

function($, client, Widget, cls, event, dom, attr, src, animate) {
    "use strict"; //启用严格模式

    var complete = function(opt) {
        dom.css(this, "height", "auto");
    },
    navitem = Widget.extend("ui.navitem", {
        container: null,
        event: function() {},
        _initHandler: function() {
            var self = this,
                target = self.target,
                opt = self.options;
            this.event = function(e) {
                switch (e.type) {
                    case "click":
                        self.toggle();
                        break;
                }

            }
            return this;
        },
        enable: function() {
            var fun = this.event;
            this.disable();
            this.$text.on("click", fun);
            this.$arrow.on("click", fun);
            this.options.disabled = true;
            return this;
        },
        disable: function() {
            var fun = this.event;
            this.$text.off("click", fun);
            this.$arrow.off("click", fun);
            this.options.disabled = false;
            return this;
        },
        getBoard: function() {
            return this.$board;
        },
        render: function() {
            var opt = this.options;
            this.$text.html(opt.html);
            this.$img.addClass(opt.img);
            if (opt.onfocus) {
                this.$title.addClass("title_select").removeClass("title_unselect");
                this.$arrow.addClass("arrowBottom").removeClass("arrowRight");
            } else {
                this.$title.addClass("title_unselect").removeClass("title_select");
                this.$arrow.addClass("arrowRight").removeClass("arrowBottom");
            }

            if (!this.hasChild()) {
                this.$arrow.removeClass("arrowRight").removeClass("arrowBottom");
            }

            // if(client.browser.ie){
            //     //this.$title.width(this.$arrow.width() + this.$img.width() + this.$text.width());
            // }
            return this;
        },
        toggle: function() {
            return this.options.onfocus ? this.close() : this.open();
        },
        open: function() {
            var opt = this.options;
            if (opt.onfocus == false) {
                opt.onfocus = true;
                this.$board.slideDown({
                    duration: 200,
                    easing: "cubic.easeInOut",
                    complete: complete
                });
                this.render();

                var para = {
                    type: this.getEventName("open"),
                    container: this.container,
                    target: this.target[0],
                    html: opt.html
                }

                return this.target.trigger(para.type, this.target[0], para);
            }
            return this;
        },
        close: function() {
            var opt = this.options;
            if (opt.onfocus == true) {
                opt.onfocus = false;
                this.$board.slideUp({
                    duration: 200,
                    easing: "cubic.easeInOut"
                });
                this.render();

                var para = {
                    type: this.getEventName("close"),
                    container: this.container,
                    target: this.target[0],
                    html: opt.html
                }

                return this.target.trigger(para.type, this.target[0], para);
            }
            return this;
        },
        hasChild: function() {
            return !!this.target.query("li[ui-navitem]").length;
        },
        init: function(opt, target) {
            this._super(opt, target);
            var opt = this.options;

            this.container = target;

            this.parent = this.target

            target.css({
                "display": "block",
                "clear": "both"
            });

            this.$board = target.child().css({
                "display": "block",
                "clear": "both"
            }).addClass("board").hide();

            this.$item = $($.createEle("div")).css({
                "display": "block",
                "clear": "both"
            }).addClass("item");

            this.$arrow = $($.createEle("li")).css({
                "float": "left"
            }).addClass("arrow");

            this.$img = $($.createEle("li")).css({
                "float": "left"
            }).addClass("img");
            //.attr("src", "data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAA" /*to fix chrome border*/ );

            this.$text = $($.createEle("li")).css({
                "float": "left"
            }).addClass("text");

            this.$titleContainer = $($.createEle("ul")).css({
                "display": "block",
                "float": "left"
            }).addClass("title");

            this.$title = $($.createEle("a")).css({
                "display": "block",
                "clear": "both",
                "text-decoration": "none"
            }).addClass("title");

            this.$board.append(this.$child);

            this.$titleContainer.append(this.$arrow).append(this.$img).append(this.$text);

            this.$title.append(this.$titleContainer);

            this.$item.append(this.$title);

            this.target.append(this.$item);

            this.target.append(this.$board);

            this.render()._initHandler().enable();

            return this;
        },
        isOnFocus: function() {
            return this.options.onfocus;
        },
        customEventName: ["open", "close"],
        options: {
            html: "",
            img: "",
            onfocus: false
        },
        publics: {
            render: 1,
            getBorad: 1,
            open: 1,
            close: 1,
            isOnFocus: 1
        },
        getter: {
            html: 1,
            img: 1,
            onfocus: 1
        },
        setter: {
            html: 1,
            img: 1,
            onfocus: 0
        },
        target: null,
        toString: function() {
            return "ui.navitem";
        },
        widgetEventPrefix: "navitem"
    });

    return navitem;
});