var http = require('http');
var strftime = require ('strftime');
var random = require ('./random');

var teams = require('./teams');
var positions = require('./positions');

		
var options = {
    host: 'nflarrest.com',
    path: '/api/v1/player'
};

http.request(options, function(response) {
    var playerData = '';
    
    response.on('data', function (chunk) {
        playerData += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
        playerData = JSON.parse(playerData);
        
        // get random player name
        var randomPlayer = playerData[random.getRandomInt(0, playerData.length - 1)];
        
        console.log(randomPlayer.Name);
        
        var options = {
            host: 'nflarrest.com',
            path: '/api/v1/player/arrests/' + encodeURI(randomPlayer.Name)
        };

        http.request(options, function(response) {
            var arrestData = '';
            
            response.on('data', function (chunk) {
                arrestData += chunk;
            });

            //the whole response has been recieved, so we just print it out here
            response.on('end', function () {
                arrestData = JSON.parse(arrestData);
                
                // get random arrest record
                var randomArrest = arrestData[random.getRandomInt(0, arrestData.length - 1)];
                
                console.log(JSON.stringify(randomArrest));
                
                if(randomArrest.Date && randomPlayer.Name) {
                    
                    // TODO: format date - remove leading zeros
                    randomArrest.Date = strftime("%B %d, %Y", new Date(randomArrest.Date));
                
                    // TODO: remove unnecessary commas to prevent strange breaks
                    var speech = "On " + randomArrest.Date + ", " + randomPlayer.Name;
                    
                    if(positions[randomArrest.Position]) {
                        speech += ", a " + positions[randomArrest.Position];
                        if(!teams[randomArrest.Team]) {
                            speech += ", ";
                        }
                    }
                    if(teams[randomArrest.Team]) {
                        speech += " of the " + teams[randomArrest.Team];
                        speech += ", ";
                    }
                    speech += " was " + randomArrest.Encounter + " for " + randomArrest.Category + "... " + randomArrest.Description;
                
                }
                // res.say(speech);
                // res.card("NFL Crime", speech);
                // res.send();
                console.log(speech);
            });
        }).end();
    });
}).end();