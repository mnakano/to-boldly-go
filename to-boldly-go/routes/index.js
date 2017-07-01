var express = require('express');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var multer = require('multer');
var fs = require('fs');
var async = require('async');
var router = express.Router();

//get multer instance for uploading photo(s).
var upload = getMulterUploadInstance('./public/images/tmp/');

/* GET home page. */
router.get('/', function(req, res, net) {
	res.render('index', { title : 'To Boldly Go' });
});

/* GET a continent page. */
router.get('/south-america', function(req, res, next) {
  var db = req.db;
  var albums = db.get('album');
  albums.find({}, {}, function(e, docs){
	res.render('album-list', {
			title:'To boldy Go', 
			'albums' : docs
		});
  });
});

/*GET new album entry page*/
router.get('/new-album', function(req, res){
	res.render('new-album', {title : 'To Boldly Go'});
});

/* DELETE an album */
router.get('/deleteAlbum/:id/:continent/:title', function(req, res){
	async.series([
		function(callback){
			dbDeleteTask(req.db.get('album'), req.params.id, callback);
		},
		function(callback){
			deleteDirectoryTask('./public/images/' + req.params.continent + '/' + req.params.title, callback);
		}
	], function(err){
		finalTaskRedirect(err, ['dbDelete', 'deleteDirectory'], res, '/south-america');
	});
});

/*POST to Add Album Service*/
router.post('/addAlbum', upload.array('photo'), function(req, res){
	
	//set request values and return a DB entry.
	var newEntry = createDBEntry(req);
	
	//handle directory creation and photo relocation in series.
	async.series([
		function(callback){
			createDirectoryTask('./public' + newEntry.photoDirectory, callback);
		},
		function(callback){
			movePhotosTask(req.files[0].destination + '/', './public' + newEntry.photoDirectory, req.files, callback);
		},
		function(callback){
			dbInsertTask(req.db.get('album'), newEntry, callback);
		}
	], function(err){
		finalTaskRedirect(err, ['createDirectory', 'movePhotos', 'dbInsertTask'], res, '/south-america');
	});
});

/*GET an album data to edit form*/
router.get('/edit-form/:id', function(req, res){
	var db = req.db;
	var albums = db.get('album');
	albums.findOne({_id:req.params.id}, function(err, doc){
		if(err){
			res.send("There was a problem finding the record.");
		}else{
			res.render('edit-form', {
				title:'To boldy Go', 
				'album' : doc
			});
		}
	});
});

/*UPDATE an album data*/
router.post('/editAlbum/:id', upload.array('photo'), function(req, res){
	
	//set request values and return a DB entry.
	var updatedEntry = createDBEntry(req);
	
	//handle directory and photo updates.
	async.series([
		function(callback){
			createDirectoryTask('./public' + updatedEntry.photoDirectory, callback);
		},
		function(callback){
			deletePhotosTask('./public' + updatedEntry.photoDirectory, callback);
		},
		function(callback){
			movePhotosTask(req.files[0].destination + '/', './public' + updatedEntry.photoDirectory, req.files, callback);
		},
		function(callback){
			dbUpdateTask(req.db.get('album'), req.params.id, updatedEntry, callback);
		}
	], function(err){
		finalTaskRedirect(err, ['createDirectory', 'deletePhotos', 'movePhotos', 'dbUpdateTask'], res, '/south-america');
	});
});

function getMulterUploadInstance(destinationPath){
	//configure multer upload object
	var storage = multer.diskStorage({
		destination: function(req, file, cd){
			cd(null, destinationPath);
		},
		filename: function(req, file, cd){
			cd(null, file.originalname);
		}
	});

	return multer({storage : storage});
}

function createDBEntry(req){
	var entry = {};
	
	//set request field values
	var albumTitle = req.body.albumTitle;
	var albumCategory = req.body.albumCategory;
	var continent = req.body.continent;
	var country = req.body.country;
	var albumDate = req.body.albumDate;
	var photoArray = [];
	
	//get continent folder name
	var continentFolder = continent.toLowerCase().split(' ').join('-');
	//get album folder name
	var albumFolder = albumTitle.toLowerCase().split(' ').join('-');
	
	//build photo directory
	var photoDirectory = "/images/" + continentFolder + "/" + albumFolder + "/";
	var descriptions = req.body.photoDescription;
	
	//set photo location and description
	if(req.files.length > 1){	
		for(var i = 0; i < req.files.length; i++){
			photoArray.push({"photo" : photoDirectory + req.files[i].originalname, "photoDescription" : descriptions[i]});
		}
	}else{
		photoArray.push({"photo" : photoDirectory + req.files[0].originalname, "photoDescription" : descriptions});
	}
	
	var entry = {
		"albumTitle" : albumTitle,
		"albumCategory" : albumCategory,
		"country" : country,
		"continent" : continent,
		"albumDate" : albumDate,
		"photos" : photoArray,
		"publishedDate" : new Date().toISOString(),
		"photoDirectory" : photoDirectory
	};
	
	return entry;
}

function deleteDirectoryTask(directory, callback){
	rimraf(directory, function(err){
		if(err){
			callback(err);
		}
		console.log(directory + ' has been successfully deleted.');
		callback();
	});
}

function createDirectoryTask(directory, callback){
	mkdirp(directory, function(err){
		if(err){
			callback(err);
		}
		console.log(directory + ' exists or has been created.');
		callback();
	});
}

function movePhotosTask(oldPath, newPath, files, callback){
	for(var i = 0; i < files.length; i++){
		fs.rename(oldPath + files[i].originalname, newPath + files[i].originalname, function(err){
			if(err){
				callback(err);
			}
			console.log('File has been moved.');
		});
	}
	callback();
}

function deletePhotosTask(directory, callback){
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
}

function finalTask(err, tasks){
	if(err){
		console.log('An error occurred: ' + err);
	}
	console.log('All tasks successful: ' + tasks);
}

function finalTaskRedirect(err, tasks, res, redirectRoute){
	if(err){
		console.log('An error occurred: ' + err);
	}
	console.log('All tasks successful: ' + tasks);
	res.redirect(redirectRoute);
}

function dbDeleteTask(collection, id, callback){
	collection.remove({_id:id}, function(err){
		if(err){
			callback(err);
		}
		callback();
	});
}

function dbInsertTask(collection, entry, callback){
	collection.insert(entry, function(err, doc){
		if(err){
			callback(err);
		}
		callback();
	});
}

function dbUpdateTask(collection, id, entry, callback){
	collection.update({_id:id}, {$set:entry}, function(err){
		if(err){
			callback(err);
		}
		callback();
	});
}

module.exports = router;
