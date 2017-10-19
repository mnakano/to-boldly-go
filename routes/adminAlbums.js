var express = require('express');
var async = require('async');
var router = express.Router();
var dirTask = require('../support-modules/dirTask');
var multiFormTask = require('../support-modules/multiFormTask');
var dbTask = require('../support-modules/dbTask');
var dbEntry = require('../support-modules/dbEntry');
var finalTask = require('../support-modules/finalTask');

var upload = multiFormTask.getUploadInstance('./public/images/tmp/');

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
			dbTask.findMany('album', null, options, callback);
		}
	], function(err, results, message){
		finalTask.render(err, res, 'albums', results, message, 'admin-album-list');
	});
});

/*GET new album entry page*/
router.get('/newAlbum', isAuthenticated, function(req, res){
	res.render('album-new');
});

router.get('/deleteAlbum/:id/:title', isAuthenticated, function(req, res){
	async.series([
		function(callback){
			var keys = {_id : req.params.id};
			dbTask.deleteDoc('album', keys, callback);
		},
		function(callback){
			dirTask.deleteDir('./public/images/albums/' + req.params.title, callback);
		}
	], function(err){
		finalTask.redirect(err, res, '/adminAlbums');
	});
});

/*POST to Add Album Service*/
router.post('/addAlbum', isAuthenticated, upload.array('photo'), function(req, res){
	//set request values and return a DB entry.
	var newEntry = dbEntry.createDBEntry(req);
	
	//handle directory creation and photo relocation in series.
	async.series([
		function(callback){
			dirTask.createDir('./public' + newEntry.photoDirectory, callback);
		},
		function(callback){
			dirTask.movePhotos(req.files[0].destination + '/', './public' + newEntry.photoDirectory + "/", req.files, callback);
		},
		function(callback){
			dbTask.insert('album', newEntry, callback);
		}
	], function(err){
		finalTask.redirect(err, res, '/adminAlbums');
	});
});

/*GET an album data to edit form*/
router.get('/editAlbum/:id', isAuthenticated, function(req, res){
	async.waterfall([
		function(callback){
			dbTask.findOne('album', {_id : req.params.id}, null, callback);
		}
	], function(err, result, message){
		finalTask.renderSingle(err, res, result, message, 'album-edit-form');
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
				var albumFolder = req.body.albumTitleOld.split(' ').join('-');
				var photoDirectoryOld = "/images/albums/" + albumFolder;
				dirTask.renameDir('./public' + photoDirectoryOld , './public' + updatedEntry.photoDirectory, callback);
			} else {
				callback();
			}
		},
		function(callback){
			var photos = [];
			for(var i = 0; i < updatedEntry.photos.length; i++){
				photos.push(updatedEntry.photos[i].photo.split("/").slice(-1)[0]);
			}
			dirTask.deleteRemovedPhotos('./public' + updatedEntry.photoDirectory + "/", photos, callback);
		},
		function(callback){
			if(req.files.length){
				dirTask.movePhotos(req.files[0].destination + "/", './public' + updatedEntry.photoDirectory + "/", req.files, callback);
			} else {
				callback();
			}
		},
		function(callback){
			dbTask.update('album', {_id:req.params.id}, {$set:updatedEntry}, callback);
		}
	], function(err){
		finalTask.redirect(err, res, '/adminAlbums');
	});
});

module.exports = router;