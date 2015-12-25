var express = require('express'),
	app = express(),
	helper = require('./helper'),
	sendFile = helper.sendFile;

// use api - REST
app.get('/api/*', function(req, res){
	res.send('api');
});

// send file
app.get('*', sendFile);

// Handle 404 - implemented by helper
/*
app.use(function(req, res) {
	res.send('404: Page not Found', 404);
});
*/

// Handle 500
app.use(function(error, req, res, next) {
	res.send('500: Internal Server Error', 500);
});

app.listen(process.env.PORT || 3000);