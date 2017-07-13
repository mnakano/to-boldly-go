module.exports = {

	redirect: function(err, res, redirectRoute){
		if(err){
			console.log('An error occurred: ' + err);
		}
		console.log('All tasks successful.');
		res.redirect(redirectRoute);
	},

	render: function(err, res, collectionName, results, message, renderedPage){
		if(err){
			console.log('An error occurred: ' + err);
		}
		
		console.log('All tasks successful.');

		res.render(renderedPage, {
			'albums' : results,
			'message' : message
		});
	}
}