﻿/// <reference path="../myquery.js" />

myQuery.define("mobile/event.proxy", ["main.event"], function ($, event, undefined) {
    "use strict"; //启用严格模式
    var mouse = "drag dragend dragenter dragleave dragstart dragover".split(" ")
        , len = html5Eventlist.length
        , i = 0;
    for (i = 0; i < len; i++) {
        event.event.domEventList[mouse[i]] = event.event.document.mouse; //mouse
    }
    return true;
});