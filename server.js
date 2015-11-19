var express = require('express');
var mongoose = require('mongoose');
var app = express();
var MONGODBURL = 'mongodb://localhost/test';

var restSchema = require('./models/test');


app.get('/', function(req, res){
  res.sendfile('ejs/main.html');
});

app.get('/create', function(req,res) {
	res.sendFile(__dirname + '/ejs/create.html'); 
});

app.get('/display', function(req,res) {
	res.sendFile(__dirname + '/ejs/display.html');  
});


app.get('/newRest', function(req,res) {
	var newRest = {name: ""};
	newRest.name = req.query.name;

	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var restaurant = mongoose.model('Restaurant', restSchema);
		var restdata = new restaurant(newRest);
		restdata.save(function(err) {
			res.write('<html><body>');
			if (err) {
				res.write('<p>'+err.message+'</p>');
			}
			else {
				res.write('<h1>Create Succeed</h1>');
				console.log('Created: ',k._id);
			}
			res.write('<br><a href="/">Go Home</a></body></html>');
			res.end();
			db.close();
		});
	});
});




app.get('/searchRest',function(req,res) {

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
