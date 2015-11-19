var express = require('express');
var mongoose = require('mongoose');
var app = express();
app.get('/', function(req, res){
  res.sendfile('ejs/main.html');
});
app.get('/insert', function(req, res){
  var string = req.query.txtInput;
  res.send(string);
});
/*
app.post('/', function(req, res){
	res.send('Hello');
});
app.put('/', function(req, res){
	res.send('Hello');
});
app.delete('/', function(req, res){
	res.send('Hello');
});
*/
var portNum = 3081;
var server = app.listen(process.env.PORT || portNum, function(){
	console.log('Application is listening...');
});
