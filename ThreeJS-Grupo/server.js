/*
var express = require('express');
var cors = require('cors');
var app = express();
 
app.use(cors());
app.options('*', cors()); 

app.use(express.static(__dirname + '/CDN Resources'));
 
app.listen(8080);
*/

var express = require('express');
var app = express(); 

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
    next();
});
 
app.use(express.static(__dirname + '/CDN Resources'));
 
app.listen(8080);



