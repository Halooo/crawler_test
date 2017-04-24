var express = require('express');
var app = express();
var route = require('./routes')

app.use('/', route);

var http = require("http").Server(app);
var port = 5657;
app.set('port', port);

http.listen(port, function() {
    console.log('server listening on ' + port);
});
