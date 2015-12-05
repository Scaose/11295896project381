var express = require('express');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var app = express();
//var MONGODBURL = 'mongodb://localhost:27017/test';
var MONGODBURL = 'mongodb://admin:password@ds054298.mongolab.com:54298/restaurants';

var restSchema = require('./models/restaurant.js');
app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get("", function(req, res){
	res.sendfile('html/main.html');
});

app.get('/', function(req, res){
  	res.sendfile('html/main.html');	
});


//search.html
app.get('/search', function(req,res) {
	res.sendFile(__dirname + '/html/search.html'); 
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
	  var restaurant = mongoose.model('Restaurant', restSchema);
		restaurant.find({name:req.params.reqName}, function(err, results){
		  if(err)
		    res.write("<p>Error: " + err.message + "</p>");
		  db.close();
		  res.render('update',  {restResult : results}); 
		  res.end(); 
		});
		    
	});
});

function CreateRestaurantObj(body){
	var obj = {};
	obj.address = {};
	obj.address.coord = [];
	if(body.building != null)
		obj.address.building = body.building;
	if(body.lon != null)
		obj.address.coord.push(parseInt(body.lon));
	else
		obj.address.coord.push(null);
	if(body.lat != null)
		obj.address.coord.push(parseInt(body.lat));
	else
		obj.address.coord.push(null);
	if(body.street != null)
		obj.address.street = body.street;
	if(body.zipcode != null)
		obj.address.zipcode = body.zipcode;
	if(body.borough != null)
		obj.borough = body.borough;
	if(body.cuisine != null)
		obj.cuisine = body.cuisine;
	if(body.name != null)
		obj.name = body.name;
	if(body.restaurant_id != null)
		obj.restaurant_id = body.restaurant_id;
	return obj;
}

function MergeRestaurantObj(oldObj, newObj){
	if(newObj.address.building != null)
		oldObj.address.building = newObj.building;
	if(newObj.address.coord[0] != null){
		oldObj.address.coord[0] = parseInt(newObj.address.coord[0]);
	}
	if(newObj.address.coord[1] != null){
		oldObj.address.coord[1] = parseInt(newObj.address.coord[1]);
	}
	if(newObj.address.street != null)
		oldObj.address.street = newObj.street;
	if(newObj.address.zipcode != null)
		oldObj.address.zipcode = newObj.zipcode;
	if(newObj.borough != null)
		oldObj.borough = newObj.borough;
	if(newObj.cuisine != null)
		oldObj.cuisine = newObj.cuisine;
	if(newObj.name != null)
		oldObj.name = newObj.name;
	if(newObj.restaurant_id != null)
		oldObj.restaurant_id = newObj.restaurant_id;
	return oldObj;
}

function ParamToObj(field, value){
	var datajson = {};
	switch (field){
	case "date": case "grade": case "score": {var d={};d[field] = value;datajson["grades"] =  {$elemMatch: d};break;}
	case "building": case "street": case "zipcode": {datajson["address." + field] =  value;break;}
	case "lon":case "lat": {datajson["address.coord"] =  value;break;}
	default: {datajson[field] = value;break;}	
	}
	return datajson;
}

//curl create
app.post('/', function(req,res) {
	console.log("Create from curl");
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		console.log("Connect to DB");
		var restaurant = mongoose.model('Restaurant', restSchema);
		var datajson = CreateRestaurantObj(req.body);
		var r = new restaurant(datajson);
		r.save(function(err) {
			if (err) {
				res.status(500).json(err);
				throw err;
			}
			res.status(200).json({message: "insert done", restaurant_id : req.body.restaurant_id});
			console.log('A model is Created');

			res.end();
			db.close();
		});
	});
});

//curl delete
app.delete('/:field/:value', function(req, res){
	console.log("Delete From curl");
	mongoose.connect(MONGODBURL);
        var db = mongoose.connection;
	var datajson = ParamToObj(req.params.field, req.params.value);
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function (callback){
	  var restaurant = mongoose.model('Restaurant', restSchema);
		restaurant.findOneAndRemove(datajson, function(err){
			  if(err){
			    res.status(500).json(err);
			    throw err;
			  }
			  db.close();
			  res.status(200).json({message: "delete done", restaurant_id : req.params.id});
			  res.end(); 
			});

		
	});
});

//curl Update
app.put('/:field/:value', function(req, res){
	console.log("Update From curl");
	var jsoncondition=ParamToObj(req.params.field, req.params.value);
	mongoose.connect(MONGODBURL);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function (callback){
	  var restaurant = mongoose.model('Restaurant', restSchema);
		restaurant.find(jsoncondition, function(err, result){
			  if(err){
			    res.status(500).json(err);
			    throw err;
			  }
			  var jsonupdatedata = CreateRestaurantObj(req.body);
			  for(var i=0;i<result.length;i++){
			    MergeRestaurantObj(result[i], jsonupdatedata).save();
			  }
			  db.close();

		  	  var msg = {message: "Update done"};
			  msg[req.params.field] = req.params.value;
			  res.status(200).json(msg);
			  res.end(); 
		});
				
	});
});

