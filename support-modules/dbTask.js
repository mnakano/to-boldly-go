var mongoUtil = require('../db/mongoUtil');
var _db = mongoUtil.getDb();

module.exports = {
	
	findMany: function(collection, keys, options, callback){
		var message = '';
		_db.get(collection).find(keys, options, function(err, results){
			if(err){
				callback(err);
			}
			if(!results.length){
				message = 'No documents found';
			}
			callback(null, results, message);
		});
	},
	
	findOne: function(collection, keys, options, callback){
		var message = '';
		_db.get(collection).findOne(keys, options, function(err, result){
			if(err){
				callback(err);
			}
			if(!result){
				message = 'No document found';
			}
			callback(null, result, message);
		});
	},
	
	deleteDoc: function(collection, keys, callback){
		_db.get(collection).remove(keys, function(err){
			if(err){
				callback(err);
			}
			callback();
		});
	},
	
	insert: function(collection, entry, callback){
		_db.get(collection).insert(entry, function(err, doc){
			if(err){
				callback(err);
			}
			callback();
		});
	},

	update: function(collection, id, entry, callback){
		_db.get(collection).update(id, entry, function(err){
			if(err){
				callback(err);
			}
			callback();
		});
	}
}