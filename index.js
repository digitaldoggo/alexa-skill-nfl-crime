var alexa = require('alexa-app');
var http = require('http');
var strftime = require ('strftime');
var random = require ('./random');

var teams = require('./teams');
var positions = require('./positions');

// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;

// Define an alexa-app
var app = new alexa.app('football-crime');

app.messages.NO_INTENT_FOUND = "Sorry, I didn't understand the request.";

app.launch(function(req,res) {
	var prompt = "Would you like to get a random NFL player crime fact?";
	res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.pre = function(request,response,type) {
	var intent;
	if (request.data &&
		request.data.request &&
		request.data.request.intent) {
		intent = request.data.request.intent.name;
	}
	
	console.log("Pre method reached with type: " + type + " and intent: " + intent);
	
    if (request.sessionDetails.application.applicationId!="amzn1.echo-sdk-ams.app.4a97dc92-2470-4080-a7bb-2667f3eb84f2") {
        // Fail ungracefully
        response.fail("Invalid applicationId");
    }
};

app.post = function(request,response,type,exception) {
	console.log("Post method reached");
	
    // Always turn an exception into a successful response
	if(exception != null) {
    	response.clear().say("An error occurred: "+exception).send();
	}
};

app.error = function(exception, request, response) {
	console.log("Error encountered");
	console.log(exception);
    response.say("Sorry, an error occurred.");
};

app.intent('AMAZON.HelpIntent',{}, function(request, response) {
	var prompt = "I can provide you with random NFL player crime facts. You can say, ask Football Crime for a random crime fact. Would you like to get a random NFL player crime fact?";
	var reprompt = "Would you like to get a random NFL player crime fact?";
	response.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
});

app.intent('AMAZON.NoIntent',{}, function(request, response) {
	response.send();
});

app.intent('AMAZON.YesIntent',{}, function(req, res) {
	console.log("AMAZON.YesIntent entered");
	
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
						
						var dateToFormat = new Date(randomArrest.Date);
						var day = dateToFormat.getDate(); // prevent leading zero
						randomArrest.Date = strftime("%B " + day +", %Y", dateToFormat);
					
						// TODO: remove unnecessary commas to prevent strange breaks
						var speech = "On " + randomArrest.Date + ", " + randomPlayer.Name;
						
						if(positions[randomArrest.Position]) {
							if(randomArrest.Team === "free") {
								speech += ", a free agent " + positions[randomArrest.Position];
								speech += ", ";
							}
							else {
								speech += ", a " + positions[randomArrest.Position];
								if(!teams[randomArrest.Team]) {
									speech += ", ";
								}
							}
							
						}
						if(teams[randomArrest.Team]) {
							speech += " of the " + teams[randomArrest.Team];
							speech += ", ";
						}
						speech += " was " + randomArrest.Encounter + " for " + randomArrest.Category;
						if(randomArrest.Description) {
							speech += "... " + randomArrest.Description;
						}
						else {
							speech += ".";
						}
					
					}
					res.say(speech);
					res.card("Random Crime Record", speech);
					res.send();
				});
			}).end();
		});
	}).end();
	
	return false;
});

app.intent('RandomCrimeIntent',{
		"slots": {}
		,"utterances":[
			"{for|to get} a {random crime|crime}",
			"to tell me a {random crime|crime}"
		]
	},
	function(req, res) {
		console.log("RandomCrimeIntent entered");
		
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
							
							var dateToFormat = new Date(randomArrest.Date);
							var day = dateToFormat.getDate(); // prevent leading zero
							randomArrest.Date = strftime("%B " + day +", %Y", dateToFormat);
						
							// TODO: remove unnecessary commas to prevent strange breaks
							var speech = "On " + randomArrest.Date + ", " + randomPlayer.Name;
							
							if(positions[randomArrest.Position]) {
								if(randomArrest.Team === "free") {
									speech += ", a free agent " + positions[randomArrest.Position];
									speech += ", ";
								}
								else {
									speech += ", a " + positions[randomArrest.Position];
									if(!teams[randomArrest.Team]) {
										speech += ", ";
									}
								}
								
							}
							if(teams[randomArrest.Team]) {
								speech += " of the " + teams[randomArrest.Team];
								speech += ", ";
							}
							speech += " was " + randomArrest.Encounter + " for " + randomArrest.Category;
							if(randomArrest.Description) {
								speech += "... " + randomArrest.Description;
							}
							else {
								speech += ".";
							}
						
						}
						res.say(speech);
						res.card("Random Crime Record", speech);
						res.send();
					});
				}).end();
			});
		}).end();
		
		return false;
	}
);

// Use for deploying to AWS Lambda
module.exports.handler = app.lambda();

// Use for local testing
//module.exports = app;