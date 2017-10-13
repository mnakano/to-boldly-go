module.exports = {

	redirect: function(err, res, redirectRoute){
		if(err){
			console.log('An error occurred: ' + err);
		}
		console.log('All tasks successful.');
		res.redirect(redirectRoute);
	},

	render: function(err, res, tagName, results, message, renderedPage, search){
		if(err){
			console.log('An error occurred: ' + err);
		}
		
		console.log('All tasks successful.');

		res.render(renderedPage, {
			'albums' : results,
			'tagName' : tagName,
			'message' : message,
			'search' : search
		});
	},
	
	renderSingle: function(err, res, result, message, renderedPage){
		if(err){
			console.log('An error occurred: ' + err);
		}
		console.log('all successful: ' + result);
		res.render(renderedPage, {
			'album' : result,
			'message' : message
		});
	}
}