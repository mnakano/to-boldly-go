var async = require('async');
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

aws.config.region = 'us-east-1';
var s3 = new aws.S3({
	apiVersion: '2006-03-01',
	accessKeyId:process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
});

function copyObject(oldPath, newPath, file, cb){
	var copyParams = {Bucket:BUCKET_NAME, CopySource:BUCKET_NAME + '/' + file.Key, Key:file.Key.replace(oldPath, newPath), ACL:'public-read'};
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
		console.log('Files deleted.');
	})
}

module.exports = {
	
	movePhotos: function(oldPath, newPath, callback){
		var listParams = {Bucket:BUCKET_NAME, Delimiter:'/', Prefix:oldPath};
		s3.listObjects(listParams, function(err, data){
			if(err){
				callback(err);
			}
			if(data.Contents.length){
				//Build the parameters for the objects to be deleted from tmp folder after copying.
				var deleteParams = {Bucket:BUCKET_NAME, Delete:{Objects:[]}};
				data.Contents.forEach(function(content){
					deleteParams.Delete.Objects.push({Key:content.Key});
				});
				
				async.each(data.Contents, function(file, cb){
					copyObject(oldPath, newPath, file, cb);
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
	
	deletePhoto: function(objectPath, callback){
		var deleteParams = {Bucket:BUCKET_NAME, Delete:{Objects:[{Key:objectPath}]}};
		deleteObjects(deleteParams);
		callback();
	},
	
	deletePhotos: function(deletePath, callback){
		var listParams = {Bucket:BUCKET_NAME, Delimiter:'/', Prefix:deletePath};
		s3.listObjects(listParams, function(err, data){
			if(err){
				callback(err);
			}
			if(data.Contents.length){
				var deleteParams = {Bucket:BUCKET_NAME, Delete:{Objects:[]}};
				data.Contents.forEach(function(content){
					deleteParams.Delete.Objects.push({Key:content.Key});
				});
				deleteObjects(deleteParams);
			}
		});
		callback();
	},
	
	deleteRemovedPhotos: function(deletePath, photos, callback){
		var listParams = {Bucket:BUCKET_NAME, Delimiter:'/', Prefix:deletePath};
		s3.listObjects(listParams, function(err, data){
			if(err){
				callback(err);
			}
			if(data.Contents.length){
				var deleteParams = {Bucket:BUCKET_NAME, Delete:{Objects:[]}};
				for(var i = 0; i < data.Contents.length; i++){
					if(photos.indexOf(data.Contents[i].Key) < 0){
						deleteParams.Delete.Objects.push({Key:data.Contents[i].Key});
					}
				}
				if(deleteParams.Delete.Objects.length){
					deleteObjects(deleteParams);
				}	
			}
		});
		callback();
	},
	
	getUploadInstance: function(prefix){
		return multer({
			storage: multerS3({
				s3:s3,
				bucket:BUCKET_NAME,
				key:function(req, file, cb){
					cb(null, prefix + file.originalname);
				},
				acl:'public-read'
			})
		});
	}
}