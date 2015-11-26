var express = require('express');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var app = express();
var MONGODBURL = 'mongodb://localhost:27017/test';

var restSchema = require('./models/restaurant.js');
app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
  res.sendfile('html/main.html');	
});

//create.ejs
app.get('/create', function(req,res) {
   res.sendfile('html/create.html');
});

//update.ejs
app.get('/update/:reqName', function(req, res){
	console.log("Catch update request");
	mongoose.connect(MONGODBURL);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function (callback){
	  var restaurant = mongoose.model('MiniRestaurant', restSchema);
		restaurant.find({name:req.params.reqName}, function(err, results){
		  if(err)
		    res.write("<p>Error: " + err.message + "</p>");
		  db.close();
		  res.render('update',  {restResult : results}); 
		  res.end(); 
		});
		    
	});
});

//Create action
app.post('/newRest', function(req,res) {
	console.log("Create get it");
	//var restData = {name: ""};
	//restData.name = req.body.dataName;
	console.log(req.body.dataName);
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		console.log("Connect to DB");
		var restaurant = mongoose.model('MiniRestaurant', restSchema);
		var r = new restaurant({address:{building: req.body.building,
				         coord: [parseInt(req.body.lon),parseInt(req.body.lat)],
				         street: req.body.street,
				         zipcode: req.body.zipcode,
				        },
				       borough : req.body.borough,
				       cuisine : req.body.cuisine,
				       name : req.body.dataName,
				       restaurant_id : req.body.restaurant_id});
		//var newData = new restaurant (r);
		r.save(function(err) {
			res.write('<html><body>');
			if (err) {
				res.write('<p>'+err.message+'</p>');
			}
			else {
				res.write('<h1>Create Succeed</h1>');
				console.log('A model is Created');
			}
			res.write('<a href="/create">Create Another</a><br>');
			res.write('<br><a href="/">Go Home</a></body></html><br>');

			res.end();
			db.close();
		});
	});
});

//search
app.get('/search', function(req,res) {
	res.sendFile(__dirname + '/html/search.html'); 
});

//Read action
app.get('/display', function(req,res) {
	console.log("Read get it");
        mongoose.connect(MONGODBURL);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function (callback){
	  var restaurant = mongoose.model('MiniRestaurant', restSchema);
		restaurant.find({}, function(err, results){
		  if(err)
		    res.write("<p>Error: " + err.message + "</p>");
		  db.close();
		  res.render('display',  {restResult : results}); 
		  res.end(); 
		});
		    
	});
});

//Update action
app.put('/updateRest/:id/:value', function(req, res){
	console.log("Put get it");
	var data = req.params.value.split("!@&");
	var jsondata = {address:{building: data[0],
				         coord: [parseInt(data[1]),parseInt(data[2])],
				         street: data[3],
				         zipcode: data[4],
				        },
				       borough : data[5],
				       cuisine : data[6],
				       name : data[7]};
	//console.log(jsondata);
	mongoose.connect(MONGODBURL);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function (callback){
	  var restaurant = mongoose.model('MiniRestaurant', restSchema);
		restaurant.findOneAndUpdate({restaurant_id
:req.params.id},jsondata, {upsert:false}, function(err){
		  if(err)
		    res.write("<p>Error: " + err.message + "</p>");
		  db.close();
		  res.write("<p>Success</p>");
		  res.end(); 
		});
		    
	});
});

//Delete action 
app.delete('/deleteRest/name/:id', function(req, res){
	console.log("Delete Get it");
	mongoose.connect(MONGODBURL);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function (callback){
	  var restaurant = mongoose.model('MiniRestaurant', restSchema);
		restaurant.findOneAndRemove({restaurant_id:req.params.id}, function(err){
			  if(err)
			    res.write("<p>Error: " + err.message + "</p>");
			  db.close();
			  res.write("Delete success");
			  res.end(); 
			});
		
	});
});

/*app.get('/searchRest',function(req,res) {

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
});*/



var portNum = 3081;
var server = app.listen(process.env.PORT || portNum, function(){
	console.log('Application is listening...');
});
