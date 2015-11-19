var express = require('express');
var mongoose = require('mongoose');
var app = express();
var MONGODBURL = 'mongodb://localhost/test';

var restSchema = require('./models/restaurant');


/*app.get('/', function(req, res){
  res.sendfile('ejs/main.html');
});*/

app.post('/', function(req, res){
	res.sendFile(__dirname + '/ejs/index.html'); 
});


app.get('/new', function(req,res) {
	res.sendFile(__dirname + '/ejs/create.html'); 
});

app.get('/display', function(req,res) {
	res.sendFile(__dirname + '/ejs/display.html');  
});

app.get('/searchRest',function(req,res) {
	//console.log(req.query.name);
mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var restaurant = mongoose.model('Restaurant', restSchema);
		var criteria = {};
		if (req.query.name) {criteria.name = RegExp(req.query.name)}
		restaurant.find(criteria, function(err,results) {
			if (err) {
				console.log("Error: " + err.message);
				res.write(err.message);
			}
			else {
				console.log('Found: ',results.length);
				res.render('showEditRest',{restaurants: results});
			}
			res.end();
			db.close();
		});
	});
});



var portNum = 3081;
var server = app.listen(process.env.PORT || portNum, function(){
	console.log('Application is listening...');
});
