var express = require('express');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var app = express();
var MONGODBURL = 'mongodb://localhost:27017/test';

var restSchema = require('./models/restaurant_test.js');

function Restaurant(building,lat,long,street,zipcode,borough,cuisine,name,restaurant_id) {
	function Address(building,lat,long,street,zipcode) {
		this.building = building;
		this.coord = [];
		this.coord.push(lat);
		this.coord.push(long);
		this.street = street;
		this.zipcode = zipcode;
	}
	this.address = new Address(building,lat,long,street,zipcode);
	this.borough = borough;
	this.cuisine = cuisine;
	//this.grades = [];
	this.name = name;
	this.restaurant_id = restaurant_id;
}



app.use(bodyparser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
  res.sendfile('html/main.html');
});

//create.html
app.get('/create', function(req,res) {
	res.sendFile(__dirname + '/html/create.html'); 
});

//Read action
app.get('/display', function(req,res) {
        mongoose.connect(MONGODBURL);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function (callback){
	  var restaurant = mongoose.model('MiniRestaurant', restSchema);
		restaurant.find({}, function(err, results){
		  if(err)
		    res.write("<p>Error: " + err.message + "</p>");
		  db.close();
		  //res.render('display',  {restResult : [{name: "ABC"},{name: "DEF"}]}); 
		  res.render('display',  {restResult : results}); 
		  res.end(); 
		});
		    
	});
});

//Create action
app.post('/newRest', function(req,res) {
	//var restData = {name: ""};
	//restData.name = req.body.dataName;
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		console.log("Connect to DB");
		var id = Math.floor((Math.random() * 10000000) + 1); 
		var r = new Restaurant(req.body.building,
				       parseInt(req.body.lat),
				       parseInt(req.body.long),
				       req.body.street,
				       req.body.zipcode,
				       req.body.borough,
				       req.body.cuisine,
				       req.body.name,
				       id);

		var restaurant = mongoose.model('MiniRestaurant', restSchema);
		var newData = new restaurant (r);


		newData.save(function(err) {
			res.write('<html><body>');
			if (err) {
				res.write('<p>'+err.message+'</p>');
			}
			else {
				res.write('<h1>Create Succeed</h1>');
				console.log('A model is Created');
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



var portNum = 3087;
var server = app.listen(process.env.PORT || portNum, function(){
	console.log('Application is listening...');
});
