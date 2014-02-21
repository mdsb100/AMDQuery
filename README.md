# AMDQuery

> It is a website development library.

> It combines jQuery and jQuery-ui, provides MVC. It is not entirely jQuery nad jQuery-ui. I Made some changes, and even some module version is still relatively distant.

> Use AMD management module. It can be compressed js into a file.

> It can be compatible with IE78, but some styles using html5, IE78 does not compatible.


## Developing

> Because only one contributor, so development is so low.

> I hope some people are interested and able to participate in.

> As a contributor, offer some suggestions and any kind of help, I would be very grateful.

> More contact information：78612846@qq.com

## Usage

> See [homepage](http://mdsb100.github.io/AMDQuery/). But it is compressed.

> Also See [homepage](http://mdsb100.github.io/AMDQuery/document/app/app.html). It is uncompressed


### Using in mobile

> Make "amdquery/mobile/event.js" as a proxy to handle touch-event translate to mouse-event.

* mousedown <==> touchstart
* mousemove <==> touchmove
* mouseup <==> touchend

> You just bind "mousedown". When in mobile devices, "mousedown" will become "touchdown".

### MVC

> Model is not achieved, may be used directly backbone of the model. View may need a template like handlerbars.

> Now, the [app.html](https://github.com/mdsb100/AMDQuery/blob/master/document/app/app.html) is just a simple example.

### API Document

> AMDQuery uses jsdoc to build API document. API document is gradually perfected.

> After MVC completed, The templates of "jsdoc" will be changed.

