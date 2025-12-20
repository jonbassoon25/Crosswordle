/*
Created by Jonathan Hanson and Zac Young

client.js

Client side javascript program for crosswordle

4.28.23
*/

//Page Link: https://crosswordle.jonbassoon25.repl.co || crosswordle.space

//To kick random users to google
//window.location.replace("http://www.google.com");

//Initalize the server communication handler
const socket = io();
//initalize canvas
const canvas = document.getElementById("gameScreen");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

//Vars needed for loading assets
const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
let foldersToLoad = {};
let textures = {};

//------------------------------------------------------------------------------------//
//Image Assets

//Add file paths to foldersToLoad

//Blocky font Letter Images
foldersToLoad["alphabet"] = [];
for (let letterIndex = 0; letterIndex < 26; letterIndex++){
	foldersToLoad["alphabet"].push(alphabet[letterIndex].toUpperCase());
}
foldersToLoad["alphabet"].push("period");

//Buttons
foldersToLoad["buttons"] = ["back", "buttonHovered", "buttonPressed", "cog", "continue", "generate", "create", "done", "escape"];
foldersToLoad["buttons/difficultySelect"] = ["custom", "easy", "hard", "medium", "slider", "sliderMarker"];
foldersToLoad["buttons/gameModes"] = ["hostServer", "serverSelect", "solo"];
foldersToLoad["buttons/mainMenu"] = ["howToPlay", "leaderboard", "play", "signIn", "login"];
foldersToLoad["buttons/multiplayer"] = ["joinArrow", "join"];
foldersToLoad["buttons/settings"] = ["minus", "musicDisabled", "musicEnabled", "plus", "sliderOn", "sliderOff", 
 "sliderBackground"];

//Full Alphabet Images
foldersToLoad["fullAlphabet"] = [];
for (let letterIndex = 0; letterIndex < 26 * 2; letterIndex++) {
	let identifier = "_lower";
	if (letterIndex >= 26) {
		identifier = "_upper";
	}
	foldersToLoad["fullAlphabet"].push(alphabet[letterIndex % 26] + identifier);
}
foldersToLoad["fullAlphabet"] = [...foldersToLoad["fullAlphabet"], "_", "-", ";", "!", "(", ")", "[", "]", "{", "}", "@", "&", "`", "^", "+", "=", "~", "$", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "<", "backslash", ":", "tag", ">", "percent", "question", "slash", "*"];

//Hitbox Images
let hitboxHorizontalLeft = {};
let hitboxHorizontalMiddle = {};
let hitboxHorizontalRight = {};
let hitboxVerticalTop = {};
let hitboxVerticalMiddle = {};
let hitboxVerticalBottom = {};
const colors = ["blue", "red", "yellow", "green", "pink", "white", "orange", "cyan"];
for (let i = 0; i < colors.length; i++) {
	hitboxHorizontalLeft[colors[i]] = new Image();
	hitboxHorizontalLeft[colors[i]].src = "/textures/hitboxes/" + colors[i] + "/hitboxHorizontalLeft.png";

	hitboxHorizontalMiddle[colors[i]] = new Image();
	hitboxHorizontalMiddle[colors[i]].src = "/textures/hitboxes/" + colors[i] + "/hitboxHorizontalMiddle.png";

	hitboxHorizontalRight[colors[i]] = new Image();
	hitboxHorizontalRight[colors[i]].src = "/textures/hitboxes/" + colors[i] + "/hitboxHorizontalRight.png";

	hitboxVerticalTop[colors[i]] = new Image();
	hitboxVerticalTop[colors[i]].src = "/textures/hitboxes/" + colors[i] + "/hitboxVerticalTop.png";

	hitboxVerticalMiddle[colors[i]] = new Image();
	hitboxVerticalMiddle[colors[i]].src = "/textures/hitboxes/" + colors[i] + "/hitboxVerticalMiddle.png";

	hitboxVerticalBottom[colors[i]] = new Image();
	hitboxVerticalBottom[colors[i]].src = "/textures/hitboxes/" + colors[i] + "/hitboxVerticalBottom.png";
}

//Menu Elements
foldersToLoad["menuElements"] = ["banner", "mainLogo", "pano", "placeholder", "textmarker", "background", "confettiLeft", "confettiRight", "congratulations", "yourscore", "hostinfo", "define"];
foldersToLoad["menuElements/interactionElements"] = ["fade"];
foldersToLoad["menuElements/howToPlay"] = ["howToPlay1", "howToPlay2", "howToPlayGreens", "howToPlayInput", "howToPlayIntro", "howToPlayLetterDict", "howToPlayYellows", "howToPlayGuess", "howToPlayCongratulations", "keybinds"];
foldersToLoad["menuElements/squares"] = ["black-gold_Outline", "chatBox", "chatBoxBar", "descriptionBox", "emptySquare", "largeDescriptionBox", "seperatorBar_orange-gold"];
foldersToLoad["menuElements/textbox"] = ["textboxCenter", "textboxLeft", "textboxRight"];
//Squares
foldersToLoad["squares"] = ["crosswordTile", "greenPixel"];
let colorsToUse = ["gray", "green", "red", "yellow", "blue"];
for (let i = 0; i < colorsToUse.length; i++) {
	foldersToLoad["squares/" + colorsToUse[i]] = ["outline", "square", "tile"];
}

//------------------------------------------------------------------------------------//
//Load Images from paths in foldersToLoad


let letterImages = {};
let fullLetterImages = {};
//For each folder in foldersToLoad
for (let folderIndex = 0; folderIndex < Object.keys(foldersToLoad).length; folderIndex++) {
	let currentFolder = Object.keys(foldersToLoad)[folderIndex];
	//For each item in the folder
	for (let itemIndex = 0; itemIndex < foldersToLoad[currentFolder].length; itemIndex++) {
		let currentItem = foldersToLoad[currentFolder][itemIndex];
		if (currentFolder !== "alphabet" && currentFolder !== "fullAlphabet" && currentFolder.slice(0, 7) !== "squares") {
			textures[currentItem] = new Image();
			textures[currentItem].src = "/textures/" + currentFolder + "/" + currentItem + ".png";
		} else if (currentFolder === "alphabet") {
			letterImages[currentItem] = new Image();
			letterImages[currentItem].src = "/textures/" + currentFolder + "/" + currentItem + ".png";
		} else if (currentFolder === "fullAlphabet") {
			let currentItemDefinition = currentItem;
			if (currentItemDefinition.length === 7) {
				if (currentItemDefinition.slice(1) === "_lower") {
					currentItemDefinition = currentItemDefinition[0];
				} else if (currentItemDefinition.slice(1) === "_upper") {
					currentItemDefinition = currentItemDefinition[0].toUpperCase();
				}
			}
			fullLetterImages[currentItemDefinition] = new Image();
			fullLetterImages[currentItemDefinition].src = "/textures/" + currentFolder + "/" + currentItem + ".png";
		} else {
			textures[currentFolder.slice(8) + currentItem[0].toUpperCase() + currentItem.slice(1)] = new Image();
			textures[currentFolder.slice(8) + currentItem[0].toUpperCase() + currentItem.slice(1)].src = "/textures/" + currentFolder + "/" + currentItem + ".png";
		}
	}
}

//------------------------------------------------------------------------------------//
//Audio Assets

const mainMusic = new Audio();
mainMusic.src = "/audio/crossWorldleSoundTrackLoop4.2.mp3";

const calm2 = new Audio();
calm2.src = "/audio/crossWordleCalm2.1.mp3";

const music1 = new Audio();
music1.src = "/audio/crossWordleMusic3.2.mp3"; 

mainMusic.volume = 0.5;
calm2.volume =  0.5;
music1.volume = 0.5;

//------------------------------------------------------------------------------------//
//Constants

//Characters which need to be lowered when drawn
const charactersToLower = ["g", "p", "q", "y", "j"];

//Score multipliers for each difficulty
const diffMults = {
	"easy": 0.75, 
	"medium": 1.5,
	"hard": 2, 
	"custom": 0
};

//Define the shapes of the keyboard display and the constants used to build them
const keyboardDataDisplayShape = "rows";
const keyboardDisplayKeySize = 75;
const keyboardDisplayXOffset = 100;
const keyboardDisplayYOffset = 1080/2 - 5 * (75)/2;

//Position of letters x, y (offset, size, muliplier)
let rowsKeyboardDisplayShape = {};
for (let i = 0; i < 26; i++) {
	rowsKeyboardDisplayShape[alphabet[i]] = [keyboardDisplayXOffset + keyboardDisplayKeySize * (i % 5), keyboardDisplayYOffset + keyboardDisplayKeySize * Math.floor(i / 5)];
}

//Animations
//positionData: [[framesToPosition, x, y, width, height], [framesToPosition, x%, y%, width%, height%]]
const animationTemplates = {
	"greenPop": {"img": "greenSquare", "loop": false, "currentFrame": 0, "currentPosition": [0, 0, 0, 0], "positionData": [[0, 1, 1, 0, 0], [60, 1, 1, 1, 1], [120, 1.5, 1, 1, 1]]},
	"pan": {"img": "pano", "loop": true, "currentFrame": 0, "currentPosition": [0, 0, 0, 0], "positionData": [[0, 0.1, 0.1, 1, 1], [600, 0.9, 0.1, 1, 1], [1200, 0.1, 0.9, 1, 1], [1800, 0.9, 0.9, 1, 1], [2400, 0.1, 0.1, 1, 1]]}, "sliderOn": {"img": "sliderOn", "loop": false, "currentFrame": 0, "currentPosition": [0, 0, 0, 0], "positionData": [[0, 0.95, 1, 1, 1], [30, 1.05, 1, 1, 1]]}, "sliderOff": {"img": "sliderOff", "loop": false, "currentFrame": 0, "currentPosition": [0, 0, 0, 0], "positionData": [[0, 1.05, 1, 1, 1], [30, 0.95, 1, 1, 1]]}, "redFlash": {"img": "redOutline", "loop": false, "currentFrame": 0, "currentPosition": [0, 0, 0, 0], "positionData": [[0, 1, 1, 1, 1], [15, 1, 1, 1, 1], [16, 1, 1, 0, 0], [29, 1, 1, 0, 0], [30, 1, 1, 1, 1], [45, 1, 1, 1, 1], [46, 1, 1, 0, 0]]}
};

//------------------------------------------------------------------------------------//
//Variables

//Alternate font
let altFont = false;

//List of lists. Formatted [type, startingFrame, x, y, data]
let animations = {};

//All available servers names and users
let availableServers = {};

//Average word length, used to determine score
let averageWordLength = 0;

//Size of images on crossword, crossword element size
let CES = 50;

//Should the server collect keyboard input
let collectInput = true;

//Data the client uses for server requests and multiplayer
let clientData = {
	"username": "guest",
	"userData": {},
	"color": "blue"
};

//List of lists, indexed as [y][x], each spot inside is a string with a length of 2
//Key:
//   "//" - empty, "-/" - blacklisted, "+_" - shown letter, "-_" - hidden letter
let crosswordData = [];

//Offset of the crossword from edge of the screen
let crosswordOffset = [];

//Position of the crossword based on user's dragging
let crosswordPosition = [0,0];

//The server the user is currently in
let currentRoom = "";

//Amount of words displayed by the custom sliders
let customWordCount = 4;

//Length of words displayed by the custom sliders
let customWordLength = [3, 12];

//Should the user be prompted to google the definition of solved words
let definitionTool = false;

//{difficulty: [[minLength, maxLength], wordCount]}, used for requesting crossword generations
let difficulty = {
	"easy": [[4, 5], 4], 
	"medium": [[5, 7], 4], 
	"hard": [[6, 10], 5],
	"custom": []
};

//An empty yellow row
let emptyYellow = [];

//Is the escape popup active
let escapeKey = false;

//How many update frames has the program been though, resets after 64 bits
let frames = 0;

//The current gamestate, determines what is displayed to the user
let gameState = "mainMenu";

//Progress of the user in solving  a wordle
let greens = [];

//How many total guesses has the user made
let guesses = 0;

//Is high contrast mode active
let highContrast = false;

//Hitboxes highlighted by other users in multiplayer
let highlightData = [];

//List of the hitbox pressed to get into wordle gamestate
let hitboxPressed = [];

//Index of the hitbox pressed
let hitboxPressedIndex = 0;

//List of lists, every word that was spawned has [x, y, width, height, word, isFound, keyboardData*, yellows*] * - not always used in hitboxes
let hitboxes = [];

//Screen offset in px, used for positioning the canvas as 1920 by 1080
let horizontalOffset = 0;

//Whether or not the user is the host of their current room
let host = false;

//The page of the help menu
let howToPlayPage = 1;

//Has the user put in an incorrect password when joining a server
let incorrectPassword = false;

//The word most recently inputted into the wordle
let inputtedWord = "";

//The state of each letter in a wordle, "gray" = not tried, "yellow" = tried, not in correct column, "green" = correct, "red" = tried, not in word
let keyboardData = {};
for (let i = 0; i < 26; i++) {
	keyboardData[alphabet[i]] = "gray";
}

//Keys pressed this frame
let keyPressedThisFrame = "";

//Keys currently being pressed
let keysPressed = [];

//Client-side leaderboard data, used for display
let leaderboardData = {"order": []};

//single frame mouse button vars
let mouseButtonDown = false;

//What state the mouse is in
let mouseButtonState = "";

//Single frame on mouse button up
let mouseButtonUp = false;

//Past mouse position from dragging crossword
let pastMousePosition = [0, 0];

//Mouse position
let mouseX = 0;
let mouseY = 0;

//ms at start of crossword solving from 1970
let ms = 0;

//Should the music be playing
let musicPlaying = false;

//Whether or not the noServers error has been recieved
let noServers = false;

//Previous gamestate, used when needing to return to specific pages
let playState = "";

//roomData of the current room
let roomData = {"users":[]};

//User score
let score = 0;

//One frame, the user's scroll amount (used for zooming in and out)
let scrollAmount = 0;

//The difficulty the user has selected
let selectedDifficulty = "none";

//Currently selected text box
let selectedTextBox = "";

//Event that socket recieved to run updateGame
let serverEvent = "";

