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
router.get('/', function(req, res) {
	async.waterfall([
		function(callback){
			var options = {sort : {publishedDate : -1}};
			dbOperations.dbFindDocumentsTask(req.db.get('album'), null, options, callback);
		}
	], function(err, results, message){
		finalTasks.render(err, res, 'albums', results, message, 'index');
	});
});

router.get('/admin-album-list', function(req, res){
	async.waterfall([
		function(callback){
			var options = {sort : {albumTitle : 1}};
			dbOperations.dbFindDocumentsTask(req.db.get('album'), null, options, callback);
		}
	], function(err, results, message){
		finalTasks.render(err, res, 'albums', results, message, 'admin-album-list');
	});
});

/* GET a region page. */
router.get('/region/:region', function(req, res, next) {
	async.waterfall([
		function(callback){
			var keys = {region : req.params.region.split('-').join(' ')};
			dbOperations.dbFindDocumentsTask(req.db.get('album'), keys, null, callback);
		}
	], function(err, results, message){
		finalTasks.render(err, res, 'albums', results, message, 'album-list')
	});
});

/*GET new album entry page*/
router.get('/album-new', function(req, res){
	res.render('album-new');
});

/* DELETE an album */
router.get('/deleteAlbum/:id/:region/:title', function(req, res){
	async.series([
		function(callback){
			var keys = {_id : req.params.id};
			dbOperations.dbDeleteTask(req.db.get('album'), keys, callback);
		},
		function(callback){
			directoryHandler.deleteDirectoryTask('./public/images/' + req.params.region + '/' + req.params.title, callback);
		}
	], function(err){
		finalTasks.redirect(err, res, '/admin-album-list');
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
		finalTasks.redirect(err, res, '/admin-album-list');
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
		finalTasks.redirect(err, res, '/admin-album-list');
	});
});

router.get('/album-single/:title', function(req, res){
	var albums = req.db.get('album');
	var title = req.params.title.split('-').join(' ');
	albums.findOne({albumTitle:title}, function(err, doc){
		if(err){
			res.send("There was a problem finding the record: " + title);
		}else{
			res.render('album-single', {
				'album' : doc
			});
		}
	});
});

module.exports = router;
