var async = require('async');
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');

aws.config.region = 'us-east-1';
var s3 = new aws.S3({
	apiVersion: '2006-03-01',
	accessKeyId:'',
	secretAccessKey:''	
});

function copyObject(bucketName, oldPath, newPath, file, cb){
	var copyParams = {Bucket:bucketName, CopySource:bucketName + '/' + file.Key, Key:file.Key.replace(oldPath, newPath), ACL:'public-read'};
	s3.copyObject(copyParams, function(copyErr, copyData){
		if(copyErr){
			console.log(copyErr);
		}else{
			console.log('Copied: ', copyParams.Key);
		}
		cb();
	});
}

function deleteObjects(deleteParams){
	s3.deleteObjects(deleteParams, function(deleteError, deleteData){
		if(deleteError){
			console.log(deleteError);
		}
		console.log('Copied files deleted.');
	})
}

module.exports = {
	
	bucketName:'toboldlygo-assets',
	
	tmpPrexix:'tmp/',
	
	movePhotos: function(bucketName, oldPath, newPath, callback){
		var listParams = {Bucket:bucketName, Delimiter:'/', Prefix:oldPath};
		s3.listObjects(listParams, function(err, data){
			if(err){
				callback(err);
			}
			if(data.Contents.length){
				//Build the parameters for the objects to be deleted from tmp folder after copying.
				var deleteParams = {Bucket:bucketName, Delete:{Objects:[]}};
				data.Contents.forEach(function(content){
					deleteParams.Delete.Objects.push({Key:content.Key});
				});
				
				async.each(data.Contents, function(file, cb){
					copyObject(bucketName, oldPath, newPath, file, cb);
				}, function(err){
					if(err){
						console.log(err);
					}else{
						deleteObjects(deleteParams);
					}	
				});
			}
		});
		callback();
	},
	
	getUploadInstance: function(destinationPath){
		return multer({
			storage: multerS3({
				s3:s3,
				bucket:'toboldlygo-assets',
				key:function(req, file, cb){
					cb(null, destinationPath + file.originalname);
				}
			})
		});
	}
}