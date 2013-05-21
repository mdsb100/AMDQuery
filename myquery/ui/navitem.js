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
                        if ($.event.document.getTarget(e) == self.$arrow[0]) {
                            self.toggle();
                        } else {
                            self.select();
                        }
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

            if (opt.isOpen) {
                this.$arrow.addClass("arrowBottom").removeClass("arrowRight");
            } else {
                this.$arrow.addClass("arrowRight").removeClass("arrowBottom");
            }

            if (opt.selected) {
                this.$text.addClass("text_select").removeClass("text_unselect");
            } else {
                this.$text.addClass("text_unselect").removeClass("text_select");
            }

            if (!this.hasChild()) {
                this.$arrow.removeClass("arrowRight").removeClass("arrowBottom");
            }
            this.detectParent();
            // if(client.browser.ie){
            //     //this.$title.width(this.$arrow.width() + this.$img.width() + this.$text.width());
            // }
            return this;
        },
        toggle: function() {
            return this.options.isOpen ? this.close() : this.open();
        },
        open: function() {
            var opt = this.options;
            if (opt.isOpen == false) {
                opt.isOpen = true;
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
            if (opt.isOpen == true) {
                opt.isOpen = false;
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
        select: function() {
            var opt = this.options;
            opt.selected = true;
            this.open();

            var para = {
                type: this.getEventName("select"),
                container: this.container,
                target: this.target[0],
                html: opt.html
            }

            return this.target.trigger(para.type, this.target[0], para);
        },
        cancel: function() {
            var opt = this.options;
            opt.selected = false;
            this.render();

            var para = {
                type: this.getEventName("cancel"),
                container: this.container,
                target: this.target[0],
                html: opt.html
            }

            return this.target.trigger(para.type, this.target[0], para);
        },
        hasChild: function() {
            return !!this.target.find("li[ui-navitem]").length;
        },
        detectParent: function() {
            var parentNavitem = this.target.parent().parent(),
                opt = this.options;
            if (Widget.is(parentNavitem, "ui.navitem")) {
                opt.parent = parentNavitem;
            }
            return this;
        },
        getOptionToRoot: function(optionName) {
            var name = optionName || "html",
                opt = this.options,
                parent = opt.parent,
                ret = [opt[name]];
            while ( !! parent) {
                ret.push(parent.uiNavitem("option", name));
                parent.uiNavitem("detectParent");
                parent = parent.uiNavitem("option", "parent");
            }
            return ret;
        },
        getAttrToRoot: function(attrName) {
            if (!$.isStr(attrName)) {
                return [];
            }
            var opt = this.options,
                parent = opt.parent,
                ret = [this.target.attr(attrName)];
            while ( !! parent) {
                ret.push(parent.target.attr(attrName));
                parent.uiNavitem("detectParent");
                parent = parent.uiNavitem("option", "parent");
            }
            return ret;
        },
        init: function(opt, target) {
            this._super(opt, target);
            var opt = this.options;

            this.container = target;

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
        _setSelected: function(selected) {
            if (selected !== undefined) {
                this.options.selected = selected;
                this.options.selected ? this.selected() : this.cancel()
            }
        },
        _setIsOpen: function(isOpen) {
            if (isOpen !== undefined) {
                this.options.isOpen = isOpen;
                this.options.isOpen ? this.open() : this.close();
            }
        },
        customEventName: ["open", "close", "select", "cancel"],
        options: {
            html: "",
            img: "",
            selected: false,
            isOpen: false,
            parent: null
        },
        publics: {
            render: Widget.AllowPublic,
            getBorad: Widget.AllowPublic,
            open: Widget.AllowPublic,
            close: Widget.AllowPublic,
            select: Widget.AllowPublic,
            cancel: Widget.AllowPublic,
            detectParent: Widget.AllowPublic,
            getAttrToRoot: Widget.AllowReturn,
            getOptionToRoot: Widget.AllowReturn
        },
        getter: {
            html: 1,
            img: 1,
            selected: 1,
            isOpen: 1,
            parent: 1
        },
        setter: {
            html: 1,
            img: 1,
            selected: 1,
            isOpen: 1,
            parent: 0
        },
        target: null,
        toString: function() {
            return "ui.navitem";
        },
        widgetEventPrefix: "navitem"
    });

    return navitem;
});