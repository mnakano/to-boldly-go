//assigning database
var mongo = require('mongodb');
var monk = require('monk');
const DB_URL = process.env.DB_URL;

var _db;

module.exports = {
	connectToDb: function(){
		_db = monk(DB_URL);
	},
	
	getDb: function(){
		return _db;
	}
}