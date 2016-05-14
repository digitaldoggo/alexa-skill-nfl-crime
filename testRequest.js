var http = require('http');
var strftime = require ('strftime');
var random = require ('./random');

var teams = require('./teams');
var positions = require('./positions');

		
var options = {
    host: 'nflarrest.com',
    path: '/api/v1/team'
};

http.request(options, function(response) {
    var teamData = '';
    
    response.on('data', function (chunk) {
        teamData += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
        teamData = JSON.parse(teamData);
        
        teamData.forEach(function(element) {
            if(typeof teams[element.Team] === 'undefined') {
                console.log(element.Team);
            }
        }, this);

        
    });
}).end();