//Error message sent by server on things like failed login
let serverError = "";

//The password the host inputs to create a server
let serverPassword = "";

//The server currently selected in the serverSelect gamestate
let serverSelected = false;

//Is shift being pressed
let shiftKey = false;

//Mulitplier for canvas elements to adjust for different display sizes
let sizeMult = 1;

//Index of the song currently being played
let songIndex = 0;

//Data for text boxes, indexed with selectedTextBox
let textboxData = {
	"createUsername": [],
	"createPassword": [],
	"loginUsername": [],
	"loginPassword": [],
	"serverName": [],
	"serverPassword": [],
};

//Keys inputtable into the wordle
let trackedKeys = [...alphabet, "enter", "backspace"];

//Temporary crossword data for comparison
let tempData = [];

//String of letters that the user has inputed
let wordleInput = [];

//Same as horizontal offset but for the vertical direction
let verticalOffset = 0;

//Word being passed into the wordle gamestate
let word = "";

//List of ~466k words used for user input, retrieved from server
let wordList = [];

//Wordle yellows
let yellows = {};

//------------------------------------------------------------------------------------//
//Server Communication Functions

function requestCrossword(wordLength, wordCount){
	socket.emit("generateCrossword", [wordLength, wordCount]);
};

function requestLog(message){
	socket.emit("log", message);
};

function requestWordList(){
	socket.emit("wordList", null);
};

function requestLogin(username, password){
	let data = [username, password];
	socket.emit("login", data);
};

function createAccount(username, password) {
	let data = [username, password];
	socket.emit("createAccount", data);
};

function requestPasswordChange(username, password, newPassword) {
	let data = [username, password, newPassword];
	socket.emit("changePassword", data);
};

function requestUsernameChange(username, password, newUsername) {
	let data = [username, password, newUsername];
	socket.emit("changeUsername", data);
};

function sendUserWin(username) {
	socket.emit("userWin", username);
};

function sendUserPlay(username) {
	socket.emit("gameStarted", username);
};

function updateScore(username, score) {
	data = [username, score];
	socket.emit("updateScore", data);
};

function updateTime(username, time) {
	data = [username, time];
	socket.emit("updateTime", data);
};

function updateDatabase(username) {
	socket.emit("updateDatabase", username);
};

function hostServer(username, serverName, serverPassword) {
	socket.emit("privateHost", [username, serverName, serverPassword]);
	gameState = "hosting";
};

function joinServer(username, serverName, serverPassword) {
	socket.emit("joinRoom", [username, serverName, serverPassword]);
};

function leaveServer() {
	resetData("server");
	socket.emit("leaveRoom", null);
	gameState = "mainMenu";
};

function requestServers() {
	socket.emit("requestServerNames", null);
}

function sendUsername() {
	socket.emit("username", clientData["username"]);
}

function requestRoomCrossword(roomName, wordLength, wordCount) {
	socket.emit("generateRoomCrossword", [roomName, wordLength, wordCount]);
};

function requestRoomDataUpdate(roomName) {
	socket.emit("requestRoomData", roomName)
};

function updateGameData(roomName, crosswordData, hitboxes, update = true) {
	socket.emit("updateGameData", [roomName, crosswordData, hitboxes, update]);
};

function hitboxSelected(roomName, selectedHitbox, color) {
	socket.emit("hitboxSelected", [roomName, selectedHitbox, color]);
};

function hitboxDeselected(roomName) {
	socket.emit("hitboxDeselected", roomName);
};

function hitboxUpdate(roomName, indexOfChange, hitbox) {
	socket.emit("hitboxUpdate", [roomName, indexOfChange, hitbox]);
	updateGameData(roomName, crosswordData, hitboxes, update = false);
};

function requestLeaderboardData() {
	socket.emit("requestLeaderboardData", null);
};

//------------------------------------------------------------------------------------//
//Ease of life functions

//Returns true if both crosswords are the same
function compareCrosswords(crossword1, crossword2) {
	//for each row
	for (let rowIndex = 0; rowIndex < crossword1.length; rowIndex++) {
		//for each column
		for (let columnIndex = 0; columnIndex < crossword1[rowIndex].length; columnIndex++) {
			//if the columns are not the same between the crosswords
			if (crossword1[rowIndex][columnIndex] !== crossword2[rowIndex][columnIndex]) {
				//the crosswords are not the same
				return false;
			}
		}
	}
	//the crosswords are the same
	return true;
};

//Resets select clientside data
function resetData(type) {
	if (type === "crossword" || type === "all") { //resetData("crossword");
		averageWordLength = 0;
		crosswordData = [];
		guesses = 0;
		highlightData = {};
		hitboxPressed = [];
		hitboxes = [];
		wordleInput = [];
		crosswordPosition = [0, 0];
	} 
	if (type === "wordle" || type === "all") { //resetData("wordle");
		greens = [];
		word = "";
		yellows = {};
		emptyYellow = [];
		keyboardData = {
			"a": "gray",
			"b": "gray",
			"c": "gray",
			"d": "gray",
			"e": "gray",
			"f": "gray",
			"g": "gray",
			"h": "gray",
			"i": "gray",
			"j": "gray",
			"k": "gray",
			"l": "gray",
			"m": "gray",
			"n": "gray",
			"o": "gray",
			"p": "gray",
			"q": "gray",
			"r": "gray",
			"s": "gray",
			"t": "gray",
			"u": "gray",
			"v": "gray",
			"w": "gray",
			"x": "gray",
			"y": "gray",
			"z": "gray"
		};
	}
	if (type === "text" || type === "all") { //resetData("text");
		textboxData = {
			"createUsername": [],
			"createPassword": [],
			"loginUsername": [],
			"loginPassword": [],
			"serverName": [],
			"serverPassword": [],
		};
		selectedTextBox = "";
	}
	if (type === "server" || type === "all") {
		roomData = {"users":[]};
		currentRoom = "";
		incorrectPassword = false;
	}
	if (type === "animations" || type === "all") {
		animations = {};
	}
	if (type === "all") {
		score = 0;
	}
};

//deletes a array element at index
function del(array, index){
	array.splice(index, 1);
};

