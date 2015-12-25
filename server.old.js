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

app.listen(process.env.PORT || 3000);