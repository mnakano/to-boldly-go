var express = require('express');
var async = require('async');
var router = express.Router();
var directoryHandler = require('./directoryHandler');
var multiFormHandler = require('./multiFormHandler');
var dbOperations = require('./dbOperations');
var dbEntry = require('./dbEntry');
var finalTasks = require('./finalTasks');

//get multer instance for uploading photo(s).
var upload = multiFormHandler.getUploadInstance('./public/images/tmp/');

/* GET home page. */
router.get('/', function(req, res, net) {
	async.waterfall([
		function(callback){
			var options = {sort : {publishedDate : -1}};
			dbOperations.dbFindAlbumsTask(req.db.get('album'), null, options, callback);
		}
	], function(err, results, message){
		finalTasks.render(err, res, results, message, 'index');
	});
});

/* GET a region page. */
router.get('/region/:region', function(req, res, next) {
	async.waterfall([
		function(callback){
			var keys = {region : req.params.region.split('-').join(' ')};
			dbOperations.dbFindAlbumsTask(req.db.get('album'), keys, null, callback);
		}
	], function(err, results, message){
		finalTasks.render(err, res, results, message, 'album-list')
	});
});

/*GET new album entry page*/
router.get('/new-album', function(req, res){
	res.render('new-album');
});

/* DELETE an album */
router.get('/deleteAlbum/:id/:region/:title', function(req, res){
	async.series([
		function(callback){
			dbOperations.dbDeleteTask(req.db.get('album'), req.params.id, callback);
		},
		function(callback){
			directoryHandler.deleteDirectoryTask('./public/images/' + req.params.region + '/' + req.params.title, callback);
		}
	], function(err){
		finalTasks.redirect(err, res, '/region/' + req.params.region);
	});
});

/*POST to Add Album Service*/
router.post('/addAlbum', upload.array('photo'), function(req, res){
	
	//set request values and return a DB entry.
	var newEntry = dbEntry.createDBEntry(req);
	
	//handle directory creation and photo relocation in series.
	async.series([
		function(callback){
			directoryHandler.createDirectoryTask('./public' + newEntry.photoDirectory, callback);
		},
		function(callback){
			directoryHandler.movePhotosTask(req.files[0].destination + '/', './public' + newEntry.photoDirectory, req.files, callback);
		},
		function(callback){
			dbOperations.dbInsertTask(req.db.get('album'), newEntry, callback);
		}
	], function(err){
		finalTasks.redirect(err, res, '/region/' + newEntry.region.split(' ').join('-'));
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
				'album' : doc
			});
		}
	});
});

/*UPDATE an album data*/
router.post('/editAlbum/:id', upload.array('photo'), function(req, res){
	
	//set request values and return a DB entry.
	var updatedEntry = dbEntry.createDBEntry(req);
	
	//handle directory and photo updates.
	async.series([
		function(callback){
			directoryHandler.createDirectoryTask('./public' + updatedEntry.photoDirectory, callback);
		},
		function(callback){
			directoryHandler.deletePhotosTask('./public' + updatedEntry.photoDirectory, callback);
		},
		function(callback){
			directoryHandler.movePhotosTask(req.files[0].destination + '/', './public' + updatedEntry.photoDirectory, req.files, callback);
		},
		function(callback){
			dbOperations.dbUpdateTask(req.db.get('album'), req.params.id, updatedEntry, callback);
		}
	], function(err){
		finalTasks.redirect(err, res, '/region/' + updatedEntry.region.split(' ').join('-'));
	});
});

module.exports = router;
