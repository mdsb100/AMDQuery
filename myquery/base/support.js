/// <reference path="../myquery.js" />
myQuery.define("base/support", function ($) {
    //consult from jquery-1.7.2
    "use strict"; //启用严格模式
    var support, root = document.documentElement,
        script = document.createElement("script"),
        div = document.createElement("div"),
        id = "_" + $.now(),
        all, a;
    div.setAttribute("className", "t");

    div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

    all = div.getElementsByTagName("*");
    a = div.getElementsByTagName("a")[0];
    if (!all || !all.length || !a) {
        return {};
    }

    support = {
        cssFloat: !! a.style.cssFloat,
        opacity: /^0.55/.test(a.style.opacity),
        tester: {
            a: a,
            div: div
        },
        createDocument: !! (document.implementation && document.implementation.createDocument),
        canvas: typeof CanvasRenderingContext2D !== 'undefined',

        getSetAttribute: div.className !== "t",

        scriptEval: false,

        classList: !! div.classList
    };
    //            div.setAttribute("b", "bb");
    //            div.c = "cc";
    //            alert(div.getAttributeNode("b").nodeValue)
    //            alert(support.getSetAttribute)
    //            alert(div.getAttribute("b"))
    script.type = "text/javascript";

    try {
        script.appendChild(document.createTextNode("window." + id + "=1;"));
    } catch (e) {}

    root.insertBefore(script, root.firstChild);

    if (window[id]) {
        support.scriptEval = true;
        delete window[id];
    }
    root.removeChild(script);

    $.easyExtend($.support, support);

    return $.support;
}, "1.0.0");