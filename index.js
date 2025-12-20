/*

index.js

Server-side javascript hosting engine

4.13.23
*/

//------------------------------------------------------------------------------------//
//NPM Imports

const express = require('express');

const app = express();

const fs = require('fs');

const http = require('http').Server(app);

const io = require('socket.io')(http);

const path = require('path');

//------------------------------------------------------------------------------------//
//Local Imports

//Get function exports from crosswordCreator.js
const cc = require('./serverFiles/crosswordCreator.js');

//Load leaderboard
let leaderboard = require('./serverFiles/leaderboard.json');

//Load backup of database dictionary in event of server crash / shutdown
let database = require("./serverFiles/database.json");


//------------------------------------------------------------------------------------//
//Variables

//Usable color strings
const colors = ["red", "green", "yellow", "pink", "white", "orange", "cyan"];

//Number of users currently connected to the server
let connections = 0;

//Dictionary describing the room that every client is in
let clientRooms = {};

//Dictionary linking client socket-id to their username
let clientUsernames = {};

//Load backup of roomData dictionary in event of server crash / shutdown
let roomData = {};

//------------------------------------------------------------------------------------//
//Functions

//deletes a array element at specified index
function del(array, index) {
	return array.splice(index, 1);
};

//returns a random integer between min and max (inclusive), if max is not defined then it is 0 - min
function randint(min, max = "none") {
	if (max === "none") {
		max = min;
		min = 0;
	}
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

//Saves JSON data to selected file
function save(data, file = "database") {
	let saveData = JSON.stringify(data);
	fs.writeFile("./serverFiles/" + file + ".json", saveData, (err) => {
		if (err) {
			console.log(err)
		}
	});
};

//Creates new user object with a set password
function createUser(password) {
	return {
		"password": password,
		"wins": 0,
		"games": 0,
		"highScore": 0,
		"developer": false
	};
};

//Initalizes a server object with set password
function createServer(host, password) {
	return {
		"password": password,
		"users": [],
		"crosswordData": [],
		"hitboxes": [],
		"host": host,
		"highlightedTiles": {},
		"usedColors": ["blue"],
	}
};

//Send a update to one or all clients containing the server list
function serverListUpdate(socket, client) {
	let keys = Object.keys(roomData);
	let tempDictionary = {};
	for (let i = 0; i < keys.length; i++) {
		tempDictionary[keys[i]] = roomData[keys[i]]["users"];
	}
	if (!(Object.keys(tempDictionary).length > 0)) {
		if (client === "one") { socket.emit("error", "noServers"); }
		if (client === "all") { io.emit("error", "noServers"); }
	}
	if (client === "one") { socket.emit("serverNames", tempDictionary); }
	if (client === "all") { io.emit("serverNames", tempDictionary); }
};

//Takes in new crossword data and hitboxes and only overwrites select things to avoid overwrite errors
function updateCrosswordData(roomName, crosswordData, hitboxes) {
	for (let rowIndex = 0; rowIndex < crosswordData.length; rowIndex++) {
		for (let columnIndex = 0; columnIndex < crosswordData.length; columnIndex++) {
			if (crosswordData[rowIndex][columnIndex][0] !== roomData[roomName]["crosswordData"][rowIndex][columnIndex][0]) {
				if (roomData[roomName]["crosswordData"][rowIndex][columnIndex][0] === "-") {
					roomData[roomName]["crosswordData"][rowIndex][columnIndex] = crosswordData[rowIndex][columnIndex];
				}
			}
		}
	}
	for (let hitboxIndex = 0; hitboxIndex < hitboxes.length; hitboxIndex++) {
		if (hitboxes[hitboxIndex][5] !== roomData[roomName]["hitboxes"][hitboxIndex][5]) {
			if (roomData[roomName]["hitboxes"][hitboxIndex][5] === false) {
				roomData[roomName]["hitboxes"][hitboxIndex][5] = true;
			}
		}
	}
};

//Send a update to EVERYONE in the room, (socket io is stupid and doesn't send it to the client makeing the request)
function roomEmit(roomName, socket, event, data) {
	socket.to(roomName).emit(event, data);
	socket.emit(event, data);
};

//Updates leaderboard
function updateLeaderboard(user, score, updateType) {
	//If the user is a guest don't do anything
	if (user === "guest") { return; }

	//update type will always be score, this is here to allow for additional scored gamemodes to be added
	if (updateType === "score") {
		//Set score and sort leaderboard
		//If the user isn't in the leaderboard or the score is higher than their previously recorded score
		if (typeof leaderboard[updateType][user] === "undefined" || score > leaderboard[updateType][user]) {
			//If the user's name is not undefined
			if (leaderboard[updateType]["order"].indexOf(user) !== -1) {
				//delete the user from the order array
				del(leaderboard[updateType]["order"], leaderboard[updateType]["order"].indexOf(user));
			}

			let added = false;
			//for every user in order
			for (let i = 0; i < leaderboard[updateType]["order"].length; i++) {
				//If the score is larger than the score at that order index
				if (score >= leaderboard[updateType][leaderboard[updateType]["order"][i]]) {
					//Put the user's name one index ahead of the score that it was larger than
					leaderboard[updateType]["order"].splice(i, 0, user);
					//the score has been added
					added = true;
					//don't keep looking and end the loop
					break;
				}
			}
			//If the user was not added in the loop
			if (!added) {
				//Put the user at the end of order
				leaderboard[updateType]["order"].push(user);
			}
			//If the length of order is 0 meaning that the loop didn't run
			if (leaderboard[updateType]["order"].length === 0) {
				//Put the user at the end of order
				leaderboard[updateType]["order"].push(user);
			}
			//Assign the user's score value to the larger value
			leaderboard[updateType][user] = score;
			//Save the leaderboard to the leaderboard JSON file
			save(leaderboard, "leaderboard");
		}
	}
};

//------------------------------------------------------------------------------------//
//App Commands

//Mark clientFiles folder as static so it can be accessed by the client
app.use(express.static(path.join(__dirname, 'clientFiles')));

//Send user index.html when they load the url
app.get('/', function(req, res) {
	//__dirname is the name of the current directory
	res.sendFile(__dirname + '/clientFiles/index.html');
});

//------------------------------------------------------------------------------------//
//User event listener

//On a client connection
io.on('connection', (socket) => {
	//Print current connections
	connections = io.engine.clientsCount;
	console.log("\nConnected Users: " + connections.toString());

	//Set up event listeners -------------

	//On username transmission
	socket.on("username", (username) => {
		//Link username to socket id
		clientUsernames[socket.id] = username;
	});

	//On user requested crossword generation
	socket.on("generateCrossword", async function(spawnData) {
		//Unpack data
		let wordLength = spawnData[0];
		let wordCount = spawnData[1];
		//run the crossword generation, it has the await because it was returning an empty promise even while the funtion was not async
		data = await cc.generateCrossword(wordLength, wordCount);
		//Log the crossword generation stats
		console.log("Sending Crossword with " + data[1].length.toString() + " Words\n");
		//Send the user the output of generate crossword
		socket.emit("crosswordData", data);
	});

	//On user requested log
	socket.on("log", (message) => { console.log(message); });

	//On user requested word list
	socket.on("wordList", () => {
		//Read the large word list file
		let allWords = fs.readFileSync("./serverFiles/largeAllWords.txt").toString('utf-8');
		//Split the file for the user
		allWords = allWords.split("\r\n");
		//Send the user the split file so they know what words exist
		socket.emit("wordList", allWords);
	});

	//When user wants to login
	socket.on("login", (loginInfo) => {
		//Unpack data
		let username = loginInfo[0];
		let password = loginInfo[1];
		//Check to see if username exists, then check to see if the password matches, if it password doesn't match or the username doesn't exist fail
		if (!(username in database)) {
			socket.emit("error", "usernameUndefined");
		} else if (database[username]["password"] === password) {
			//the password was correct
			//load the user database
			let userDatabase = { ...database[username] };
			//delete the password from it
			delete userDatabase["password"];
			console.log(username + " Logged In");
			//send the user their database
			socket.emit("loggedIn", userDatabase);
		} else {
			socket.emit("error", "incorrectPassword");
		}
	});

	//When user wants to make an account
	socket.on("createAccount", (accountInfo) => {
		//Unpack data
		let newUsername = accountInfo[0];
		let newPassword = accountInfo[1];
		//If the username is in the database
		if (newUsername in database) {
			socket.emit("error", "usernameInUse");
		} else {
			//The username is not taken
			//Create a new user account
			database[newUsername] = createUser(newPassword);
			//Save the database to the database JSON
			save(database);
			//Load the user's new database
			let userDatabase = { ...database[newUsername] };
			//Delete the password from it
			delete userDatabase["password"];
			//Log the account creation
			console.log(newUsername + " Created an Account");
			//Send the user their database
			socket.emit("accountCreated", userDatabase);
		}
	});

	//When the user has won a game
	socket.on("userWin", (username) => {
		//Incriment the user's win count
		database[username]["wins"]++;
		//Save the database to the database JSON
		save(database);
	});

	//When the user has started a game
	socket.on("gameStarted", (username) => {
		//
		database[username]["games"]++;
		save(database);
	});

	//When user score update has been recieved
	socket.on("updateScore", (data) => {
		let username = data[0];
		let score = data[1];
		if (database[username]["highScore"] < score) {
			database[username]["highScore"] = score;
			save(database);
			updateLeaderboard(username, score, "score");
			socket.emit("leaderboardData", leaderboard);
		}
	});

	//When the user has requested a update to their client-side database
	socket.on("updateDatabase", (username) => {
		let userDatabase = { ...database[username] };
		userDatabase["password"] = null;
		socket.emit("databaseUpdate", userDatabase);
	});

	//When the user wants to host a private server
	socket.on("privateHost", (data) => {
		let username = data[0];
		let serverName = data[1];
		let serverPassword = data[2];
		if (!(serverName in roomData)) {
			roomData[serverName] = createServer(username, serverPassword);
			roomData[serverName]["users"].push(username);
			roomData[serverName]["host"] = username;
			save(roomData, "roomData");
			clientRooms[socket.id] = serverName;
			socket.join(serverName);
			serverListUpdate(socket, "all");
			socket.emit("joinedRoom", [serverName, "blue"]);
			socket.emit("roomDataUpdate", roomData[serverName]);
		}
	});

	//When user wants to request a crossword generation for their room
	socket.on("generateRoomCrossword", async function(generationData) {
		// let wordLength = spawnData[0];
		// let wordCount = spawnData[1];
		// data = await cc.generateCrossword(wordLength, wordCount);
		// console.log("Sending Crossword with " + data[1].length.toString() + " Words\n");
		// socket.emit("crosswordData", data);
		let roomName = generationData[0];
		let wordLength = generationData[1];
		let wordCount = generationData[2];
		socket.to(roomName).emit("generatingRoomCrossword", null);
		data = await cc.generateCrossword(wordLength, wordCount);
		console.log("Sending Crossword with " + data[1].length.toString() + " Words to Room: " + roomName + "\n");
		roomData[roomName]["crosswordData"] = data[0];
		roomData[roomName]["hitboxes"] = data[1];
		save(roomData, "roomData");
		roomEmit(roomName, socket, "crosswordData", data);
		socket.emit("crosswordData", data);
	});

	//When user requests update to their data (crosswordData)
	socket.on("requestGameData", (roomName) => {
		socket.emit("crosswordData", [roomData[roomName]["crosswordData"], roomData[roomName]["hitboxes"]]);
	});

	//When user wants to update their room's crossword data
	socket.on("updateGameData", (data) => {
		let roomName = data[0];
		let crosswordData = data[1];
		let hitboxes = data[2];
		let update = data[3];
		updateCrosswordData(roomName, crosswordData, hitboxes);
		if (update) {
			roomEmit(roomName, socket, "crosswordData", [roomData[roomName]["crosswordData"], roomData[roomName]["hitboxes"]]);
		}
	});

	//When user wants to request a update to all of the room data
	socket.on("requestRoomData", (roomName) => {
		socket.emit("roomDataUpdate", roomData[roomName]);
	});

	//When user wants to disconnect from a room
	socket.on("leaveRoom", () => {
		let roomName = clientRooms[socket.id];
		//Leave the socket room
		socket.leave(roomName);
		delete clientRooms[socket.id]
		del(roomData[roomName]["users"], roomData[roomName]["users"].indexOf(clientUsernames[socket.id]));
		save(roomData, "roomData");
		roomEmit(roomName, socket, "roomDataUpdate", roomData[roomName]);
		if (roomData[room]["users"].length === 0) {
			delete roomData[room];
			serverListUpdate(socket, "all");
		}
	});

	//When user wants to join a room
	socket.on("joinRoom", (data) => {
		//Unpack data
		let username = data[0];
		let roomName = data[1];
		let roomPassword = data[2];
		if (roomPassword == roomData[roomName]["password"]) {
			clientRooms[socket.id] = roomName;
			//Join the socket room
			socket.join(roomName);
			//Update database to reflect the new room
			roomData[roomName]["users"].push(username);
			let assignedColor = "blue";
			while (roomData[roomName]["usedColors"].includes(assignedColor)) {
				assignedColor = colors[randint(colors.length - 1)];
			}
			roomData[roomName]["usedColors"].push(assignedColor);
			save(roomData, "roomData");
			socket.emit("joinedRoom", [roomName, assignedColor]);
			roomEmit(roomName, socket, "roomDataUpdate", roomData[roomName]);
		} else {
			socket.emit("error", "incorrectPassword");
		}

	});

	//When user wants to see all of the rooms
	socket.on("requestServerNames", () => {
		serverListUpdate(socket, "one");
	});

	//When user has a addition to the highlighted spaces
	socket.on("hitboxSelected", (data) => {
		let roomName = data[0];
		let selectedHitbox = data[1];
		let color = data[2];
		roomData[roomName]["highlightedTiles"][socket.id] = [...selectedHitbox, color];
		save(roomData, "roomData");
		roomEmit(roomName, socket, "highlightUpdate", roomData[roomName]["highlightedTiles"]);
	});

	//When user has deselected a hitbox
	socket.on("hitboxDeselected", (serverName) => {
		delete roomData[serverName]["highlightedTiles"][socket.id];
		save(roomData, "roomData");
		roomEmit(serverName, socket, "highlightUpdate", roomData[serverName]["highlightedTiles"]);

	});

	//When user has a change to a hitbox
	socket.on("hitboxUpdate", (data) => {
		let roomName = data[0];
		del(data, 0);
		socket.to(roomName).emit("hitboxUpdate", data);
	});

	//When client requests a leaderboard data update
	socket.on("requestLeaderboardData", () => {
		socket.emit("leaderboardData", leaderboard);
	});

	//When a user has disconnected
	socket.on('disconnect', () => {
		connections = io.engine.clientsCount;
		console.log("\nConnected Users: " + connections.toString());
		let room = clientRooms[socket.id];
		if (roomData[room] !== undefined) {
			del(roomData[room]["users"], roomData[room]["users"].indexOf(clientUsernames[socket.id]));
			if (roomData[room]["users"].length === 0) {
				delete roomData[room];
				save(roomData, "roomData");
				serverListUpdate(socket, "all");
			}
		}
		if (socket.id in clientRooms) { delete clientRooms[socket.id]; }
	});
});

//------------------------------------------------------------------------------------//
//Host server on port 8000

http.listen(8000, () => {
	console.log('Server Started');
});

//Wait 5 seconds to tell the clients that the server died (allow for them to reconnect to the server)
setTimeout(() => {
	io.emit("error", "serverDied");
}, 5000);

setInterval(() => {
	connections = io.engine.clientsCount;
	console.log("\nConnected Users: " + connections.toString());
}, 10000);

save(roomData, "roomData");