/// <reference path="../myquery.js" />
// quote from colo.js by Andrew Brehaut, Tim Baumann

myQuery.define('module/effect', ['module/animate'], function ($, animate, undefined) {
    "use strict"; //启用严格模式
    var effect = {
        _show: $.show
        , _hide: $.hide

        , fadeIn: function (ele, queue) {
            /// <summary>淡入</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="queue" type="Boolean/undefined">动画参数 可选</param>
            /// <returns type="self" />
            if ($.isVisible(ele)) { return this; }
            queue = queue == undefined ? true : queue;
            var o = $.style(ele, "opacity") || 1;
            return $.setOpacity(ele, 0)._show(ele).animate(ele, { opacity: o }, { duration: "slow", queue: queue
                , complete: function () {

                }
            });
        }
        , fadeOut: function (ele, queue, visible) {
            /// <summary>淡出</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="queue" type="Boolean/undefined">动画参数 可选</param>
            /// <param name="visible" type="Boolean/undefined">是否占据文档流</param>
            /// <returns type="self" />
            if (!$.isVisible(ele)) { return this; }
            queue = queue == undefined ? true : queue;
            var o = $.style(ele, "opacity");
            return $._show(ele).animate(ele, { opacity: 0 }, { duration: "slow", queue: queue
                , complete: function () {
                    $._hide(ele, visible).setOpacity(ele, o);
                    ele = visible = o = null;
                }
            });
        }

        , hide: function (ele, type, visible) {
            /// <summary>隐藏元素
            /// <para>type:slide fade</para>
            /// </summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="type" type="String/undefined">动画类型</param>
            /// <param name="visible" type="Boolean/undefined">true:隐藏后任然占据文档流中</param>
            /// <returns type="self" />
            if ($.isStr(type) && $[type + "Out"]) {
                $[type + "Out"](ele, null, visible);
            }
            else {
                $._hide(ele);
            }
            return this;
        }

        , show: function (ele, type) {
            /// <summary>显示元素
            /// <para>type:slide fade</para>
            /// </summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="type" type="String/undefined">动画类型</param>
            /// <returns type="self" />
            if ($.isStr(type) && $[type + "In"]) {
                $[type + "In"](ele);
            }
            else {
                $._show(ele);
            }
            return this;
        }
        , slideIn: function (ele, queue) {
            /// <summary>滑动淡入</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="queue" type="Boolean/undefined">动画参数 可选</param>
            /// <returns type="self" />
            if ($.isVisible(ele)) { return this; }
            queue = queue == undefined ? true : queue;
            var h = $.getInnerH(ele);
            return $.css(ele, "height", 0)._show(ele).animate(ele, { height: h + "px" }, { duration: "slow", queue: queue
                , complete: function () {

                }
            });
        }
        , slideOut: function (ele, queue, visible) {
            /// <summary>滑动淡出</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="queue" type="Boolean/undefined">动画参数 可选</param>
            /// <param name="visible" type="Boolean/undefined">是否占据文档流</param>
            /// <returns type="self" />
            if (!$.isVisible(ele)) { return this; }
            queue = queue == undefined ? true : queue;
            var h = $.getInnerH(ele);
            return $._show(ele).animate(ele, { height: "0px" }, { duration: "slow", queue: queue
                , complete: function () {
                    $._hide(ele, visible).setInnerH(ele, h);
                    ele = visible = h = null;
                }
            });
        }
    }
    $.extend(effect);

    $.fn.extend({
        fadeIn: function (queue) {
            /// <summary>淡入</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="queue" type="Boolean/undefined">动画参数 可选</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.fadeIn(ele, queue)
            });
        }
        , fadeOut: function (queue) {
            /// <summary>淡出</summary>
            /// <param name="queue" type="Boolean/undefined">动画参数 可选</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.fadeOut(ele, queue);
            });
        }

        , hide: function (type, visible) {
            /// <summary>隐藏元素
            /// <para>type:slide fade</para>
            /// </summary>
            /// <param name="type" type="String/undefined">动画类型</param>
            /// <param name="visible" type="Boolean/undefined">true:隐藏后任然占据文档流中</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.hide(ele, type, visible);
            })
        }

        , show: function (type) {
            /// <summary>显示元素
            /// <para>type:slide fade</para>
            /// </summary>
            /// <param name="type" type="String/undefined">动画类型</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.show(ele, type);
            });
        }
        , slideIn: function (queue) {
            /// <summary>滑动淡入</summary>
            /// <param name="queue" type="Boolean/undefined">动画参数 可选</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.slideIn(ele, queue);
            });
        }
        , slideOut: function (ele, queue, visible) {
            /// <summary>滑动淡出</summary>
            /// <param name="queue" type="Boolean/undefined">动画参数 可选</param>
            /// <param name="visible" type="Boolean/undefined">是否占据文档流</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.slideOut(ele, queue, visible);
            });
        }
    });
    return effect;
});