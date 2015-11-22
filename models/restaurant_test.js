var mongoose = require('mongoose');

var restSchema = mongoose.Schema({
	address:{building:String,
			coord:[Number,Number],
			street:String,
			zipcode:String,
			},
	borough:String,
	cuisine:String,
	name:String,
	restaurant_id:String
});

module.exports = restSchema;
