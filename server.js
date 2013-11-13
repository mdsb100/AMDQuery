var port = 8080;
var connect = require('connect');
connect().use(connect.static(__dirname + '/')).listen(port);
console.log('my server is running with  port:' + port);
