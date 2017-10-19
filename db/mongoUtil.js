//assigning database
var mongo = require('mongodb');
var monk = require('monk');
var dbConfig = require('../config/db');

var _db;

module.exports = {
	connectToDb: function(){
		_db = monk(dbConfig.url);
	},
	
	getDb: function(){
		return _db;
	}
}