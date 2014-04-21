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

> See [homepage](http://mdsb100.github.io/homepage/). But it is compressed.

> See also [homepage](http://mdsb100.github.io/AMDQuery/document/app.html). It is uncompressed and loading slow, please more patient. You can open developer tool to see some Interesting things. Yow will see broswer load js and css one by one in head of HTML.

## Build

cd build, sudo npm install or npm install.

Input "jake", you can see:

* jake buildapp[*.js(config file)]             build application
* jake buildapp                                default is build_app_config.js
* jake buildjs[*.js(config file)]              build javascript
* jake buildjs                                 default is build_js_config.js
* jake jsdoc[default|amdquery(template name)]  build javascript api document
* jake jsdoc                                   default is amdquery
* jake ui_css                                  build css of widget-ui
* jake beautify[...file]                       example 'jake beautify[a.html,b.css,c.xml,d.js]'


### Using in mobile

> Make "amdquery/mobile/event.js" as a proxy to handle touch-event translate to mouse-event.

* mousedown <==> touchstart
* mousemove <==> touchmove
* mouseup <==> touchend

> You just bind "mousedown". When in mobile devices, "mousedown" will become "touchdown".

### MVC

> Model is not achieved, may be used directly backbone of the model. View may need a template like handlerbars.

> Now, the [app.html](https://github.com/mdsb100/AMDQuery/blob/master/document/app.html) is just a simple example.

### API Document

> AMDQuery uses jsdoc to build API document. API document is gradually perfected.

> After MVC completed, The templates of "jsdoc" will be changed.

