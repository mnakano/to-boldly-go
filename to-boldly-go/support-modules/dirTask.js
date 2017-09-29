var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var fs = require('fs');

module.exports = {
	createDir: function(directory, callback){
		mkdirp(directory, function(err){
			if(err){
				callback(err);
			}
			console.log(directory + ' exists or has been created.');
			callback();
		});
	},

	deleteDir: function(directory, callback){
		rimraf(directory, function(err){
			if(err){
				callback(err);
			}
			console.log(directory + ' has been successfully deleted.');
			callback();
		});
	},
	
	renameDir: function(oldDirectory, newDirectory, callback){
		fs.rename(oldDirectory, newDirectory, function(err){
			if(err){
				callback(err)
			}
			console.log('Directory name changed');
			callback();
		});
	},

	movePhotos: function(oldPath, newPath, files, callback){
		for(var i = 0; i < files.length; i++){
			fs.rename(oldPath + files[i].originalname, newPath + files[i].originalname, function(err){
				if(err){
					callback(err);
				}
				console.log('File has been moved.');
			});
		}
		callback();
	},

	deletePhoto: function(path, callback){
		fs.unlink(path, function(err){
			if(err){
				callback(err);
			}
			console.log('photo has been deleted.');
			callback();
		});
	},
	
	deletePhotos: function(directory, callback){
		fs.readdir(directory, function(err, files){
			if(err){
				callback(err);
			}
			for(var i = 0; i < files.length; i++){
				fs.unlink(directory + files[i], function(err){
					if(err){
						callback(err);
					}
					console.log('photo has been deleted.');
				});
			}
			callback();
		});
	},
	
	deleteRemovedPhotos: function(directory, photos, callback){
		fs.readdir(directory, function(err, files){
			if(err){
				callback(err);
			}
			for(var i = 0; i < files.length; i++){
				if(photos.indexOf(files[i]) < 0){
					fs.unlink(directory + files[i], function(err){
						if(err){
							callback(err);
						}
						console.log('photo has been deleted.');
					});
				}
			}
			callback();
		});
	}
}