module.exports = {
	
	dbFindDocumentsTask: function(collection, keys, options, callback){
		var message = '';
		collection.find(keys, options, function(err, results){
			if(err){
				callback(err);
			}
			if(!results.length){
				message = 'No documents found';
			}
			callback(null, results, message);
		});
	},
	
	dbDeleteTask: function(collection, keys, callback){
		collection.remove(keys, function(err){
			if(err){
				callback(err);
			}
			callback();
		});
	},
	
	dbInsertTask: function(collection, entry, callback){
		collection.insert(entry, function(err, doc){
			if(err){
				callback(err);
			}
			callback();
		});
	},

	dbUpdateTask: function(collection, id, entry, callback){
		collection.update({_id:id}, {$set:entry}, function(err){
			if(err){
				callback(err);
			}
			callback();
		});
	}
}