//curl update insert grade
app.put('/:field/:value/grade', function(req, res){
	console.log("Update grade from curl");
	var jsoncondition=ParamToObj(req.params.field, req.params.value);
	var dataObj = {};
  	if(req.body.date != null){
	  dataObj.date = req.body.date;	
 	}
  	if(req.body.grade != null){
	  dataObj.grade = req.body.grade;	
  	}
  	if(req.body.score != null){
	  dataObj.score = req.body.score;	
  	}
	mongoose.connect(MONGODBURL);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function (callback){
	  var restaurant = mongoose.model('Restaurant', restSchema);
		restaurant.find(jsoncondition, function(err, result){

			  if(err){
			    res.status(500).json(err);
			    throw err;
			  }
			  for(var i=0;i<result.length;i++){	
				result[i].grades.push(dataObj);
			  	result[i].save();				
			  }
			  db.close();
			  var msg = {message: "Update done"};
			  res.status(200).json(msg);
			  res.end(); 
			
		});
				
	});

});

//curl Update Grades
app.put('/:field/:value/updategrade', function(req, res){
	console.log("Update grade from curl");
	var jsoncondition=ParamToObj(req.params.field, req.params.value);
	var dataObj = {};
  	if(req.body.date != null){
	  dataObj.date = req.body.date;	
  	}
  	if(req.body.grade != null){
	  dataObj.grade = req.body.grade;	
  	}
  	if(req.body.score != null){
	  dataObj.score = req.body.score;	
  	}
	mongoose.connect(MONGODBURL);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function (callback){
	  var restaurant = mongoose.model('Restaurant', restSchema);
		restaurant.find(jsoncondition, function(err, result){

			  if(err){
			    res.status(500).json(err);
			    throw err;
			  }
			  for(var i=0;i<result.length;i++){
				var found = false;
			    	for(var j=0; j<result[i].grades.length;j++){
					if(dataObj.date != null){
						if(result[i].grades[j].date.valueOf() == new Date(dataObj.date).valueOf()){
							if(dataObj.grade != null){
								result[i].grades[j].grade = dataObj.grade;	
						 	}
						  	if(dataObj.score != null){
							  	result[i].grades[j].score = dataObj.score;	
						  	}
							result[i].save();
							found = true;
							break;
						}
					}
				}
				if(!found){
					
					result[i].grades.push(dataObj);
					result[i].save();				
				}
			  }
			  db.close();
			  var msg = {message: "Update done"};
			  res.status(200).json(msg);
			  res.end(); 
			
		});
				
	});
});

//curl Read
app.get('/:field/:value', function(req,res) {
	console.log("Search get it");
	var datajson = ParamToObj(req.params.field, req.params.value);
        mongoose.connect(MONGODBURL);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function (callback){
	  var restaurant = mongoose.model('Restaurant', restSchema);
		restaurant.find(datajson, function(err, results){
		  if(err){
		    res.status(500).json(err);
		    throw err;
		  }
		  db.close();
		  if(results.length>0){	//Has result	   
		      res.status(200).json(results);
		  }
		  else{			//No result
		      res.status(200).json({message:"No matching document"});
		  }
		  res.end(); 
		});
		    
	});
});

//Create action for web
app.post('/newRest', function(req,res) {
	console.log("Create get it");
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		console.log("Connect to DB");
		var restaurant = mongoose.model('Restaurant', restSchema);
		var r = new restaurant({address:{building: req.body.building,
				         coord: [parseInt(req.body.lon),parseInt(req.body.lat)],
				         street: req.body.street,
				         zipcode: req.body.zipcode,
				        },
				       borough : req.body.borough,
				       cuisine : req.body.cuisine,
				       name : req.body.dataName,
				       restaurant_id : req.body.restaurant_id});
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

//Read action for web
app.get('/display', function(req,res) {
	console.log("Read get it");
        mongoose.connect(MONGODBURL);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function (callback){
	  var restaurant = mongoose.model('Restaurant', restSchema);
		restaurant.find({}, function(err, results){
		  if(err)
		    res.write("<p>Error: " + err.message + "</p>");
		  db.close();
		  res.render('display',  {restResult : results}); 
		  res.end(); 
		});
		    
	});
});

//Search action for web
app.get('/searchRest', function(req,res) {
	console.log("Search from web " + req.body.field + " " + req.body.value);
	var datajson = {};
	datajson[req.query.field] = req.query.value;
        mongoose.connect(MONGODBURL);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function (callback){
	  var restaurant = mongoose.model('Restaurant', restSchema);
		restaurant.find(datajson, function(err, results){
		  if(err){
		    res.status(500).json(err);
		    throw err;
		  }
		  db.close();
		  if(results.length>0){	//Has result	   
		     	res.render('display',  {restResult : results}); 
		  }
		  else{			//No result
		      
			res.write("<p>There is no any matching result.</p>");
		  }
		  res.end(); 
		});
		    
	});
});

//Update action for web
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
	  var restaurant = mongoose.model('Restaurant', restSchema);
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

//Delete action for web
app.delete('/delete/restaurant_id/:id', function(req, res){
	console.log("Delete Get it");
	console.log(req.params.id);
	var datajson = "{$or[";
	var values = req.params.id.split("!@,");
	for(i in values){
	datajson+="{restaurant_id:"+i+"}";	
	}
	datajson+="]}";
	console.log(datajson);
	mongoose.connect(MONGODBURL);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function (callback){
	  var restaurant = mongoose.model('Restaurant', restSchema);
		restaurant.findOneAndRemove({restaurant_id:req.params.id}, function(err){
			  if(err)
			    res.write("<p>Error: " + err.message + "</p>");
			  db.close();
			  res.write("Delete success");
			  res.end(); 
			});
		
	});
});



var portNum = 3081;
var server = app.listen(process.env.PORT || portNum, function(){
	console.log('Application is listening...');
});