//Returns a random integer between range [min, max], if one value is given min is 0 and max is that value
function randint(min, max = "none"){
	if (max === "none"){
		max = min;
		min = 0;
	}
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

//draws a image with center at x and y with width "width" and height "height" with respect to the screen size and offsets
function draw(image, x, y, width, height, button = false, escButton = false) {
	//Calculate new x, y, width, and height taking into account display size
	let newX = (x - width/2) * sizeMult + horizontalOffset;
	let newY = (y - height/2) * sizeMult + verticalOffset;
	let newWidth = width * sizeMult;
	let newHeight = height * sizeMult;
	//Determine if the image given needs to be taken from textures
	if (typeof image === "string") {
		ctx.drawImage(textures[image], newX, newY, newWidth, newHeight);
	} else {
		ctx.drawImage(image, newX, newY, newWidth, newHeight);
	}
	//If the draw is for a button, draw a slightly transparent image over it
	//Button framework, if button = true, then show 
	if (button && (!escapeKey || escButton)) {
		if (select(x, y, width, height)) {
			draw("buttonPressed", x, y, width, height);
		} else if (hover(x, y, width, height)){
			draw("buttonHovered", x, y, width, height);
		}
	}
};

//creates button listeners at center, x, y with width "width" and height "height" with respect to the screen size and offsets. To be used with draw()
function button(x, y, width, height, image = "placeholder", escapeButton = false){
	//Calculate new x, y, width, and height taking into account display size
	let newX = (x - width/2) * sizeMult + horizontalOffset;
	let newY = (y - height/2) * sizeMult + verticalOffset;
	let newWidth = width * sizeMult;
	let newHeight = height * sizeMult;
	//draw an image if one is provided
	if (image != "none") {
		draw(image, x, y, width, height, true, escapeButton);
	}
	//calculate the button press and return the output
	let answer = (mouseX > newX && mouseX < newX + newWidth && mouseY > newY && mouseY < newY + newHeight && mouseButtonUp) && (!escapeKey || escapeButton);
	if (answer) {mouseButtonUp = false;}
	return answer;
};

//creates a slider
function slider(x, y, width, height, image = "placeholder"){
	//Calculate new x, y, width, and height taking into account display size
	let newX = (x - width/2) * sizeMult + horizontalOffset;
	let newY = (y - height/2) * sizeMult + verticalOffset;
	let newWidth = width * sizeMult;
	let newHeight = height * sizeMult;
	//draw an image if one is provided
	if (image != "none") {
		draw(image, x, y, width, height, true);
	}
	//calculate and return the output
	let answer = mouseX > newX && mouseX < newX + newWidth && mouseY > newY && mouseY < newY + newHeight && mouseButtonState === "down";
	if (answer) {mouseButtonUp = false;}
	return answer;
};

//Do some math to determine the slider output (for horizontal sliders only)
function findSliderOutput(x, width) {
	return ((mouseX - ((x - width/2) * sizeMult + horizontalOffset)) / (width * sizeMult));
};

//Is the mouse hovering over a element at specified coords
function hover(x, y, width, height, escapeButton = true){
	//Calculate new x, y, width, and height taking into account display size
	let newX = (x - width/2) * sizeMult + horizontalOffset;
	let newY = (y - height/2) * sizeMult + verticalOffset;
	let newWidth = width * sizeMult;
	let newHeight = height * sizeMult;
	return mouseX > newX && mouseX < newX + newWidth && mouseY > newY && mouseY < newY + newHeight && (!escapeKey || escapeButton);
};

//Same as hover but for mouse button down
function select(x, y, width, height, escapeButton = true){
	let newX = (x - width/2) * sizeMult + horizontalOffset;
	let newY = (y - height/2) * sizeMult + verticalOffset;
	let newWidth = width * sizeMult;
	let newHeight = height * sizeMult;
	//calculate and return the output
	return mouseX > newX && mouseX < newX + newWidth && mouseY > newY && mouseY < newY + newHeight && mouseButtonState === "down" && (!escapeKey || escapeButton);
};

//returns the number of occurances of letter in the given string
function countLetter(string, letter) {
	return (string.split(letter).length - 1);
};

//Displays selected letter at x, y with size paramater in px, defaults to (15/25) * CES. Only works with simple letters (no numbers/special chars)
function drawLetter(letter, x, y, size = (15/25) * CES) {
	//For every letter image
	for (let i = 0; i < Object.keys(letterImages).length; i++) {
		//Draw the letter
		if (letter.toUpperCase() === Object.keys(letterImages)[i]) {
			draw(Object.values(letterImages)[i], x, y, size, size);
		//Special cases
		} else if (letter === ".") {
			draw(letterImages["period"], x, y, size, size);
		}
	}
};

//Displays selected letter at x, y with size parameter in px, defaults to 25, works with all keyboard characters (no ' or " or | or . or ,)
function drawCharacter(character, x, y, size = 15) {
	//For every character image
	for (let i = 0; i < Object.keys(fullLetterImages).length; i++) {
		if (character === Object.keys(fullLetterImages)[i]) {
			if (charactersToLower.includes(Object.keys(fullLetterImages)[i])) {
				draw(Object.values(fullLetterImages)[i], x, y + size * 36/130, size, size);
			} else {
				draw(Object.values(fullLetterImages)[i], x, y, size, size);
			}
		} else if (character === "#") {
			draw(fullLetterImages["tag"], x, y, size, size);
		} else if (character === "%") {
			draw(fullLetterImages["percent"], x, y, size, size);
		}
	}
};

//Logs supported key presses
function collectKeyPresses(){
	//if the length of the input is 1 char (to exclude things like shift)
	if ((keyPressedThisFrame.length === 1 || (keyPressedThisFrame === "enter" && wordleInput.length === word.length)) && trackedKeys.includes(keyPressedThisFrame)) {
		wordleInput.push(keyPressedThisFrame);
	}
	//if the user doesn't have space for a longer word and the input is not enter or if the user presses "backspace"
	if ((wordleInput.length > word.length && !(keyPressedThisFrame === "enter")) || keyPressedThisFrame === "backspace") {
		del(wordleInput, wordleInput.length - 1);
	}
};

//Draws selected string or list onto the screen with specific text size in px
function drawText(string, x, y, size = 50, type = "letter") {
	//puts x and y in the center of the first letter of the text
	x += size/2;
	y += size/2;
	//Draw each letter / character in the given string
	for (let stringIndex = 0; stringIndex < string.length; stringIndex++) {
		if (type === "letter"){drawLetter(string[stringIndex], x + (size * stringIndex), y, size);}
		if (type === "character"){drawCharacter(string[stringIndex], x + (size * stringIndex), y, size);}
	}
};

//Draws text box onto screen with center at x and y with width width and height height, can't be less than 100 px long
function drawTextBox(x, y, width, height = 50){
	draw("background", x, y, width, height)
	draw("textboxLeft", x - Math.round(width/2) + height/2 + 1, y, height, height);
	draw("textboxRight", x + Math.round(width/2) - height/2 - 1, y, height, height);
	draw("textboxCenter", x, y, width - height * 2, height);
};

//clears all text boxes
function clearTextBoxes() {
	//Set all textboxData elements to an empty array
	let keys = Object.keys(textboxData);
	for (let key = 0; key < keys.length; key++) {
		textboxData[keys[key]] = [];
	}
}

//Creates a deep copy of an object, array1 == array2 without array1 === array2
function clone(object) {
	//Get the JSON data from the object and put it together again
	return JSON.parse(JSON.stringify(object));
};

//returns crossword height
function findCrosswordHeight() {
	let min = 0;
	let max = crosswordData.length - 1;
	let emptyRow = [];
	//Create an empty row based on the size of the crossword
	for (let i = 0; i < crosswordData.length; i++) {
		emptyRow.push("//");
	}
	emptyRow = JSON.stringify(emptyRow)
	//Check how many empty rows are above the first occupied space
	while (true) {
		if (JSON.stringify(crosswordData[min]) === emptyRow) {
			min++;
		} else {
			break;
		}
	}
	//Check how many empty rows are below the last occupied space
	while (true) {
		if (JSON.stringify(crosswordData[max]) === emptyRow) {
			max--;
		} else {
			break;
		}
	}
	return max - min + 2;
};

//------------------------------------------------------------------------------------//
//Log in functions

//Logs user input and pushes it to the selected text box array
function logInput(maxLength = 20, spaceTypeable = false) {
	//gather the user's input and append it to the proper list
	if (shiftKey && keyPressedThisFrame.length === 1) {
		keyPressedThisFrame = keyPressedThisFrame.toUpperCase();
	}
	//If a text box is selected and the key pressed isn't space or space is allowed
	if ((keyPressedThisFrame.length === 1 && textboxData[selectedTextBox].length < maxLength && (keyPressedThisFrame !== " " || spaceTypeable)) && selectedTextBox !== "") {
		//Add to selected text box
		textboxData[selectedTextBox].push(keyPressedThisFrame);
	}
	//If the key pressed is backspace
	if (keyPressedThisFrame === "backspace") {
		//Remove from selected text box
		del(textboxData[selectedTextBox], textboxData[selectedTextBox].length - 1);
	}
	//If the key pressed is enter
	if (keyPressedThisFrame === "enter") {
		//Deselect the text box
		selectedTextBox = "";
	}
}; //Also used for server input

//Selects the correct text box when the user is in the login gamestate
function loginTextBoxSelection(){
	if (button(500, 400, 700, 75, "none")) {
		selectedTextBox = "createUsername";
	} else if (button(500, 600, 700, 75, "none")) {
		selectedTextBox = "createPassword";
	} else if (button(1420, 400, 700, 75, "none")) {
		selectedTextBox = "loginUsername";
	} else if (button(1420, 600, 700, 75, "none")) {
		selectedTextBox = "loginPassword";
	} else if (mouseButtonUp) {
		selectedTextBox = "";
	}
};

//Draws the create account elements for the sign in gamestate
function drawCreateAccount() {
	draw("black-gold_Outline", 500, 550, 750, 820);
	drawText("create account", 150, 180);

	drawText("username", 150, 320, 33);
	drawTextBox(500, 400, 700, 75);

	drawText("password", 150, 520, 33);
	drawTextBox(500, 600, 700, 75);

	//Draw the contents of the text boxes
	drawText(textboxData["createUsername"], 170, 385, 33, "character");
	drawText(textboxData["createPassword"], 170, 585, 33, "character");

	//Draw the markers when the text boxes are selected
	if (selectedTextBox === "createUsername") {
		drawTextMarker(170, 385);
	} else if (selectedTextBox === "createPassword") {
		drawTextMarker(170, 585);
	}
};

//Draws the login elements for the sign in gamestate
function drawLogin() {
	draw("black-gold_Outline", 1420, 550, 750, 820);
	drawText("login", 1075, 180);

	drawText("username", 1070, 320, 33);
	drawTextBox(1420, 400, 700, 75);

	drawText("password", 1070, 520, 33);
	drawTextBox(1420, 600, 700, 75);

	//Draw the contents of the text boxes
	drawText(textboxData["loginUsername"], 1095, 385, 33, "character");
	drawText(textboxData["loginPassword"], 1095, 585, 33, "character");
	//Draw the markers when the text boxes are selected
	if (selectedTextBox === "loginUsername") {
		drawTextMarker(1095, 385);
	} else if (selectedTextBox === "loginPassword") {
		drawTextMarker(1095, 585);
	}
};

//------------------------------------------------------------------------------------//
//Server Functions

//Draws server creation menu
function drawCreateServer(){ 
	draw("black-gold_Outline", 960, 550, 750, 820);
	drawText("create server", 615, 180); 

	drawText("server name", 610, 320, 33); 
	drawTextBox(960, 400, 700, 75);

	drawText("password", 610, 520, 33);
	drawTextBox(960, 600, 700, 75);

	//Draw the contents of the text boxes
	drawText(textboxData["serverName"], 635, 385, 33, "character");
	drawText(textboxData["serverPassword"], 635, 585, 33, "character");

	//Find what text box the user has selected
	if (button(960, 400, 700, 75, "none")) {
		selectedTextBox = "serverName";
	} else if (button(960, 600, 700, 75, "none")) {
		selectedTextBox = "serverPassword";
	} else if (mouseButtonUp) {
		selectedTextBox = "";
	}

	//Draw the markers when the text boxes are selected
	if (selectedTextBox === "serverName") {
		drawTextMarker(635, 385);
	} else if (selectedTextBox === "serverPassword") {
		drawTextMarker(635, 585);
	}
};

function drawJoinServer(){ 
	draw("black-gold_Outline", 960, 550, 750, 820);
	drawText("join server", 615, 180); 

	drawText("server name", 610, 320, 33); 
	drawTextBox(960, 400, 700, 75);

	drawText("password", 610, 520, 33);
	drawTextBox(960, 600, 700, 75);

	//Draw the contents of the text boxes
	drawText(textboxData["serverName"], 635, 385, 33, "character");
	drawText(textboxData["serverPassword"], 635, 585, 33, "character");

	//Find what text box the user has selected
	if (button(960, 400, 700, 75, "none")) {
		selectedTextBox = "serverName";
	} else if (button(960, 600, 700, 75, "none")) {
		selectedTextBox = "serverPassword";
	} else if (mouseButtonUp) {
		selectedTextBox = "";
	}

	//Draw the markers when the text boxes are selected
	if (selectedTextBox === "serverName") {
		drawTextMarker(635, 385);
	} else if (selectedTextBox === "serverPassword") {
		drawTextMarker(635, 585);
	}

	//Join server button
	if (button(960, 850, 200, 100, "join")) {
		resetData("server");
		joinServer(clientData["username"], textboxData["serverName"].join(""), textboxData["serverPassword"].join(""));
	}
};

//Draws a flashing text marker at position given x and y
function drawTextMarker(x, y) {
	if (Math.round(frames/15) % 2 === 1) {
		draw("textmarker", x + 5 + 33 * textboxData[selectedTextBox].length, y + 15, 20, 50);
	}
};

//Displays all available servers in their own text box
function displayAvailableServers() {
	let keys = Object.keys(availableServers);
	let spacing = "                    ";
	//Loop through all known game servers
	for (let serverIndex = 0; serverIndex < keys.length; serverIndex++) {
		spacing = "                    ";
		//Normalize spacing of users in the server
		for (let letterIndex = 0; letterIndex < keys[serverIndex].length; letterIndex++) {
			spacing = spacing.slice(1);
		}
		drawTextBox(960, 250 + serverIndex * 50, 1800);
		drawText(keys[serverIndex] + ": " + spacing + availableServers[keys[serverIndex]], 80, 235 + serverIndex * 50, 25, "character");
		//If the user wants to join a server
		if (button(1780, 250 + serverIndex * 50, 35, 30, "joinArrow")) { 
			clearTextBoxes(); 
			textboxData["serverName"] = keys[serverIndex].split(""); 
			serverSelected = true;
		}
	}
};

//------------------------------------------------------------------------------------//
//Crossword Functions

//simulates crossword displays with center at x and y. Will allow user to click and drag if the size is larger than the avalable space (has 50px of padding on every side and a gray outline)
function displayCrossword(x, y) {
	//index of longest row, used for positioning of the crossword
	let longestRow = 0;
	//loop through crosswordData to find the longest row
	for (let row = 0; row < crosswordData.length; row++){
		if (crosswordData[row].length > crosswordData[longestRow].length){
			longestRow = row;
		}
	}
	//Center crossword on key press of c
	if (keyPressedThisFrame === "c") {
		crosswordPosition = [0, 0];
	}
	//Add crossword position to x and y
	x += crosswordPosition[0];
	y += crosswordPosition[1];
	//Calculate crossword offset
	crosswordOffset = [(x - crosswordData[longestRow].length * CES / 2), (y - crosswordData.length * CES / 2)];
	//Loops through and draws every data element in crosswordData
	for (let row = 0; row < crosswordData.length; row++){
		for (let column = 0; column < crosswordData[row].length; column++){
			//if the item is a letter
			if (crosswordData[row][column][1] != "/"){
				//if the item is supposed to be shown (has + identifier) draw it
				//draw blank tile
				draw("CrosswordTile", crosswordOffset[0] + column * CES, crosswordOffset[1] + row * CES, CES, CES);
				if (crosswordData[row][column][0] === "+" || false /*clientData["userData"]["developer"]*/) {
					//display the letter inside of the box
					if (!altFont) {
						drawLetter(crosswordData[row][column][1], crosswordOffset[0] + column * CES, crosswordOffset[1] + row * CES, (15/25) * CES);
					} else {
						drawCharacter(crosswordData[row][column][1].toUpperCase(), crosswordOffset[0] + column * CES, crosswordOffset[1] + row * CES, (15/25) * CES);
					}
				}
			}
		}
	}
	//Loop through all multiplayer highlights and draw them
	for (let i = 0; i < highlightData.length; i++) {
		drawHighlight(highlightData[i][0] * CES + crosswordOffset[0], highlightData[i][1] * CES + crosswordOffset[1], highlightData[i][2], highlightData[i][3], highlightData[i][4]);
	}
	//for every hitbox
	for (let i = 0; i < hitboxes.length; i++){
		//if the mouse is over a hitbox
		leftBound = mouseX >= (hitboxes[i][0] * CES + crosswordOffset[0] - CES/2) * sizeMult + horizontalOffset;
		rightBound = mouseX <= ((hitboxes[i][0] + hitboxes[i][2]) * CES + crosswordOffset[0] - CES/2) * sizeMult + horizontalOffset;
		upperBound = mouseY >= (hitboxes[i][1] * CES + crosswordOffset[1] - CES/2) * sizeMult  + verticalOffset;
		lowerBound = mouseY <= ((hitboxes[i][1] + hitboxes[i][3]) * CES + crosswordOffset[1] - CES/2) * sizeMult + verticalOffset;
		xBounds = leftBound && rightBound
		yBounds = upperBound && lowerBound
		isSolved = hitboxes[i][5];
		if ((xBounds && yBounds && !isSolved) && !escapeKey) {
			//Draw the hitbox
			drawHighlight(hitboxes[i][0] * CES + crosswordOffset[0], hitboxes[i][1] * CES + crosswordOffset[1], hitboxes[i][2], hitboxes[i][3], clientData["color"]);
			//if the mouse button was just pressed and the word being highlighted is not found
			if (mouseButtonDown && !hitboxes[i][5]){
				//Change gameState and run all needed data changes
				if (playState !== "help") {
					gameState = "initWordle";
					//assign hitboxPressed
					hitboxPressed = hitboxes[i];
					if (playState === "coopCrossword") {
						hitboxSelected(currentRoom, hitboxPressed.slice(0, 4), clientData["color"]);
					}
				} else {
					howToPlayPage = 2;
				}
			}
			//and don't highlight any others
			break;
		} else if ((xBounds && yBounds && isSolved) && !escapeKey && definitionTool) {
			draw("define", (mouseX - horizontalOffset)/sizeMult + 210 * CES/100, (mouseY - verticalOffset)/sizeMult + 30 * CES/100, 380 * CES/100, 32 * CES/100);
			//Definition tool for solved hitbox press
			if (mouseButtonDown) {
				mouseButtonDown = false;
				mouseButtonState = "";
				window.open("https://www.google.com/search?q=" + hitboxes[i][4] + "+definition", '_blank');
			}
			break;
		}
	}
};

//draws a highlight in direction from points x and y
function drawHighlight(x, y, width, height, color = "blue"){
	//If it is a vertical hitbox
	if (height > 1) {
		draw(hitboxVerticalTop[color], x, y, CES, CES);
		for (let k = 1; k < height - 1; k++) {
			draw(hitboxVerticalMiddle[color], x, y + (k * CES), CES, CES);
		}
		draw(hitboxVerticalBottom[color], x, y + (height - 1) * CES, CES, CES);
	}
	//If it is a horizontal hitbox 
	if (width > 1) {
		draw(hitboxHorizontalLeft[color], x, y, CES, CES);
		for (let k = 1; k < width - 1; k++) {
			draw(hitboxHorizontalMiddle[color], x + (k * CES), y, CES, CES);
		}
		draw(hitboxHorizontalRight[color], x + (width - 1) * CES, y, CES, CES);
	}
};

//Checks for a win in the crossword gamestate
function checkWin() {
	//Loops through hitboxes and checks each one's found property
	for (let i = 0; i < hitboxes.length; i++){
		if (!hitboxes[i][5]) {
			break;
		}
   		if (i === hitboxes.length - 1) {
	  		return true
		}
	}
	return false;
};

//Sends an update to the server if crosswordData changes
function checkCoopCrossword() {
	if (!compareCrosswords(crosswordData, tempData)) {
		//Send data to the server
		updateGameData(currentRoom, crosswordData, hitboxes);
		//Update tempData
		tempData = [];
		for (let rowIndex = 0; rowIndex < crosswordData.length; rowIndex++) {
			tempData.push([...crosswordData[rowIndex]])
		}
	}
};

//Updates crossword data to be sure there are not any unwanted data overwrites
function updateCrosswordData() {
	for (let rowIndex = 0; rowIndex < crosswordData.length; rowIndex++) {
		for (let columnIndex = 0; columnIndex < crosswordData.length; columnIndex++) {
			if (tempCrosswordData[rowIndex][columnIndex][0] !== crosswordData[rowIndex][columnIndex][0]) {
				if (crosswordData[rowIndex][columnIndex][0] === "-") {
					crosswordData[rowIndex][columnIndex] = tempCrosswordData[rowIndex][columnIndex];
				}
			}
		}
	}
	for (let hitboxIndex = 0; hitboxIndex < hitboxes.length; hitboxIndex++) {
		if (tempHitboxes[hitboxIndex][5] !== hitboxes[hitboxIndex][5]) {
			if (!hitboxes[hitboxIndex][5]) {
				hitboxes[hitboxIndex][5] = true;
			}
		}
	}
};

//Determines the score of the player
function findScore() {
	let avgWordLength = 0;
	for (let i = 0; i < hitboxes.length; i++) {
		avgWordLength += hitboxes[i][4].length;
	}
	avgWordLength = avgWordLength / hitboxes.length;
	
	let avgGuesses = (guesses - hitboxes.length) / hitboxes.length;
	
	let diffMult = diffMults[selectedDifficulty];
	return Math.max(Math.round((avgWordLength/(avgGuesses+10)) * diffMult * 75000 - (Date.now() - ms) / 200), 0);
}

//Allows user to drag the crossword and zoom in and out
function calculateCrosswordPosition() {
	//Crossword Dragging
	if (mouseButtonState === "down") {
		crosswordPosition[0] += mouseX / sizeMult - pastMousePosition[0];
		crosswordPosition[1] += mouseY / sizeMult - pastMousePosition[1];
		pastMousePosition = [mouseX / sizeMult, mouseY / sizeMult];
	} else {
		pastMousePosition = [mouseX / sizeMult, mouseY / sizeMult];
	}
	//Crossword Zooming
	if ((CES < 250 && scrollAmount > 0) || (CES > 1 && scrollAmount < 0)) {
		crosswordPosition[0] = (CES + scrollAmount * 5)/CES * (1920/2 - ((mouseX - horizontalOffset)/sizeMult) + crosswordPosition[0]) - (1920/2 - ((mouseX - horizontalOffset)/sizeMult));
		crosswordPosition[1] = (CES + scrollAmount * 5)/CES * (1080/2 - ((mouseY - verticalOffset)/sizeMult) + crosswordPosition[1]) - (1080/2 - ((mouseY - verticalOffset)/sizeMult));
		CES += scrollAmount * 5;
	}
	//Set limits on CES
	if (CES < 1) {
		CES = 1;
	} else if (CES > 250) {
		CES = 250;
	}
};

//------------------------------------------------------------------------------------//
//Animation Functions

//updates every animation on the screen from the animations list
function drawAnimations(escape = false) {
	for (let drawIndex = 0; drawIndex < Object.keys(animations).length; drawIndex++) {
		let calculatedPositions = Object.values(animations)[drawIndex]["currentPosition"];
		if ((Object.values(animations)[drawIndex]["img"] !== "sliderOff" || Object.values(animations)[drawIndex]["img"] !== "sliderOn") && !escape) {
			draw(Object.values(animations)[drawIndex]["img"], calculatedPositions[0], calculatedPositions[1], calculatedPositions[2], calculatedPositions[3]);
		} else if (escape && (Object.values(animations)[drawIndex]["img"] === "sliderOff" || Object.values(animations)[drawIndex]["img"] === "sliderOn")) {
			draw(Object.values(animations)[drawIndex]["img"], calculatedPositions[0], calculatedPositions[1], calculatedPositions[2], calculatedPositions[3]);
		}
		if (Object.keys(animations)[drawIndex] === "pano" && !escape) {
			if (gameState === "lobby") {
				drawTextBox(1920/2, 1080/3 + 35, 1500, 120);
				drawText("waiting for game start", 1920/2 - "waiting for game start".length/2 * 65, 1080/3, 65);
			} else if (gameState === "loadingLobby") {
				drawTextBox(1920/2, 1080/3 + 35, "awaiting server connection".length * 65 + 40, 120);
				drawText("awaiting server connection", 1920/2 - "awaiting server connection".length/2 * 65, 1080/3, 65);
			} else if (gameState === "loadingSoloCrossword" || gameState === "loadingCoopCrossword") {
				drawTextBox(1920/2, 1080/3 + 35, "loading crossword".length * 65 + 40, 120);
				drawText("loading crossword", 1920/2 - "loading crossword".length/2 * 65, 1080/3, 65);
			}
		}
	}
};

function addAnimation(name, template, x, y, width, height, type="linear") {
	animations[name] = clone(animationTemplates[template]);
	for (let position = 0; position < animations[name]["positionData"].length; position++) {
		//Change the position of the animation based on the inputted values
		animations[name]["positionData"][position][1] *= x;
		animations[name]["positionData"][position][2] *= y;
		animations[name]["positionData"][position][3] *= width;
		animations[name]["positionData"][position][4] *= height;
	}
	//type = "linear", "exponential", or "sinusoidal"
	animations[name]["type"] = type;
};

//Calculates the current position of a animation given all positions and currentFrame
function calculatePositions(animationIndex, currentIndex, positionData) {
	let currentPosition = positionData[currentIndex];
	let type = Object.values(animations)[animationIndex]["type"];
	let currentFrame = Object.values(animations)[animationIndex]["currentFrame"];
	if (Object.values(animations)[animationIndex]["loop"] && currentFrame >= positionData[positionData.length - 1][0]) {
		animations[Object.keys(animations)[animationIndex]]["currentFrame"] = 0;
		currentFrame = 0;
	}
	//If it is a point in a animation, return the absolute position
	if (currentPosition[0] === currentFrame) {
		return [currentPosition[1], currentPosition[2], currentPosition[3], currentPosition[4]];
	}
	let promise = [];
	//Calculate a linear line between the previous and current position and return the position on that line
	if (type === "linear") {
		//Loop through for x, y, width, height
		for (let point = 1; point <= 4; point++) {
		promise.push(Math.floor(((currentPosition[point] - positionData[currentIndex - 1][point]) / (currentPosition[0] - positionData[currentIndex - 1][0])) * (currentFrame - positionData[currentIndex - 1][0]) + positionData[currentIndex - 1][point]));
		}
	} else if (type === "exponential") {
		//Calculate an exponential from 0 to 1 and multiply it by the end size
		//Loop through for x, y, width, height
		for (let point = 1; point <= 4; point++) {
			promise.push(Math.floor((2**((currentFrame - positionData[currentIndex - 1][0]) / (positionData[currentIndex][0] - positionData[currentIndex - 1][0])) - 1) * (currentPosition[point] - positionData[currentIndex - 1][point]) + positionData[currentIndex - 1][point]));
		}
	} else if (type === "sinusoidal") {
		//Calculate an cos from 0 to 1 and multiply it by the end size
		//Loop through for x, y, width, height
		for (let point = 1; point <= 4; point++) {
			promise.push(Math.floor((-1/2 * Math.cos(Math.PI * ((currentFrame - positionData[currentIndex - 1][0]) / (currentPosition[0] - positionData[currentIndex - 1][0]))) + 1/2) * (currentPosition[point] - positionData[currentIndex - 1][point]) + positionData[currentIndex - 1][point]));
		}
	}
	return promise;
};

//Updates all animations in the animations object
function animate() {
	//For every animation
	for (let animationIndex = 0; animationIndex < Object.keys(animations).length; animationIndex++) {
		//Get the position data
		let positionData = Object.values(animations)[animationIndex]["positionData"];
		//For every position the object has
		for (let positionIndex = 0; positionIndex < positionData.length; positionIndex++) {
			//Determine the correct position and update the current position accordingly
			if (Object.values(animations)[animationIndex]["currentFrame"] <= positionData[positionIndex][0]) {
				 animations[Object.keys(animations)[animationIndex]]["currentPosition"] = calculatePositions(animationIndex, positionIndex, positionData);
				 break;
			 }
		}
		//Increment the animation frame by 1
		animations[Object.keys(animations)[animationIndex]]["currentFrame"]++;
	}
};

//------------------------------------------------------------------------------------//
//Wordle functions

//Draws user input portion of the wordle game
function displayWordleInput() {
	//For each letter
	for (let letterIndex = 0; letterIndex < word.length; letterIndex++) {
		//Draw an empty box
		draw("CrosswordTile", letterIndex * 75 + 1920/2 - ((word.length/2) * 75), 1080/2 - 200, 75, 75);
		//If the index is not outside the input length
		if (!(letterIndex > wordleInput.length - 1)) {
			//Font choice
			//If alternate font is off
			if (!altFont) {
				//Draw a letter in the default font
				drawLetter(wordleInput[letterIndex], 1920/2 + ((letterIndex - word.length/2) * 75), 1080/2 - 200, 65);
			} else {
				//Draw a letter in the alternate font
				drawCharacter(wordleInput[letterIndex].toUpperCase(), 1920/2 + ((letterIndex - word.length/2) * 75), 1080/2 - 205, 65);
			}
		}
	}
};

//Displays boxes above wordleInput with known letters in them
function displayGreens() {
	//For every letter in the word
	for (let letterIndex = 0; letterIndex < greens.length; letterIndex++) {
		//If high contrast is off
		if (!highContrast) {
			//Draw a green outline
			draw("greenOutline", letterIndex * 75 + 1920/2 - ((greens.length/2) * 75), 1080/2 - 300, 75, 75);
		} else {
			//Draw a blue outline
			draw("blueOutline", letterIndex * 75 + 1920/2 - ((greens.length/2) * 75), 1080/2 - 300, 75, 75);
		}
		//If alternate font is off
		if (!altFont) {
			//Draw a letter in the default font
			drawLetter(greens[letterIndex], 1920/2 + ((letterIndex - word.length/2) * 75), 1080/2 - 300, 65);
		} else {
			//Draw a letter in the alternate font
			drawCharacter(greens[letterIndex].toUpperCase(), 1920/2 + ((letterIndex - word.length/2) * 75), 1080/2 - 305, 65);
		}
	}
};

//Displays keyboard data (status for each letter, "red", "yellow", "green", or "gray")
function displayKeyboardData() {
	if (keyboardDataDisplayShape === "rows") {
		//For every letter in the alphabet
		for (let letterIndex = 0; letterIndex < alphabet.length; letterIndex++) {
			if (button(rowsKeyboardDisplayShape[alphabet[letterIndex]][0], rowsKeyboardDisplayShape[alphabet[letterIndex]][1], 75, 75, "placeholder")) {
				requestLog("letter: " + alphabet[letterIndex]);
				keyPressedThisFrame = alphabet[letterIndex];
			}
			//If the letter's status is gray
			if (keyboardData[alphabet[letterIndex]] === "gray") {
				//Draw a gray square
				draw("graySquare", rowsKeyboardDisplayShape[alphabet[letterIndex]][0], rowsKeyboardDisplayShape[alphabet[letterIndex]][1], 75, 75);	
			} else if (keyboardData[alphabet[letterIndex]] === "green") {
				//If the letter's status is green
				//If high contrast is off
				if (!highContrast) {
					//Draw a green square
					draw("greenSquare", rowsKeyboardDisplayShape[alphabet[letterIndex]][0], rowsKeyboardDisplayShape[alphabet[letterIndex]][1], 75, 75);
				} else {
					//If high contrast is on
					//Draw a blue square
					draw("blueSquare", rowsKeyboardDisplayShape[alphabet[letterIndex]][0], rowsKeyboardDisplayShape[alphabet[letterIndex]][1], 75, 75);
				}
			} else if (keyboardData[alphabet[letterIndex]] === "yellow") {
				//If the letter's status is yellow
				//Draw a yellow square
				draw("yellowSquare", rowsKeyboardDisplayShape[alphabet[letterIndex]][0], rowsKeyboardDisplayShape[alphabet[letterIndex]][1], 75, 75);	
			} else if (keyboardData[alphabet[letterIndex]] === "red") {
				//If the letter's status is red
				//Draw a red square
				draw("redSquare", rowsKeyboardDisplayShape[alphabet[letterIndex]][0], rowsKeyboardDisplayShape[alphabet[letterIndex]][1], 75, 75);
			}
			//Draw a gray outline
			draw("grayOutline", rowsKeyboardDisplayShape[alphabet[letterIndex]][0] - 1, rowsKeyboardDisplayShape[alphabet[letterIndex]][1] - 1, 77, 77);
			//If alternate font is off
			if (!altFont) {
				//Draw a letter in the default font
				drawLetter(alphabet[letterIndex], rowsKeyboardDisplayShape[alphabet[letterIndex]][0], rowsKeyboardDisplayShape[alphabet[letterIndex]][1], 65);
			} else {
				//Draw a letter in the alternate font
				drawCharacter(alphabet[letterIndex].toUpperCase(), rowsKeyboardDisplayShape[alphabet[letterIndex]][0], rowsKeyboardDisplayShape[alphabet[letterIndex]][1] - 5, 65);
			}
		}
	}
};

//Displays yellow letters under the user input
function displayYellows() {
	//Create toDisplay list to store rows of yellows that we want to display
	let toDisplay = [];
	//Add to toDisplay by reading yellows
	for (let i = 0; i < Object.keys(yellows).length; i++) {
		toDisplay.push(yellows[Object.keys(yellows)[i]]);
	}
	/*
	//reorder toDisplay in descending order by length
	progress = 0;
	temp = null;
	for (let i = 0; i < toDisplay.length; i++) {
		//prevents index out of range error
		if (i > 0) {
			//if previous item's length is less than the current item's
			if (toDisplay[i].length > toDisplay[i - 1].length) {
				temp = toDisplay[i];
				toDisplay[i] = toDisplay[i - 1];
				toDisplay[i - 1] = temp;
				progress = i;
				i -= 2
			} else if (progress > i) {
				i = progress;
			}
		}
	}
	*/
	//For each row of toDisplay
	for (let i = 0; i < toDisplay.length; i++) {
		//For each position in the row
		for (let j = 0; j < toDisplay[i].length; j++) {
			//If there is a letter in that position
			if (toDisplay[i][j] != "") {
				//Draw a yellow outline
				draw("yellowOutline", j * 75 + 1920/2 - ((greens.length/2) * 75), 1080/2 - 100 + 80 * i, 75, 75);
				//If alternate font is off
				if (!altFont) {
					//Draw a letter in the default font
					drawLetter(toDisplay[i][j], 1920/2 + ((j - word.length/2) * 75), 1080/2 - 100 + 80 * i, 65);
				} else {
					//Draw a letter in the alternate font
					drawCharacter(toDisplay[i][j].toUpperCase(), 1920/2 + ((j - word.length/2) * 75), 1080/2 - 105 + 80 * i, 65);
				}
			}
		}
	}
};

//Clears yellows if they are empty and or under greens
function clearYellows() {
	//For each letter
	for (let letterIndex = 0; letterIndex < word.length; letterIndex++) {
		//If there is a green there
		if (greens[letterIndex] !== "") {
			//If there are no more of that letter to be found
			if (countLetter(greens.toString(), word[letterIndex]) === countLetter(word, word[letterIndex])) {
				//Delete any yellows associated with that green
				delete yellows[word[letterIndex]];
				//Set it to green in keyboardData
				keyboardData[word[letterIndex]] = "green";
			}
			//For each row of yellows
			for (let yellowIndex = 0; yellowIndex < Object.keys(yellows).length; yellowIndex++) {
				//Set the yellow at that position to an empty string
				//STUPID x 2
				yellows[Object.keys(yellows)[yellowIndex]][letterIndex] = "";
			}
		}
	}
	//For each row of yellows
	for (let yellowIndex = 0; yellowIndex < Object.keys(yellows).length; yellowIndex++) {
		//If that row is empty
		if (yellows[Object.keys(yellows)[yellowIndex]].toString() === emptyYellow.toString()) {
			//Delete the empty row
			delete yellows[Object.keys(yellows)[yellowIndex]];
		}
	}
}

//Updates wordle data
function updateWordleData() {
	//While wordleInput is too long
	while (wordleInput.length > word.length) {
		//Remove the excess characters
		del(wordleInput, word.length);
	}
	//Create inputted word variable
	inputtedWord = wordleInput.join("");
	//If the word is acceptable (is contained in the word list)
	if (wordList.includes(inputtedWord)) {
		//Update keyboardData
		//Increment guesses (used for score calculation)
		guesses++;
		//For each letter in the user's input at index i
		for (let i = 0; i < wordleInput.length; i++) {
			//If the letter is correct
			if (word[i] == wordleInput[i]) {
				//The letter is in the right position
				//Set that position in greens to the letter
				greens[i] = word[i];
				//Set that location in crosswordData to be shown
				if (hitboxPressed[3] === 1) {
					//Since the word is horizontal, calculate position accordingly and replace status with "+" (shown)
					crosswordData[hitboxPressed[1]][hitboxPressed[0] + i] = "+" + crosswordData[hitboxPressed[1]][hitboxPressed[0] + i][1];
				} else {
					//Since the word is vertical, calculate position accordingly and replace status with "+" (shown)
					crosswordData[hitboxPressed[1] + i][hitboxPressed[0]] = "+" + crosswordData[hitboxPressed[1] + i][hitboxPressed[0]][1];
				}
				//if there are no more of that letter to be found
				if (countLetter(greens.toString(), wordleInput[i]) == countLetter(word, wordleInput[i])) {
					//Set the letter's status in keyboardData to green
					keyboardData[wordleInput[i]] = "green";
				} else {
					//Since there are more of that letter to be found
					//Set the letter's status in keyboardData to yellow
					keyboardData[wordleInput[i]] = "yellow";
					//If yellows[wordleInput[i]] does not exist, initiate it
					try {
						temp = yellows[wordleInput[i]].length;
					} catch(err) {
						yellows[wordleInput[i]] = [...emptyYellow];
					}
					//If that column is not already occupied by a green
					if (greens[i] === "") {
						//Occupy it with a yellow
						yellows[wordleInput[i]][i] = wordleInput[i];
					}
				}
			} else {
				//The letter is not in the right position
				if (word.includes(wordleInput[i])) {
					//The letter is included in the word, but is not in the right position
					//If the letter is not already green
					if (!(keyboardData[wordleInput[i]] === "green")) {
						//Since there are more of that letter to be found
						//Set the letter's status to yellow
						keyboardData[wordleInput[i]] = "yellow";
						//If yellows[wordleInput[i]] does not exist, initiate it
						try {
							temp = yellows[wordleInput[i]].length;
						} catch(err) {
							yellows[wordleInput[i]] = [...emptyYellow];
						}
						//If that column is not already occupied by a green
						if (greens[i] === "") {
							//Occupy it with a yellow
							yellows[wordleInput[i]][i] = wordleInput[i];
						}
					}
				} else {
					//The letter is not contained in the word
					//Set the letter's status to red
					keyboardData[wordleInput[i]] = "red";
				}
			}
		}
		//If the user is in a multiplayer game
		if (playState === "coopCrossword") {
			//Send a hitbox update to the server
			hitboxUpdate(currentRoom, hitboxPressedIndex, hitboxes[hitboxPressedIndex]);
		}
		//Clear wordleInput
		wordleInput = [];
	} else {
		//The word isn't real
		//For each letter
		for (let letterIndex = 0; letterIndex < word.length; letterIndex++) {
			//Add a red flashing animation
			addAnimation("redFlash" + letterIndex.toString(), "redFlash", letterIndex * 75 + 1920/2 - ((word.length/2) * 75), 1080/2 - 200, 75, 75);
		}
	}
};

//Simulates wordle portion of game
function simulateWordle() {
	//If the multiplayer data has been updated
	if (serverEvent === "crosswordDataUpdate") {
		//Check the received data for any new data
		coopWordleCheck();
	}
	if (hitboxes[hitboxPressedIndex].length === 6) {
		hitboxes[hitboxPressedIndex].push(keyboardData);
		hitboxes[hitboxPressedIndex].push(yellows);
	}
	displayKeyboardData();
	//Collect the user's key presses
	collectKeyPresses();
	let enterPressed = false;
	//If the wordle input is too long
	if (wordleInput.length > word.length) {
		//If the most recent input is the enter key
		if (wordleInput[word.length] === "enter") {
			//Update the wordle data
			updateWordleData();
			enterPressed = true;
		}
	}
	//Clear yellows
	clearYellows();
	//Draw wordle elements
	displayWordleInput();
	displayGreens();
	displayYellows();
	//If the inputted word is equal to the word and enter has been pressed
	if (inputtedWord === word && enterPressed) {
		//The wordle is won
		//Update hitboxes to display that the word is found
		hitboxes[hitboxPressedIndex][5] = true;
		//For each letter in a horizontal hitbox
		for (let i = 0; i < hitboxPressed[2]; i++) {
			//Change that letter's status to "+" (shown)
			crosswordData[hitboxPressed[1]][hitboxPressed[0] + i] = "+" + crosswordData[hitboxPressed[1]][hitboxPressed[0] + i][1];
		}
		//For each letter in a vertical hitbox
		for (let i = 0; i < hitboxPressed[3]; i++) {
			//Change that letter's status to "+" (shown)
			crosswordData[hitboxPressed[1] + i][hitboxPressed[0]] = "+" + crosswordData[hitboxPressed[1] + i][hitboxPressed[0]][1];
		}
		//If the user is in a multiplayer game
		if (playState === "coopCrossword") {
			//Send a hitbox deselection to the server
			hitboxDeselected(currentRoom);
		}
		//If the user is in the help menu
		if (playState === "help") {
			//Increment the help page
			howToPlayPage++;
		}
		//Return gameState to the playState
		gameState = playState;
	}
	//If the user is in a multiplayer game
	if (playState === "coopCrossword") {
		//Check for changes in crosswordData and send updates to server if necessary
		checkCoopCrossword();
	}
	//If the user is a developer
	if (clientData["userData"]["developer"]) {
		//Display the cheat button
		if (button(1920/2 + 450, 1080/2 - 300, 160, 160, "cog")) {
			//Fill greens
			greens = word.split("");
		}
	}
};

//Checks crosswordData and changes greens and yellows to match it
function checkCrosswordData() {
	//If the hitbox is horizontal
	if (hitboxPressed[3] === 1) {
		//For each letter in the word
		for (let i = 0; i < word.length; i++) {
			//If the letter should be shown according to crosswordData
			if (crosswordData[hitboxPressed[1]][hitboxPressed[0] + i][0] === "+") {
				//Append it to greens
				greens.push(word[i]);
				//If all instances of that letter in the word have been found
				if (countLetter(greens.toString(), word[i]) == countLetter(word, word[i])) {
					//Set that letter's status to green
					keyboardData[word[i]] = "green";
				} else {	
					//Set that letter's status to yellow
					keyboardData[word[i]] = "yellow";
				}
			} else {
				//Append an empty string to greens
				greens.push("");	
			}
		}
	} else {
		//The word is vertical
		//For each letter in the word
		for (let i = 0; i < word.length; i++) {
			//If that letter should be shown according to crosswordData
			if (crosswordData[hitboxPressed[1] + i][hitboxPressed[0]][0] === "+") {
				//Append it to greens
				greens.push(word[i]);
				//If all instances of that letter in the word have been found
				if (countLetter(greens.toString(), word[i]) == countLetter(word, word[i])) {
					//Set that letter's status to green
					keyboardData[word[i]] = "green";
				} else {
					//Set that letter's status to yellow
					keyboardData[word[i]] = "yellow";
				}
			} else {
				//Append an empty string to greens
				greens.push("");	
			}
		}
	}
};

//Checks crosswordData upon a coop crossword update (serverEvent = crosswordDataUpdate) and fills in greens/yellows accordingly
function coopWordleCheck() {
	//If the word is horizontal
	if (hitboxPressed[3] === 1) {
		//For each letter in the word
		for (let i = 0; i < word.length; i++) {
			//If that letter should be shown according to crosswordData
			if (crosswordData[hitboxPressed[1]][hitboxPressed[0] + i][0] === "+") {
				//Set the green value to the letter at that index
				greens[i] = word[i];
				//If all instances of that letter in the word have been found
				if (countLetter(greens.toString(), word[i]) == countLetter(word, word[i])) {
					//Set that letter's status to green
					keyboardData[word[i]] = "green";
				} else {
					//Set that letter's status to yellow
					keyboardData[word[i]] = "yellow";
				}
			}
		}
	} else {
		//The word is vertical
		//For each letter in the word
		for (let i = 0; i < word.length; i++) {
			//If that letter should be shown according to crosswordData
			if (crosswordData[hitboxPressed[1] + i][hitboxPressed[0]][0] === "+") {
				//Set the green value to the letter at that index
				greens[i] = word[i];
				//If all instances of that letter in the word have been found
				if (countLetter(greens.toString(), word[i]) == countLetter(word, word[i])) {
					//Set that letter's status to green
					keyboardData[word[i]] = "green";
				} else {
					//Set that letter's status to yellow
					keyboardData[word[i]] = "yellow";
				}
			}
		}
	}
};

//Initalizes the wordle data
function initWordle() {
	//Reset wordle data
	resetData("wordle");
	//hitboxPressed is the hitbox that was clicked and defined when gamestate is changed
	word = hitboxPressed[4];
	//If the user is not in the help menu
	if (playState !== "help") {
		//Assign hitboxPressedIndex
		hitboxPressedIndex = hitboxes.indexOf(hitboxPressed);
	} else {
		//Manually assign hitboxPressedIndex
		hitboxPressedIndex = 2;
	}
	//Set up emptyYellow
	//For each letter in the word
	for (let i = 0; i < word.length; i++) {
		//Append an empty string to emptyYellow
		emptyYellow.push("");
	}
	//Check crossword data in order to import any previous progress, also sets up greens
	checkCrosswordData();
	//Clear wordleInput
	wordleInput = [];
	//These are linked together, a change to either changes both
	if (hitboxes[hitboxPressedIndex].length > 6) {
		keyboardData = hitboxes[hitboxPressedIndex][6];
		yellows = hitboxes[hitboxPressedIndex][7];
	}
	//If the user is not in the help menu
	if (playState !== "help") {
		//Send the user to the wordle gamestate
		gameState = "wordle";
	} else {
		//Send the user to the wordle page of the help menu
		howToPlayPage = 3;
		gameState = "help";
	}
};

//Overwrites select parts of keyboardData
function overwriteKeyboardData(newData, hitboxIndex) {
	let keyboardValues = Object.values(keyboardData);
	let newKeyboardValues = Object.values(newData);
	//For each value in the keyboardData
	for (let i = 0; i < keyboardValues.length; i++) {
		//If the value is more up to date
		if (keyboardValues[i] !== newKeyboardValues[i] && (keyboardValues[i] === "gray" || (keyboardValues[i] === "yellow" && newKeyboardValues[i] === "green"))) {
			//Overwrite the old value with the new
			hitboxes[hitboxIndex][6][Object.keys(keyboardData)[i]] = newKeyboardValues[i];
		}
	}
};

//Adds newYellows to yellows
function addYellows(newYellows, hitboxIndex) {
	//For each row of the new yellows
	for (let i = 0; i < Object.keys(newYellows).length; i++) {
		//Overwrite the old yellows
		hitboxes[hitboxIndex][7][Object.keys(newYellows)[i]] = newYellows[Object.keys(newYellows)[i]];
	}
};

//------------------------------------------------------------------------------------//
//Music Functions

//Plays random music when enabled
function playMusic() {
	//If the user has enabled music
	if (musicPlaying) {
		//If there is no music playing
		if (mainMusic.paused && calm2.paused && music1.paused) {
			//Choose a new random songIndex
			let randomInt = songIndex;
			while (randomInt === songIndex) {
				songIndex = randint(1,3);
			}
			//Play the chosen song
			if (songIndex === 1) {
				mainMusic.play();
			} else if (songIndex === 2) {
				calm2.play();
			} else if (songIndex === 3) {
				music1.play();
			}
		}
	}
}

//Lets user adjust volume and start/stop music
function musicControls(x, y){
	//If the user has enabled music
	if (musicPlaying) {
		draw("musicEnabled", x, y, 100, 100, true, true);
	} else {
		//The user has disabled music
		draw("musicDisabled", x, y, 100, 100, true, true);
	}
	//Toggles musicPlaying on and off
	if (button(x, y, 100, 100, "none", true)) {
		if (musicPlaying) {
			mainMusic.pause();
			mainMusic.currentTime = 0;
			calm2.pause();
			calm2.currentTime = 0;
			music1.pause();
			music1.currentTime = 0;
			musicPlaying = false;
		} else {
			musicPlaying = true;
		}
	}
	//If the user has enabled music
	if (musicPlaying) {
		//Display volume controls
		//If the minus is clicked
		if (button(x - 50, y + 100, 50, 50, "minus", true) && mainMusic.volume > 0.05) {
			//Lower music volume
			mainMusic.volume -= 0.05;
			calm2.volume -= 0.05;
			music1.volume -= 0.05;
		}
		//If the plus is clicked
		if (button(x + 50, y + 100, 50, 50, "plus", true) && mainMusic.volume < 0.95) {
			//Raise music volume
			mainMusic.volume += 0.05;
			calm2.volume += 0.05;
			music1.volume += 0.05;
		}
	}
};

//------------------------------------------------------------------------------------//
//Game State Functions

//Menus

function gameStateMainMenu() {
	//Game Title
	draw("banner", 960, 235, 781.25, 208);
	//Play button
	if (button(960, 500, 500, 180, "play")) {
		gameState = "gameSelect";
	}
	//Leaderboard button
	if (button(960, 700, 500, 180, "leaderboard")) {
		requestLeaderboardData();
		gameState = "leaderboard";
	}
	//How to play button
	if (button(960, 900, 500, 180, "howToPlay")) {
		howToPlayPage = 1;
		CES = 50;
		assignHTPData();
		playState = "help";
		gameState = "help";
	}
	if (host) {
		host = false;
	}
};

function gameStateGameSelect() {
	//Singleplayer button
	if (button(1920/2, 1080/2 - 250, 500, 180, "solo")) {
		gameState = "difficultySelect";
	}
	//Host server button
	if (button(1920/2, 1080/2, 500, 180, "hostServer")) {
		gameState = "initHosting";
	}
	//Join server button
	if (button(1920/2, 1080/2 + 250, 500, 180, "serverSelect")) {
		gameState = "initServerRequest";
	}
	//Back button
	if (button(125, 75, 200, 100, "back")) {
		gameState = "mainMenu";
	}
};

function gameStateDifficultySelect() {
	//Easy button
	if (button(1920/2, 1080/2 - 300, 500, 150, "easy")) {
		selectedDifficulty = "easy";
		gameState = "initSoloCrossword";
	}
	//Medium button
	if (button(1920/2, 1080/2 - 100, 500, 150, "medium")) {
		selectedDifficulty = "medium";
		gameState = "initSoloCrossword";
	}
	//Hard button
	if (button(1920/2, 1080/2 + 100, 500, 150, "hard")) {
		selectedDifficulty = "hard";
		gameState = "initSoloCrossword";
	}
	//Custom button
	if (button(1920/2, 1080/2 + 300, 500, 150, "custom")) {
		selectedDifficulty = "custom"; 
		gameState = "customDifficulty";
	}
	//Back button
	if (button(125, 75, 200, 100, "back")) {
		gameState = "gameSelect";
	}
};

function gameStateCustomDifficulty() {
	//Word count slider, text, and marker
	drawTextBox(1920/2, 1080/2 - 300, 500, 25);
	draw("sliderMarker", 1920/2 - 250 + (customWordCount - 4) * 500/46, 1080/2 - 300, 18, 70);
	drawText("word count", 1920/2 - "word count".length/2 * 50, 1080/2 - 400);
	drawText(Math.round(customWordCount).toString(), 1920/2 - 315, 1080/2 - 317, 33, "character");

	//Min word length slider, text, and marker
	drawTextBox(1920/2, 1080/2 - 75, 500, 25);
	draw("sliderMarker", 1920/2 - 250 + (customWordLength[0] - 3) * 500/9, 1080/2 - 75, 18, 70);
	drawText("minimum word length", 1920/2 - "minimum word length".length/2 * 50, 1080/2 - 100 - 75);
	drawText(Math.round(customWordLength[0]).toString(), 1920/2 - 315, 1080/2 - 17 - 75, 33, "character");

	//Max word length slider, text, and marker
	drawTextBox(1920/2, 1080/2 + 150, 500, 25);
	draw("sliderMarker", 1920/2 - 250 + (customWordLength[1] - 3) * 500/9, 1080/2 + 150, 18, 70);
	drawText("maximum word length", 1920/2 - "maximum word length".length/2 * 50, 1080/2 + 50);
	drawText(Math.round(customWordLength[1]).toString(), 1920/2 - 315, 1080/2 - 17 + 150, 33, "character");

	//Generate button
	if (button(1920/2, 1080/2 + 360, 450, 100, "generate")) {
		difficulty["custom"] = [customWordLength, customWordCount];
		gameState = "initSoloCrossword";
	}
	//If the user is a developer
	if (clientData["userData"]["developer"]) {
		//Developer giant crossword button
		if (button(1920/2 + 450, 1080/2 - 300, 160, 160, "cog")) {
			customWordCount = 2500;
		}
	}
	//Back button
	if (button(125, 75, 200, 100, "back")) {
		gameState = "difficultySelect";
	}
};

function calculateCustomDifficulty() {
	//If the word count slider is being dragged
	if (slider(1920/2, 1080/2 - 300, 500, 100, "none")) {
		//Calculate custom word count
		customWordCount = findSliderOutput(960, 500) * 46 + 4;
	} else {
		//Since the word count slider is not being dragged, round the value
		customWordCount = Math.round(customWordCount);
	}
	//If the min word length slider is being dragged
	if (slider(1920/2, 1080/2 - 75, 500, 100, "none")) {
		//Calculate minimum word length
		customWordLength[0] = findSliderOutput(960, 500) * 9 + 3;
	} else {
		//Since the min word length slider is not being dragged, round the value
		customWordLength[0] = Math.round(customWordLength[0]);
		//If the minimum is greater than the maximum
		if (customWordLength[0] > customWordLength[1]) {
			//Snap the minimum to the maximum
			customWordLength[0] = Math.round(customWordLength[1]);
		}
	}
	//If the maximum word length slider is being dragged
	if (slider(1920/2, 1080/2 + 150, 500, 100, "none")) {
		//Calculate maximum word length
		customWordLength[1] = findSliderOutput(960, 500) * 9 + 3;
	} else {
		//Since the maximum word length slider is not being dragged, round the value
		customWordLength[1] = Math.round(customWordLength[1]);
		//If the maximum is less than than the minimum
		if (customWordLength[1] < customWordLength[0]) {
			//Snap the maximum to the minimum
			customWordLength[1] = Math.round(customWordLength[0]);
		}
	}
};

function gameStateSignIn() {
	//Draw the create account portion on left side of the screen
	drawCreateAccount();
		
	//Draw a separator line in center of screen
	draw("seperatorBar_orange-gold", 960, 540, 10, 920);
		
	//Draw the login portion on right side of screen
	drawLogin();

	//Log User Input, 20 char max at size 33
	if (collectInput) {logInput();}

	//When create button is pressed
	if (button(500, 850, 240, 100, "create") && textboxData["createUsername"].join("") !== "" && textboxData["createPassword"].join("") !== "") {
		//Alert the server of account creation
		createAccount(textboxData["createUsername"].join(""), textboxData["createPassword"].join(""));
		collectInput = false;
	}

	//When login button is pressed
	if (button(1420, 850, 240, 100, "login") && textboxData["loginUsername"].join("") !== "" && textboxData["loginPassword"].join("") !== "") {
		//Alert the server of the login request
		requestLogin(textboxData["loginUsername"].join(""), textboxData["loginPassword"].join(""));
		collectInput = false;
	}
	
	//When different text boxes on the screen are selected select them
	loginTextBoxSelection();
	//Server Event listeners for account creation and login
	if (serverEvent === "accountCreated") {
		//Update client data
		clientData["username"] = textboxData["createUsername"].join("");
		sendUsername();
		gameState = "mainMenu";
	}
	
	if (serverEvent === "loggedIn") {
		//Update client data
		clientData["username"] = textboxData["loginUsername"].join("");
		sendUsername();
		gameState = "mainMenu";
	}
	//If there is an issue with the user's login credentials, reenable input collection
	if (serverError === "usernameInUse") {
		collectInput = true;
	}
	if (serverError === "incorrectPassword") {
		collectInput = true;
	}
	if (serverError === "usernameUndefined") {
		collectInput = true;
	}
	//Back button
	if (button(125, 75, 200, 100, "back")) { gameState = "mainMenu"; }
};

function displaySignIn() {
	//If the user is not signed in
	if (clientData["username"] === "guest") {
		//Sign in button
		if (button(1750, 65, 250, 75, "signIn") && (clientData["userData"] === {} || clientData["username"] === "guest")) {
			gameState = "signIn";
		}
	} else {
		//Display username
		drawTextBox(2050 - (clientData["username"].length + 2) * 33, 65, (clientData["username"].length + 2) * 33)
		drawText(clientData["username"], 2050 - ((clientData["username"].length + 2) + (clientData["username"].length + 2)/2) * 33 + 20, 50, 33, "character");
	}
};

function gameStateLeaderboard() {
	//Bounding box
	draw("chatBox", 1920/2, 1080/2, 850, 990);
	drawText("leaderboard", 1920/2 - ("leaderboard".length * 50) / 2, 90, 50, "letter");
	draw("chatBoxBar", 1920/2, 175, 850 - 16, 6);
	//For each user on the leaderboard
	for (let i = 0; i < leaderboardData["order"].length && i <= 20; i++) {
		//Draw placement and username text
		drawText("#" + (i + 1).toString() + " " + leaderboardData["order"][i] + ":", 545, 200 + i * 40, 25, "character");
		//Draw score
		drawText(leaderboardData[leaderboardData["order"][i]].toString(), 1370 - leaderboardData[leaderboardData["order"][i]].toString().length * 25, 200 + i * 40, 25, "character");
	}
	//Back button
	if (button(125, 75, 200, 100, "back")) { gameState = "mainMenu";}
};

function gameStateHelp() {
	if (howToPlayPage === 1) {
		//Display page one's instruction image
		draw("howToPlay1", 1920/2, 1080/2 - 200, 1416/(3/2), 712/(3/2));
		//Display example crossword
		displayCrossword(1920/2 + 25, 1080-300);
	} else if (howToPlayPage === 2) {
		//Display page two's instruction image
		draw("howToPlay2", 1920/2, 1080/2 - 50, 1416/(1), 850/(1));
		//Continue button
		if (button(1920/2, 1080-150, 450, 120, "continue")) {
			//Artificially initialize the wordle
			assignHTPData();
			gameState = "initWordle";
			//assign hitboxPressed
			hitboxPressed = [4,7,6,1,"slider",false,{"a":"red","b":"red","c":"red","d":"green","e":"gray","f":"gray","g":"gray","h":"red","i":"yellow","j":"gray","k":"gray","l":"yellow","m":"gray","n":"red","o":"red","p":"gray","q":"gray","r":"yellow","s":"green","t":"gray","u":"red","v":"gray","w":"gray","x":"gray","y":"gray","z":"red"},{"i":["","i","","","",""],"r":["","r","","","r",""]}];
		}
	} else if (howToPlayPage === 3) {
		//display page three's instruction images
		draw("howToPlayIntro", 1920/2, 1080/2 - 450, 964/(2/2), 184/(2/2));
		draw("howToPlayGreens", 1920/2 + 450, 1080/2 - 300, 822/(3/2), 249/(3/2));
		draw("howToPlayInput", 1920/2 + 460, 1080/2 - 200, 812/(3/2), 59/(3/2));
		draw("howToPlayYellows", 1920/2 + 530, 1080/2 + 300, 1328/(3/2), 556/(3/2));
		draw("howToPlayLetterDict", 1920/2 - 645, 1080/2 + 390, 1328/(4/2), 556/(4/2));
		//Display example wordle
		simulateWordle();
		//If the user has not input anything
		if (wordleInput == 0 && JSON.stringify(keyboardData) === JSON.stringify({"a":"red","b":"red","c":"red","d":"green","e":"gray","f":"gray","g":"gray","h":"red","i":"yellow","j":"gray","k":"gray","l":"yellow","m":"gray","n":"red","o":"red","p":"gray","q":"gray","r":"yellow","s":"green","t":"gray","u":"red","v":"gray","w":"gray","x":"gray","y":"gray","z":"red"})) {
			//Draw input instructions
			draw("howToPlayGuess", 1920/2 + 500, 1080/2, 964/(3/2), 184/(3/2));
		}
	} else if (howToPlayPage === 4) {
		//Display finished example crossword
		displayCrossword(1920/2 + 25, 1080-400);
		//Display page four's instruction image
		draw("howToPlayCongratulations", 1920/2, 1080/2 - 200, 964/(1/2), 184/(1/2));
		//Continue button
		if (button(1920/2, 1080 - 150, 450, 120, "continue")) {
			howToPlayPage++;
		}
	} else if (howToPlayPage === 5) {
		//Display page five's instruction image
		draw("keybinds", 1920/2, 1080/2 - 100, 1096 * 3/2, 432 * 3/2);
		//Done button
		if (button(1920/2, 1080 - 150, 200, 100, "done")) {
			gameState = "mainMenu";
		}
	}
	//Back button
	if (button(125, 75, 200, 100, "back")) { 
		if (howToPlayPage > 0) {
			howToPlayPage--;
		} 
		if (howToPlayPage === 0) {
			//Leave the help menu
			crosswordData = [];
			hitboxes = [];
			playState = "";
			gameState = "mainMenu";
		}
		if (howToPlayPage === 1) {
			//Reassign example crossword data
			assignHTPData();
		}
		if (howToPlayPage === 3) {
			//Reinitialize the example wordle
			assignHTPData();
			gameState = "initWordle";
			//assign hitboxPressed
			hitboxPressed = [4,7,6,1,"slider",false,{"a":"red","b":"red","c":"red","d":"green","e":"gray","f":"gray","g":"gray","h":"red","i":"yellow","j":"gray","k":"gray","l":"yellow","m":"gray","n":"red","o":"red","p":"gray","q":"gray","r":"yellow","s":"green","t":"gray","u":"red","v":"gray","w":"gray","x":"gray","y":"gray","z":"red"},{"i":["","i","","","",""],"r":["","r","","","r",""]}];
		}
	}
};

//Assigns tutorial crossword data
function assignHTPData() {
	crosswordData = 
[["//","//","//","//","//","//","//","//","//","//","//","//","//","//","//"],["//","//","//","//","//","//","//","//","//","//","//","//","//","//","//"],["//","//","//","//","//","//","//","//","//","//","//","//","//","//","//"],["//","//","//","//","//","//","//","-/","//","//","//","//","//","//","//"],["//","//","//","//","//","//","-/","+w","-/","//","//","//","//","//","//"],["//","//","//","//","-/","+c","+r","+o","+s","+s","-/","//","//","//","//"],["//","//","//","//","+a","-/","-/","+r","-/","//","//","//","//","//","//"],["//","//","//","-/","+s","-l","-i","+d","-e","-r","-/","//","//","//","//"],["//","//","//","//","+h","-/","-/","+l","-/","//","//","//","//","//","//"],["//","//","//","//","+e","//","//","+e","//","//","//","//","//","//","//"],["//","//","//","//","+s","//","//","-/","//","//","//","//","//","//","//"],["//","//","//","//","-/","//","//","//","//","//","//","//","//","//","//"],["//","//","//","//","//","//","//","//","//","//","//","//","//","//","//"],["//","//","//","//","//","//","//","//","//","//","//","//","//","//","//"],["//","//","//","//","//","//","//","//","//","//","//","//","//","//","//"]];
		hitboxes = [[5,5,5,1,"cross",true,{"a":"green","b":"gray","c":"gray","d":"gray","e":"green","f":"gray","g":"green","h":"gray","i":"gray","j":"gray","k":"gray","l":"green","m":"gray","n":"green","o":"gray","p":"gray","q":"gray","r":"gray","s":"gray","t":"gray","u":"gray","v":"gray","w":"gray","x":"gray","y":"gray","z":"gray"},{}],[7,4,1,6,"wordle",true,{"a":"green","b":"gray","c":"gray","d":"gray","e":"green","f":"green","g":"gray","h":"gray","i":"gray","j":"gray","k":"gray","l":"gray","m":"gray","n":"gray","o":"gray","p":"gray","q":"gray","r":"green","s":"gray","t":"green","u":"gray","v":"gray","w":"gray","x":"gray","y":"gray","z":"gray"},{}],[4,7,6,1,"slider",false,{"a":"red","b":"red","c":"red","d":"green","e":"gray","f":"gray","g":"gray","h":"red","i":"yellow","j":"gray","k":"gray","l":"yellow","m":"gray","n":"red","o":"red","p":"gray","q":"gray","r":"yellow","s":"green","t":"gray","u":"red","v":"gray","w":"gray","x":"gray","y":"gray","z":"red"},{"i":["","i","","","",""],"r":["","r","","","r",""]}],[4,6,1,5,"ashes",true,{"a":"green","b":"gray","c":"gray","d":"gray","e":"green","f":"gray","g":"gray","h":"green","i":"gray","j":"gray","k":"gray","l":"gray","m":"gray","n":"gray","o":"gray","p":"gray","q":"gray","r":"gray","s":"green","t":"gray","u":"gray","v":"gray","w":"gray","x":"gray","y":"gray","z":"gray"},{}]];
};

function gameStateWin() {
	//If the game has been scored
	if (score !== 0) {
		//Display the user's score
		drawText(score.toString(), 1920/2 - (score.toString()).length/2 * 66, 1080/2 + 50, 66, "character");
	} else {
		//Display unsupported gamemode alert
		drawText("Your gamemode does not support scoring.", 1920/2 - "Your gamemode does not support scoring.".length/2 * 25, 1080/2, 25);
	}
	//Draw visual elements
	draw("confettiRight", 450/2, 450/2, 450, 450);
	draw("confettiLeft", 1920 - 450/2, 450/2, 450, 450);
	draw("congratulations", 1920/2, 1080/2 - 300, 1000, 240);
	draw("yourscore", 1920/2, 1080/2 - 60, 1000, 240);
	/*if (button(760, 840, 450, 120, "placeholder")) {
		gameState = "showcase";
	}*/
	//Continue button
	if (button(1920/2, 840, 450, 120, "continue")) {
		resetData("crossword");
		//If it was a solo game
		if (playState === "soloCrossword") {
			gameState = "mainMenu";
		} else if (playState === "coopCrossword") {
			//Send users to their respective gamestates
			if (host) {
				gameState = "hosting";
			} else {
				gameState = "initLobby";
			}
		}
		//Reset score
		score = 0;
	}
};

//Display escape popup
function escapePopup() {
	//If the escape popup is toggled on
	if (escapeKey) {
		//Draw the background
		draw("chatBox", 1920/2, 1080/2, 600, 600);
		//Draw music controls
		musicControls(1920/2 - 170, 1080/2 - 190);
		//Draw the high contrast text and toggle
		drawText("high contrast", 1920/2 + 120 - "high contrast".length/2 * 20, 1080/2 - 270, 20);
		if (button(1920/2 + 120, 1080/2 - 210, 130, 30, "sliderBackground", true)) {
			highContrast = !highContrast;
			//Animate the toggle
			if (highContrast) {
				addAnimation("contrastToggle", "sliderOn", 1920/2 + 120, 1080/2 - 210, 25, 60, "sinusoidal");
			} else {
				addAnimation("contrastToggle", "sliderOff", 1920/2 + 120, 1080/2 - 210, 25, 60, "sinusoidal");
			}
		}
		
		//Draw the definition tool text and toggle
		drawText("definition tool", 1920/2 + 120 - "definition tool".length/2 * 20, 1080/2 - 165, 20);
		if (button(1920/2 + 120, 1080/2 - 105, 130, 30, "sliderBackground", true)) {
			definitionTool = !definitionTool;
			//Animate the toggle
			if (definitionTool) {
				addAnimation("definitionToggle", "sliderOn", 1920/2 + 120, 1080/2 - 105, 25, 60, "sinusoidal");
			} else {
				addAnimation("definitionToggle", "sliderOff", 1920/2 + 120, 1080/2 - 105, 25, 60, "sinusoidal");
			}
		}

		//Draw the alternate font text and toggle
		drawText("alternate font", 1920/2 + 120 - "alternate font".length/2 * 20, 1080/2 - 65, 20);
		if (button(1920/2 + 120, 1080/2 - 10, 130, 30, "sliderBackground", true)) {
			altFont = !altFont;
			//Animate the toggle
			if (altFont) {
				addAnimation("altFontToggle", "sliderOn", 1920/2 + 120, 1080/2 - 10, 25, 60, "sinusoidal");
			} else {
				addAnimation("altFontToggle", "sliderOff", 1920/2 + 120, 1080/2 - 10, 25, 60, "sinusoidal");
			}
		}

		//Back to main menu button
		if (button(1920/2, 1080/2 + 145, 375, 190, "escape", true)) {
			//If the user is in a multiplayer game and has selected a hitbox
			if (gameState === "wordle" && playState === "coopCrossword") {
				//Deselect the hitbox
				socket.emit("hitboxDeselected", currentRoom);
			}
			//If the user is in a room
			if (currentRoom !== "") {
				//Leave the room
				leaveServer();
			}
			resetData("all");
			gameState = "mainMenu";
			escapeKey = false;
		}
	}
};

//Hosting

function gameStateInitHosting() {
	//Set up hosting variables
	//Have user create server name and password
	resetData("crossword");
	playState = "coopCrossword";
	logInput(17);
	drawCreateServer();
	//Create server button
	if (button(960, 850, 240, 100, "create") && textboxData["serverName"].length > 0) {
		hostServer(clientData["username"], textboxData["serverName"].join(""), textboxData["serverPassword"].join(""));
		serverPassword = textboxData["serverPassword"].join("");
		host = true;
	}
	//Back button
	if (button(125, 75, 200, 100, "back")) { gameState = "gameSelect"; }
};

function gameStateHosting() {
	//Hosting info
	draw("largeDescriptionBox", 570, 728, 1048, 540);
	draw("hostinfo", 570, 728, 1016, 232);

	//Guest list
	draw("descriptionBox", 365, 300, 640, 250);
	drawText("in your room", 65, 200, 25);
	drawText("(" + roomData["users"].length.toString() + ")", 380, 200, 25, "character")
	drawText(roomData["users"].join(" "), 65, 300, 16, "character");

	//Server info
	draw("descriptionBox", 893, 300, 400, 250);
	drawText("Server Name:", 700, 200, 22, "character");
	drawText(currentRoom, 700, 250, 22, "character");
	drawText("Server Password:", 700, 300, 22, "character");
	//If there's a password
	if (serverPassword !== "") {
		//Display the password
		drawText(serverPassword, 700, 350, 22, "character");
	} else {
		//Display "No Password" text
		drawText("No Password", 700, 350, 22, "character");
	}

	//Word count slider, text, and marker
	drawTextBox(1920/1.3, 1080/2 - 300, 500, 25);
	draw("sliderMarker", 1920/1.3 - 250 + (customWordCount - 4) * 500/46, 1080/2 - 300, 18, 70);
	drawText("word count", 1920/1.3 - "word count".length/2 * 33, 1080/2 - 400, 33);
	drawText(Math.round(customWordCount).toString(), 1920/1.3 - 315, 1080/2 - 317, 33, "character");

	//Min word length slider, text, and marker
	drawTextBox(1920/1.3, 1080/2 - 75, 500, 25);
	draw("sliderMarker", 1920/1.3 - 250 + (customWordLength[0] - 3) * 500/9, 1080/2 - 75, 18, 70);
	drawText("minimum word length", 1920/1.3 - "minimum word length".length/2 * 33, 1080/2 - 100 - 75, 33);
	drawText(Math.round(customWordLength[0]).toString(), 1920/1.3 - 315, 1080/2 - 17 - 75, 33, "character");

	//Max word length slider, text, and marker
	drawTextBox(1920/1.3, 1080/2 + 150, 500, 25);
	draw("sliderMarker", 1920/1.3 - 250 + (customWordLength[1] - 3) * 500/9, 1080/2 + 150, 18, 70);
	drawText("maximum word length", 1920/1.3 - "maximum word length".length/2 * 33, 1080/2 + 50, 33);
	drawText(Math.round(customWordLength[1]).toString(), 1920/1.3 - 315, 1080/2 - 17 + 150, 33, "character");

	//Play Button
	if (button(1920/1.3, 1080/2 + 330, 450, 100, "generate")) { 
		//Request the room crossword
		requestRoomCrossword(currentRoom, customWordLength, customWordCount); 
		//Clear data in preparation for the requested crossword
		crosswordData = []; 
		hitboxes = []; 
		addAnimation("pano", "pan", 1920, 1080, 1920*2, 1080*2, "sinusoidal");
		gameState = "loadingCoopCrossword"; 
	}
};

//Calculates hosting sliders
function calculateHosting() {
	//Word count slider
	if (slider(1920/1.3, 1080/2 - 300, 500, 100, "none")) {
		customWordCount = findSliderOutput(1920/1.3, 500) * 46 + 4;
	} else {
		customWordCount = Math.round(customWordCount);
	}
	
	//Min word length slider
	if (slider(1920/1.3, 1080/2 - 75, 500, 100, "none")) {
		customWordLength[0] = findSliderOutput(1920/1.3, 500) * 9 + 3;
	} else {
		customWordLength[0] = Math.round(customWordLength[0]);
		if (customWordLength[0] > customWordLength[1]) {
			customWordLength[0] = Math.round(customWordLength[1]);
		}
	}

	//Max word length slider
	if (slider(1920/1.3, 1080/2 + 150, 500, 100, "none")) {
		customWordLength[1] = findSliderOutput(1920/1.3, 500) * 9 + 3;
	} else {
		customWordLength[1] = Math.round(customWordLength[1]);
		if (customWordLength[1] < customWordLength[0]) {
			customWordLength[1] = Math.round(customWordLength[0]);
		}
	}
};

//Server Selection

function gameStateInitServerRequest() {
	//Reset all server request data and send user to the requestingServers gamestate
	noServers = false;
	requestServers();
	gameState = "requestingServers"; 
};

function serverSearchAnimation() {
	//Draws an animation of 3 appearing dots with text
	if (frames/15 % 3 <= 1) {
		drawText("looking for servers.", 1920/2 - "looking for servers...".length/2 * 50, 1080/2 - 100);
	} else if (frames/15 % 3 <= 2) {
		drawText("looking for servers..", 1920/2 - "looking for servers...".length/2 * 50, 1080/2 - 100);
	} else if (frames/15 % 3 <= 3) {
		drawText("looking for servers...", 1920/2 - "looking for servers...".length/2 * 50, 1080/2 - 100);
	}
};

function gameStateRequestingServers() {
	//Draw text animation
	serverSearchAnimation();
	if (serverError === "noServers") {
		noServers = true;
	}
	//If there are no servers
	if (noServers) {
		//Tell the user
		drawText("it looks like there are no servers.", 1920/2 - "it looks like there are no servers.".length/2 * 50, 1080/2);
		drawText("we will keep looking though.", 1920/2 - "we will keep looking though.".length/2 * 50, 1080/2 + 100);
	} 
	//If there are available servers
	if (Object.keys(availableServers).length !== 0) {
		serverSelected = false
		gameState = "serverSelect";
	}
	//Back button
	if (button(125, 75, 200, 100, "back")) { gameState = "gameSelect";}
};

function gameStateServerSelect() {
	//Display all available servers
	//Upon selection of a server input box with server name and password appears.
	displayAvailableServers();
	//Back button
	if (button(125, 75, 200, 100, "back")) {
		gameState = "gameSelect";
	}
	
	//If there are no available servers
	if (Object.keys(availableServers).length === 0) {
		noServers = true;
		gameState = "requestingServers";
	}

	//If the user has selected a server
	if (serverSelected) {
		//Dislplay the server join popup and allow the user to input data
		logInput();
		drawJoinServer();
		//If an incorrect password was entered
		if (incorrectPassword) {
			//Tell the user the password was wrong
			drawText("Incorrect Password", 1920/2 - "Incorrect Password".length/2 * 25, 1080/2 + 150, 25, "character");
		}
		//If the user clicks off of the box
		if (mouseButtonUp && !button(960, 550, 750, 820, "none")) {
			serverSelected = "";
			incorrectPassword = false;
		}
	}
	
	//If the user has successfully joined a room
	if (serverEvent === "joinedRoom") {
		//Send them to lobby initalization
		gameState = "initLobby";
	} else if (serverError === "incorrectPassword") {
		//If the password was incorrect
		incorrectPassword = true;
	}
};

//Solo Crossword

function gameStateInitSoloCrossword() {
	//Reset all crossword data to avoid errors
	resetData("crossword");
	//
	if (clientData["username"] !== ""){
		sendUserPlay(clientData["username"]);
	}
	requestCrossword(difficulty[selectedDifficulty][0], difficulty[selectedDifficulty][1]);
	playState = "soloCrossword";
	addAnimation("pano", "pan", 1920, 1080, 1920*2, 1080*2, "sinusoidal");
	gameState = "loadingSoloCrossword";
};

function gameStateLoadingSoloCrossword() {
	//if crosswordData and hitboxes are both not empty (data from server recieved)
	if (crosswordData.length !== 0 && hitboxes.length !== 0){
		for (let i = 0; i < hitboxes.length; i++) {
			averageWordLength += hitboxes[i][4].length;
		}
		//Find averageWordLength
		averageWordLength = averageWordLength / hitboxes.length;
		//Save the initial value of ms before the crossword starts
		ms = Date.now();
		//Direct user to the solo crossword gamestate
		delete animations["pano"];
		gameState = "soloCrossword";
	}
};

//Multiplayer Gamestates

function gameStateLobby() {
	//Back button
	if (button(125, 75, 200, 100, "back")) {
		gameState = "mainMenu";
		leaveServer();
	}
};

function gameStateLoadingCoopCrossword() {
	//Tell the user that the crossword is loading
	drawText("loadingcoopcrossword", 1920/2 - "loadingcoopcrossword".length/2 * 50, 1080/2);
	//If the crossword data and hitboxes are not empty, the data from server has been recieved
	if (crosswordData.length !== 0 && hitboxes.length !== 0){
		//create temp data to check for changes in crossword data
		tempData = [];
		for (let rowIndex = 0; rowIndex < crosswordData.length; rowIndex++) {
			tempData.push([...crosswordData[rowIndex]])
		}
		//Delete the pano animation and send the user to the coopCrossword gamestate
		delete animations["pano"];
		gameState = "coopCrossword";
	}
};

function gameStateCoopCrossword() {
	//Display the crossword
	displayCrossword(960, 540);
	//Look for changes in the data and send an update to the server on updates
	checkCoopCrossword();
	//If the user has won
	if (checkWin()) {
		//send them to the win gamestate
		gameState = "win"
	}
};

function gameStateLoadingLobby() {
	//Waits for server to send room data before sending the user to the lobby
	if (Object.keys(roomData).length !== 1) {
		gameState = "lobby";
	}
};

//------------------------------------------------------------------------------------//
//Main Game Function

async function updateGame() {
	//Allow for checking of a gamestate change at the end of the program
	let startingGameState = gameState;

	//Make sure that the canvas covers the whole screen
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	//setup for 16:9 aspect ratio at 1920px * 1080px base
	if (canvas.width / 16 > canvas.height / 9) {
		sizeMult = canvas.height/1080;
		horizontalOffset = (canvas.width / 16 - canvas.height / 9) * 16 / 2;
		verticalOffset = 0;
	} else {
		sizeMult = canvas.width/1920;
		verticalOffset = (canvas.height / 9 - canvas.width / 16) * 9 / 2;
		horizontalOffset = 0;
	}
	switch (gameState) {
		case "mainMenu":
			gameStateMainMenu();
			break;
		case "gameSelect":
			gameStateGameSelect();
			break;
		case "difficultySelect":
			gameStateDifficultySelect();
			break;
		case "customDifficulty":
			gameStateCustomDifficulty();
			break;
		case "initHosting": 
			gameStateInitHosting();
			break;
		case "hosting":
			gameStateHosting();
			break;
		case "initServerRequest":
			gameStateInitServerRequest();
			break;
		case "requestingServers":
			gameStateRequestingServers();
			break;
		case "serverSelect":
			gameStateServerSelect();
			break;
		case "initLobby":
			resetData("crossword");
			playState = "coopCrossword";
			resetData("text");
			addAnimation("pano", "pan", 1920, 1080, 1920*2, 1080*2, "sinusoidal");
			gameState = "loadingLobby";
			break;
		case "loadingLobby":
			gameStateLoadingLobby();
			break;
		case "lobby":
			gameStateLobby();
			break;
		//initalizes any variables used in crossword gamestate
		case "initSoloCrossword":
			gameStateInitSoloCrossword();
			break;
		//displays loading screen while server generates crossword
		case "loadingSoloCrossword":
			gameStateLoadingSoloCrossword();
			break;
		//displays loading screen while server generates coop crossword
		case "loadingCoopCrossword":
			gameStateLoadingCoopCrossword();
			break;
		//displays crossword on screen by calling crossword function
		case "soloCrossword":
			//Display the crossword on every frame
			displayCrossword(960, 540);
			//check to see if crossword has been solved
			if (checkWin()) {
				//Set the user's score
				score = findScore();
				//if the user is signed in
				if (clientData["username"] !== "guest")	{
					//Send a win and update their score
					sendUserWin(clientData["username"]);
					updateScore(clientData["username"], score);
				}
				gameState = "win";
			}
			break;
		case "coopCrossword":
			gameStateCoopCrossword();
			break;
		//initalizes any variables needed for the wordle gamestate
		case "initWordle":
			initWordle();
			break;
		//displays wordle on screen by calling wordle function
		case "wordle":
			simulateWordle();
			//Back button
			if (button(125, 75, 200, 100, "back")) {
				if (playState === "coopCrossword") {
					hitboxDeselected(currentRoom);
				}
				gameState = playState;
			}
			break;
		//displays game win screen
		case "win":
			gameStateWin();
			break;
		//displays finished crossword
		case "showcase":
			//Display the crossword on every frame
			displayCrossword(960, 540);
			calculateCrosswordPosition();
			if (button(125, 75, 200, 100, "back")) { gameState = "win"; }
			break;
		//displayes leaderboard, leaderboard data sent from server whenever it updates.
		case "leaderboard":
			gameStateLeaderboard();
			//Back button
			if (button(125, 75, 200, 100, "back")) { gameState = "mainMenu"; }
			break;
		case "help":
			gameStateHelp();
			break;
		//displays login / create account screen
		case "signIn":
			gameStateSignIn();
			break;
	}
	if (gameState == "mainMenu") {
		displaySignIn();
	}
	
	if (keyPressedThisFrame === "escape") {
		//toggle the escape key
		escapeKey = !escapeKey;
		//if it is on
		if (escapeKey) {
			//Send initial animations to the server
			if (highContrast) {
				addAnimation("contrastToggle", "sliderOn", 1920/2 + 120, 1080/2 - 210, 25, 60, "sinusoidal");
			} else {
				addAnimation("contrastToggle", "sliderOff", 1920/2 + 120, 1080/2 - 210, 25, 60, "sinusoidal");
			}
			if (definitionTool) {
				addAnimation("definitionToggle", "sliderOn", 1920/2 + 120, 1080/2 - 105, 25, 60, "sinusoidal");
			} else {
				addAnimation("definitionToggle", "sliderOff", 1920/2 + 120, 1080/2 - 105, 25, 60, "sinusoidal");
			}
			if (altFont) {
				addAnimation("altFontToggle", "sliderOn", 1920/2 + 120, 1080/2 - 10, 25, 60, "sinusoidal");
			} else {
				addAnimation("altFontToggle", "sliderOff", 1920/2 + 120, 1080/2 - 10, 25, 60, "sinusoidal");
			}
		} else {
			//delete all animations because the escape toggle isn't active
			delete animations["contrastToggle"];
			delete animations["definitionToggle"];
			delete animations["altFontToggle"];
		}
	}
	
	
	drawAnimations();

	escapePopup();

	drawAnimations(true);

	//Music calculations
	playMusic();
	
	//------------------------------------------------------------------------------------//
	//Needed code for rerunablility of the function
	
	//reset all single frame vars, keep on end of function
	keyPressedThisFrame = "";
	mouseButtonDown = false;
	mouseButtonUp = false;
	serverEvent = "";
	serverError = "";
	scrollAmount = 0;
	//If the screen needs to be redrawn because of gameState change inside function
	if (gameState !== startingGameState) {
		updateGame();
	}
};

//Main calcualtion loop, runs at 120 fps
async function calculateGame() {
	//If the escape key is not pressed
	if (!escapeKey) {
		//Run gamestate calculations when needed
		if (gameState === "customDifficulty") {
			calculateCustomDifficulty();
		}
		if (gameState === "coopCrossword" || gameState === "soloCrossword") {
			calculateCrosswordPosition();
		}
		if (gameState === "hosting") {
			calculateHosting();
		}
	}

	//Update animations
	animate();
};


//------------------------------------------------------------------------------------//
//Automaticaly update the game

//Update Step, 30 steps per second
setInterval(() => {
	//Stop page from displaying when not loaded
	if (document.readyState === "complete") {
		updateGame();
	}
	//Stop the integer of frames from going over 64 bits, probably will never fire
	if (frames >= (2**64) - 1) {
		frames = 0;
	}
	frames++;
}, 1000/30);

//Calculation step, 120 steps per second. This is here to smooth out animations as well as to isolate the animation from the update function
setInterval(() => {
	//Stop game calculations when not loaded
	if (document.readyState === "complete") {
		calculateGame();
	}
}, 1000/120);

//"fixed update" 5 seconds per frame
setInterval(() => {
	//If the client has not recived the word list
	if (wordList.length === 0) {
		//Send username
		sendUsername();
		//request word list from server
		requestWordList();
	}
}, 5000);


//------------------------------------------------------------------------------------//
//Event Listeners
//triggers on all mouse down events, sets mouseButtonState to "down"
canvas.addEventListener("mousedown", (event) => {
	//if it was a left click
	if (event.button === 0){
		mouseButtonState = "down";
		mouseButtonDown = true;
	}
});

//triggers on all mouse up events, sets mouseButtonState to "false"
canvas.addEventListener("mouseup", (event) => {
	//if it was a left click
	if (event.button === 0){
		mouseButtonState = "";
		mouseButtonUp = true;
	}
});

//triggers on all mouse movements
canvas.addEventListener('mousemove', (event) => {
	//Assign mouseX and mouseY
	mouseX = event.clientX;
	mouseY = event.clientY;
});

//triggers on all key presses and sets the keyPressed value to true
document.addEventListener("keydown", (event) => {
	//caps lock key is not deleted in key up
	if (event.key !== "CapsLock") {keysPressed.push(event.key.toLowerCase());}
	keyPressedThisFrame = event.key.toLowerCase();
	if (event.key === "Shift") {shiftKey = true;}
	//remove duplicates
	let KPS = new Set(keysPressed);
	keysPressed = Array.from(KPS);
	//allow all key presses to register
	updateGame();
});

//removes the key from keysPressed on key release
document.addEventListener("keyup", (event) => {
	let letterToDel = event.key.toLowerCase();
	//for every key that is currently pressed
	for (let keyIndex = 0; keyIndex < keysPressed.length; keyIndex++) {
		//if the values are the same delete the index from keysPressed
		if (letterToDel == keysPressed[keyIndex]){
			del(keysPressed, keyIndex);
			keyIndex -= 1;
		}
	}
	if (event.key === "Shift") {shiftKey = false;}
	//allow all key presses to register
	updateGame();
});

//Listens to mouse scroll wheel
document.addEventListener("wheel", (event) => {
	//Scroll amount is set to 1 or -1 depending on the scroll direction
	if (event.deltaY > 0) {
		scrollAmount = -1;
	} else {
		scrollAmount = 1;
	}
});

//------------------------------------------------------------------------------------//
//Server Events

//When server sends crosswordData
socket.on("crosswordData", (data) => {
	serverEvent = "crosswordDataUpdate";
	tempCrosswordData = data[0];
	tempHitboxes = data[1];
	if (crosswordData.length > 0 && hitboxes.length > 0) {
		updateCrosswordData();
	} else {
		crosswordData = tempCrosswordData;
		CES = Math.floor(1080/findCrosswordHeight());
		hitboxes = tempHitboxes;
	}
});

//On world list sent from server
socket.on("wordList", (allWords) => {wordList = allWords;});

//On log in load the user database from the server
socket.on("loggedIn", (userDatabase) => {
	clientData["userData"] = userDatabase;
	serverEvent = "loggedIn";
});

//On successful account creation
socket.on("accountCreated", (userDatabase) => {
	clientData["userData"] = userDatabase;
	serverEvent = "accountCreated";
});

//On database update from the server
socket.on("databaseUpdate", (userDatabase) => {
	clientData["userData"] = userDatabase;
});

//Recieving the server names
socket.on("serverNames", (servers) => {
	availableServers = servers;
});

//On user joining a room
socket.on("joinedRoom", (data) => {
	currentRoom = data[0];
	clientData["color"] = data[1];
	serverEvent = "joinedRoom";
});

socket.on("roomDataUpdate", (data) => {
	roomData = data;
});

socket.on("generatingRoomCrossword", () => {
	resetData("crossword");
	addAnimation("pano", "pan", 1920, 1080, 1920*2, 1080*2, "sinusoidal");
	gameState = "loadingCoopCrossword";
});

socket.on("highlightUpdate", (newHighlightData) => {
	serverEvent = "highlightUpdate";
	highlightData = Object.values(newHighlightData);
});

socket.on("hitboxUpdate", (data) => {
	let hitboxIndex = data[0];
	let hitboxData = data[1];
	if (hitboxes[hitboxIndex].length > 6) {
		overwriteKeyboardData(hitboxData[6], hitboxIndex);
		addYellows(hitboxData[7], hitboxIndex);
	} else {
		hitboxes[hitboxIndex].push(hitboxData[6]);
		hitboxes[hitboxIndex].push(hitboxData[7]);
	}
});

socket.on("leaderboardData", (leaderboardUpdate) => {
	serverEvent = "leaderboardDataUpdate";
	leaderboardData = leaderboardUpdate["score"];
});

//On server input errors (incorrect password, incorrect username, ect.)
socket.on("error", (message) => {
	serverError = message;
	console.log(message);
	//reload the page if the server crashed
	if (message === "serverDied") {
		location.reload();
	}
});
//Send username, happens once
sendUsername();
//request word list from server, happens once
requestWordList();