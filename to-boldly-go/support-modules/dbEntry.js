module.exports = {
	createDBEntry: function(req){
		var entry = {};
		
		//set request field values
		var photoArray = [];
		var categoryArray = [];
		
		//build photo directory
		var photoDirectory = "/images/albums/" + req.body.albumTitle.split(' ').join('-');
		var descriptions = req.body.photoDescription;
		
		if(req.files.length > 1){	
			for(var i = 0; i < req.files.length; i++){
				photoArray.push({"photo" : photoDirectory + "/" + req.files[i].originalname, "photoDescription" : descriptions[i]});
			}
		}else{
			photoArray.push({"photo" : photoDirectory + "/" + req.files[0].originalname, "photoDescription" : descriptions});
		}
		
		if(req.body.albumCategory instanceof Array){
			for(var i = 0; i < req.body.albumCategory.length; i++){
				categoryArray.push(req.body.albumCategory[i]);
			}
		} else {
			categoryArray.push(req.body.albumCategory);
		}
		
		var entry = {
			"albumTitle" : req.body.albumTitle,
			"albumCategory" : categoryArray,
			"country" : req.body.country,
			"region" : req.body.region,
			"albumDate" : req.body.albumDate,
			"journal" : req.body.journal,
			"photos" : photoArray,
			"publishedDate" : new Date().toISOString(),
			"photoDirectory" : photoDirectory
		};
		
		return entry;
	},
	
	createDBEditEntry: function(req){
		var entry = {};
		
		//set request field values
		var photoArray = [];
		var categoryArray = [];
		
		//build photo directory
		var photoDirectory = "/images/albums/" + req.body.albumTitle.split(' ').join('-');
		
		//set photo location and description
		var checkboxArray = [];
		var descriptionArray = [];
		//assign checkbox values
		if(req.body.keepPhoto instanceof Array){
			for(var i = 0; i < req.body.keepPhoto.length; i++){
				checkboxArray.push(req.body.keepPhoto[i]);
			}
		} else {
			checkboxArray.push(req.body.keepPhoto);
		}
		//assign descriptions to the descriptionArray
		if(req.body.photoDescription instanceof Array){
			for(var i = 0; i < req.body.photoDescription.length; i++){
				descriptionArray.push(req.body.photoDescription[i]);
			}
		} else {
			descriptionArray.push(req.body.photoDescription);
		}
		//assign old photo name values
		var descArrayIndex = 0;
		if(req.body.currentPhoto instanceof Array){
			for(var i = 0; i < req.body.currentPhoto.length; i++){
				photoArray.push({"photo" : photoDirectory + "/" + req.body.currentPhoto[i], "photoDescription" : descriptionArray[descArrayIndex]});
				descArrayIndex++;
			}
		} else {
			photoArray.push({"photo" : photoDirectory + "/" + req.body.currentPhoto, "photoDescription" : descriptionArray[descArrayIndex]});
		}	
		//replace old photo with new photo from file array by comparing the checkbox values
		if(req.files.length){
			index = 0;
			for(var i = 0; i < checkboxArray.length; i++){
				if(checkboxArray[i] == 0){
					//replace the current photo with file photo
					photoArray[i] = {"photo" : photoDirectory + "/" + req.files[index].originalname, "photoDescription" : descriptionArray[i]}
					index++;
				}
			}
			//append newly uploaded photos if there are any
			if(req.files.length > index){
				for(var i = index; i < req.files.length; i++){
					photoArray.push({"photo" : photoDirectory + "/" + req.files[i].originalname, "photoDescription" : descriptionArray[descArrayIndex]});
					descArrayIndex++;
				}
			}
		}
		
		if(req.body.albumCategory instanceof Array){
			for(var i = 0; i < req.body.albumCategory.length; i++){
				categoryArray.push(req.body.albumCategory[i]);
			}
		} else {
			categoryArray.push(req.body.albumCategory);
		}
		
		var entry = {
			"albumTitle" : req.body.albumTitle,
			"albumCategory" : categoryArray,
			"country" : req.body.country,
			"region" : req.body.region,
			"albumDate" : req.body.albumDate,
			"journal" : req.body.journal,
			"photos" : photoArray,
			"publishedDate" : new Date().toISOString(),
			"photoDirectory" : photoDirectory
		};
		
		return entry;
	},
	
	createTagEntry: function(req, region){
		var entry;
		if(region){
			entry = {
				"name" : req.body.name,
				"countries" : []
			};
		}else{
			 entry = {
				"name" : req.body.name
			};
		}	
		return entry;
	}
}