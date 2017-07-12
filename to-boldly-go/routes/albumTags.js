var express = require('express');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var multer = require('multer');
var fs = require('fs');
var async = require('async');
var router = express.Router();

//var upload = getMulterUploadInstance('./public/images/tagPhotos/');

router.get('/', function(req, res, net) {
	
	res.render('album-tags-list', {title:'Tags'});
	/*async.waterfall([
		function(callback){
			var options = {sort : {publishedDate : -1}};
			dbFindAlbumsTask(req.db.get('album'), null, options, callback);
		}
	], function(err, results, message){
		finalTaskRender(err, res, results, message, 'index');
	});*/
});

module.exports = router;