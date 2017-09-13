var express = require('express');
var async = require('async');
var router = express.Router();
var directoryHandler = require('../support-modules/directoryHandler');
var multiFormHandler = require('../support-modules/multiFormHandler');
var dbOperations = require('../support-modules/dbOperations');
var dbEntry = require('../support-modules/dbEntry');
var finalTasks = require('../support-modules/finalTasks');

var upload = multiFormHandler.getUploadInstance('./public/images/tmp/');

var isAuthenticated = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}

router.get('/', isAuthenticated, function(req, res){
	async.waterfall([
		function(callback){
			var options = {sort : {albumTitle : 1}};
			dbOperations.dbFindDocumentsTask(req.db.get('album'), null, options, callback);
		}
	], function(err, results, message){
		finalTasks.render(err, res, 'albums', results, message, 'admin-album-list');
	});
});

/*GET new album entry page*/
router.get('/newAlbum', isAuthenticated, function(req, res){
	res.render('album-new');
});

router.get('/deleteAlbum/:id/:region/:title', isAuthenticated, function(req, res){
	async.series([
		function(callback){
			var keys = {_id : req.params.id};
			dbOperations.dbDeleteTask(req.db.get('album'), keys, callback);
		},
		function(callback){
			directoryHandler.deleteDirectoryTask('./public/images/' + req.params.region + '/' + req.params.title, callback);
		}
	], function(err){
		finalTasks.redirect(err, res, '/adminAlbums');
	});
});

/*POST to Add Album Service*/
router.post('/addAlbum', isAuthenticated, upload.array('photo'), function(req, res){
	
	//set request values and return a DB entry.
	var newEntry = dbEntry.createDBEntry(req);
	
	//handle directory creation and photo relocation in series.
	async.series([
		function(callback){
			directoryHandler.createDirectoryTask('./public' + newEntry.photoDirectory, callback);
		},
		function(callback){
			directoryHandler.movePhotosTask(req.files[0].destination + '/', './public' + newEntry.photoDirectory + "/", req.files, callback);
		},
		function(callback){
			dbOperations.dbInsertTask(req.db.get('album'), newEntry, callback);
		}
	], function(err){
		finalTasks.redirect(err, res, '/adminAlbums');
	});
});

/*GET an album data to edit form*/
router.get('/editAlbumForm/:id', isAuthenticated, function(req, res){
	var db = req.db;
	var albums = db.get('album');
	albums.findOne({_id:req.params.id}, function(err, doc){
		if(err){
			res.send("There was a problem finding the record.");
		}else{
			res.render('album-edit-form', {
				'album' : doc
			});
		}
	});
});

/*UPDATE an album data*/
router.post('/editAlbum/:id', isAuthenticated, upload.array('photo'), function(req, res){
	
	//set request values and return a DB entry.
	var updatedEntry;

	//handle directory and photo updates.
	async.series([
		function(callback){
			updatedEntry = dbEntry.createDBEditEntry(req);
			callback();
		},
		function(callback){
			if(req.body.albumTitle != req.body.albumTitleOld){
				var regionFolder = req.body.region.split(' ').join('-');
				var albumFolder = req.body.albumTitleOld.split(' ').join('-');
				var photoDirectoryOld = "/images/" + regionFolder + "/" + albumFolder;
				directoryHandler.renameDirectoryTask('./public' + photoDirectoryOld , './public' + updatedEntry.photoDirectory, callback);
			} else {
				callback();
			}
		},
		function(callback){
			var photos = [];
			for(var i = 0; i < updatedEntry.photos.length; i++){
				photos.push(updatedEntry.photos[i].photo.split("/").slice(-1)[0]);
			}
			directoryHandler.deleteRemovedPhotosTask('./public' + updatedEntry.photoDirectory + "/", photos, callback);
		},
		function(callback){
			if(req.files.length){
				directoryHandler.movePhotosTask(req.files[0].destination + "/", './public' + updatedEntry.photoDirectory + "/", req.files, callback);
			} else {
				callback();
			}
		},
		function(callback){
			dbOperations.dbUpdateTask(req.db.get('album'), {_id:req.params.id}, {$set:updatedEntry}, callback);
		}
	], function(err){
		finalTasks.redirect(err, res, '/adminAlbums');
	});
});

module.exports = router;