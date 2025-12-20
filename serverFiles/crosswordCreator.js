/*

client.js

Client side javascript program for crosswordle

4.28.23
*/

const fs = require('fs');
//constants for cleaner code (for zac)
const x = 0;
const y = 1;
const width = 2;
const height = 3;

//Initiate an empty crossword
function initCrossword(crosswordDimensions){
	let crosswordData = [];
	for (let i = 0; i < crosswordDimensions[1]; i++) { //for every y
		let xData = [];
		for (let k = 0; k < crosswordDimensions[0]; k++) { //for every x
			xData.push("//"); //append a x value
		}
		crosswordData.push(xData); //append a list of x values to y
	}
	return crosswordData;
};


//Returns usable words from word list with input of wordRange [low, high]
function findUsableWords(wordRange, wordFileName = "allWords"){
	let allWords = fs.readFileSync("./serverFiles/%.txt".replace('%', wordFileName)).toString('utf-8'); // create string from text file
	allWords = allWords.split("\r\n"); //split large string of file into words
	let usableWords = [];
	let funny = false;
	if (randint(1, 10000) === 52) {
		//Have a 1 in 10,000 chance of the crossword generating only words without certain letters
		funny = true;
		console.log("There has been a bruh moment :)");
	}
	for (let i = 0; i < allWords.length; i++){
		word = allWords[i]; //set word to current word to avoid extra computation
		if (word.length >= wordRange[0] && word.length <= wordRange[1] && (!funny || !(word.includes("e") || word.includes("a")))){
			usableWords.push(word);
		}
	}
	return usableWords;
};


//Returns a random integer between range [min, max], if one value is given min is 0 and max is that value
function randint(min, max = "none"){
	if (max === "none"){
		max = min;
		min = 0;
	}
	return Math.floor(Math.random() * (max - min + 1)) + min;
};


//Writes a set of characters to crosswordData, if there are intersections in the data to be written blacklisted spots are automaticaly put into crossword data, input is crosswordData, string to be written, starting position [x, y], the direction that it is to be written in (vertical or horizontal), and if intersections should be calculated with blacklist spaces
function writeData(crosswordData, word, position, direction, blacklist = true){
	let intersectionPoints = [];
	if (direction === "vertical"){
		if (blacklist){
			//if the first letter isn't on the border
			if (position[1] != 0){
				//put a blacklist spot just before the first letter
				crosswordData[position[1] - 1][position[0]] = "-/";
			}
			//if the last letter isn't on the border
			if (position[1] + word.length - 1 != crosswordData.length){ 
				//put a blacklist spot just after the last letter
				crosswordData[position[1] + word.length][position[0]] = "-/";
			}
		}
		//for every letter in the word
		for (let i = 0; i < word.length; i++){
			//if the thing being written over is a letter
			if (crosswordData[position[1] + i][position[0]][1] != "/"){
				//it is a intersection
				intersectionPoints.push([position[0], position[1] + i]);
				//if the letters don't match
				if (crosswordData[position[1] + i][position[0]][1] != word[i]){
					//log a error
					console.error("ERROR: Replaced Data: " + crosswordData[position[1] + i][position[0]] + " with " + "-" + word[i] + " while generating word: " + word + ".");
				}
			}
			//write to crosswordData
			crosswordData[position[1] + i][position[0]] = "-" + word[i];
		}

	} else if (direction === "horizontal"){
		if (blacklist){
			//if the first letter isn't on the border
			if (position[0] != 0){
				//put a blacklist spot just before the first letter
				crosswordData[position[1]][position[0] - 1] = "-/";
			}
			//if the last letter isn't on the border
			if (position[0] + word.length - 1 != crosswordData[position[1]].length){
				//put a blacklist spot just after the last letter
				crosswordData[position[1]][position[0] + word.length] = "-/";
			}
		}
		//for every letter in the word
		for (let i = 0; i < word.length; i++){
			//if the thing being written over is a letter
			if (crosswordData[position[1]][position[0] + i][1] != "/"){
				//it is a intersection
				intersectionPoints.push([position[0] + i, position[1]]);
				//if the letters don't match
				if (crosswordData[position[1]][position[0] + i][1] != word[i]){
					//log a error
					console.error("ERROR: Replaced Data: " + crosswordData[position[1]][position[0] + i] + " with " + "-" + word[i] + " while generating word: " + word + ".");
				}
			}
			//write to crosswordData
			crosswordData[position[1]][position[0] + i] = "-" + word[i];
		}
	} else {
		console.error("ERROR: Direction: " + direction + " is not recognised in function writeData. Data not written to crosswordData."); // errors if direction isn't vertical or horizontal
	}
	if (blacklist){
		//for every intersection
		for (i = 0; i < intersectionPoints.length; i++){
			//blacklist needed spots around the intersection
			crosswordData = blacklistIntersect(crosswordData, intersectionPoints[i]);
		}
	}
	return crosswordData;
};


//Writes correct blacklisting spots for a given intersection point, inputs are crosswordData, and intersection formated as [x, y]
function blacklistIntersect(crosswordData, intersection){
	//if the intersection is not on the left side of crosswordData
	if (intersection[0] !== 0){
		//if there is a letter to the left of the intersect
		if (crosswordData[intersection[1]][intersection[0] - 1][1] != "/"){
			//if the intersection is not on the top of the screen
			if (intersection[1] != 0){
				//if there is a letter above the intersect
				if (crosswordData[intersection[1] - 1][intersection[0]][1] != "/"){
					//put a blacklist tile left and up from the intersect
					crosswordData[intersection[1] - 1][intersection[0] - 1] = "-/";
				}
			}
			//if the intersection is not on the bottom of the screen
			if (intersection[1] !== crosswordData.length){
				//if there is a letter below the intersect
				if (crosswordData[intersection[1] + 1][intersection[0]][1] != "/"){
					//put a blacklist tile left and down from the intersect
					crosswordData[intersection[1] + 1][intersection[0] - 1] = "-/";
				}
			}
		}
	}
	//if the intersection is not on the right side of crosswordData
	if (intersection[0] !== crosswordData[intersection[1]].length){
		//if there is a letter to the right of the intersect
		if (crosswordData[intersection[1]][intersection[0] + 1][1] != "/"){
			//if the intersection is not on the top of the screen
			if (intersection[1] !== 0){
				//if there is a letter above the intersect
				if (crosswordData[intersection[1] - 1][intersection[0]][1] != "/"){
					//put a blacklist tile right and up from the intersect
					crosswordData[intersection[1] - 1][intersection[0] + 1] = "-/";
				}
			}
			//if the intersection is not on the bottom of the screen
			if (intersection[1] !== crosswordData.length){
				//if there is a letter below the intersect
				if (crosswordData[intersection[1] + 1][intersection[0]][1] != "/"){
					//put a blacklist tile right and down from the intersect
					crosswordData[intersection[1] + 1][intersection[0] + 1] = "-/";
				}
			}
		}
	}
	return crosswordData;
};


//Generates and places base word onto crosswordData close to the center
function generateBaseWord(crosswordData, words){
	let hitboxes = [];
	let possiblePositions = [];
	//find random baseWord from words list and delete it
	let wordIndex = randint(words.length - 1);
	let baseWord = words[wordIndex];
	del(words, wordIndex);
	//console.log("Base Word: " + words[wordIndex]);
	//find a position close to the center of the crossword
	const basePosition = [Math.round(crosswordData[0].length / 2 - baseWord.length / 2), Math.round(crosswordData.length / 2)];
	
	//write the baseWord onto crosswordData using basePosition and add it to hitboxes
	crosswordData = writeData(crosswordData, baseWord, [basePosition[0], basePosition[1]], "horizontal");

	//push positions of letters to possiblePositions
	for (i = 0; i < baseWord.length; i++){
		possiblePositions.push([basePosition[0] + i, basePosition[1]]);
	}
	//hitboxes is [x, y, width, height, word, isFound]
	hitboxes.push([basePosition[0], basePosition[1], baseWord.length, 1, baseWord, false]);

	const returnPacket = [crosswordData, words, hitboxes, possiblePositions];
	return returnPacket;
};


//Finds a random word that is able to spawn on given positions and returns it along with anywhere it can spawn
function findWord(crosswordData, possiblePositions, words){
	let found = false;
	//positions that the selected word can spawn on
	let wordPositions = [];
	//index of intersect
	let intersectIndexes = [];
	//while a word that works is not found
	let wordIndex = 0;
	let newWord = 'none';
	while (!found){
		//get a random word and index
		wordIndex = randint(words.length - 1);
		newWord = undefined;
		while (newWord === undefined){
			newWord = words[wordIndex];		
		}
		//for every letter in the new word
		for (let i = 0; i < newWord.length; i++){
			//for every position with a letter on it
			for (let k = 0; k < possiblePositions.length; k++){
				//if the new word contains a letter that is also in possiblePositions
				if (newWord[i] == crosswordData[possiblePositions[k][1]][possiblePositions[k][0]][1]){
					//add possible spawn position to wordPositions
					wordPositions.push([possiblePositions[k][0], possiblePositions[k][1]]);
					intersectIndexes.push(i);
					found = true;
				}
			}
		}
	}
	const returnPacket = [wordPositions, newWord, words, intersectIndexes, wordIndex];
	//console.log("newWord: " + newWord);
	return returnPacket;
};


//finds the positions of intersections. Returns indexes of intersections in the word
function findIntersects(newWord, spawnPosition, crosswordData){
	let intersections = [];
	for (let i = 0; i < newWord.length; i++){
		//if the current letter in the word that is being spawned is the same as the crossword data at that point
		if (newWord[i] == crosswordData[spawnPosition[1]][spawnPosition[0]][1]) {
			//it is a intersect and should be appended to the list intersections
			intersections.push(i);
		}
	}
	//all intersections of the word
	return intersections;
};


//Deletes a array element and returns the array
function del(array, index){
	return array.splice(index, 1);
};


// hitbox is [x,y,width,height,word,isFound]
function positionCheck(hitboxes, position){
	for (let hitboxIndex = 0; hitboxIndex < hitboxes.length; hitboxIndex++) {
		//for every hitbox in hitboxes, check if the position is in the hitbox
		if (position[x] >= hitboxes[hitboxIndex][x] && position[x] <= hitboxes[hitboxIndex][x] + hitboxes[hitboxIndex][width] - 1){
			//the position's x value is in the hitbox's range
			if (position[y] >= hitboxes[hitboxIndex][y] && position[y] <= hitboxes[hitboxIndex][y] + hitboxes[hitboxIndex][height] - 1){
				//the position's x and y values are within the hitbox's range (the position is part of the hitbox)
				//check if the hitbox is horizontal or vertical
				if (hitboxes[hitboxIndex][width] == 1) {
					//the hitbox is vertical
					return "vertical";
				}
				if (hitboxes[hitboxIndex][height] == 1) {
					//the hitbox is horizontal
					return "horizontal";
				}
			}
		}
	}	
};


//Checks to see if it is possible to spawn verticaly LKFDSH:FLDSJKF: && ((intersectIndex === 0 && i === 0) || (intersectIndex === newWord.length && i === newWord.length))
function verticalCheck(crosswordData, newWord, intersectIndex, spawnPosition, hitboxes){ //FIX THIS: Add checks for parallel spawns just like we discussed.
	//spawnPostion[1] - intersectIndex is the position of the first letter
	let rootCoord = spawnPosition[1] - intersectIndex
	//if the word is outside the borders (up or down)
	if (((rootCoord - 1) < 0) || ((rootCoord + newWord.length) >= crosswordData.length)){
		//the word can't spawn there
		//console.log("Fail 1: Outside Y Borders");
		return false;
	}
	
	//if the word's blacklists collide with anything other than // or -/
	if ((crosswordData[rootCoord - 1][spawnPosition[0]][1] != "/") || (crosswordData[rootCoord + newWord.length][spawnPosition[0]][1] != "/")){
		//console.log("Fail 2: Vertical Perpendicular Spawn");
		return false;
	}
	
	//for every letter
	for (let i = 0; i < newWord.length; i++){
		//if the letter is over a letter that doesn't match the current letter or is not on a empty tile
		let spawnSquare = crosswordData[rootCoord + i][spawnPosition[0]];
		//console.log(spawnSquare + " <-- " + newWord[i]);
		if (spawnSquare != "//" && spawnSquare[1] != newWord[i]){
			//the letter can't spawn so break and don't allow the word to spawn
			//console.log("Fail 3: Incompatible Letter at index " + i.toString() + " with an intersectIndex of " + intersectIndex.toString()");
			return false;
		}
		// if the position to the right of that position is a letter
		if (crosswordData[rootCoord + i][spawnPosition[0] + 1][1] != "/" && !((intersectIndex === 0 && i === 0) || (intersectIndex === newWord.length && i === newWord.length))){
			// if that position hosts a vertical word
			let result = positionCheck(hitboxes, [spawnPosition[0] + 1, rootCoord + i])
			if (result === "vertical") {
				// fail the spawn because parallel words should not spawn directly next to one another
				return false;
			}	
		}
		// if the position to the left of that position is a letter
		if (crosswordData[rootCoord + i][spawnPosition[0] - 1][1] != "/" && !((intersectIndex === 0 && i === 0) || (intersectIndex === newWord.length && i === newWord.length))) {
			// if that position hosts a vertical word
			let result = positionCheck(hitboxes, [spawnPosition[0] - 1, rootCoord + i])
			if (result === "vertical") {
				// fail the spawn because parallel words should not spawn directly next to one another
				return false;
			}	
		}
	}
	return true;
};


//Checks to see if it is possible to spawn horizontaly
function horizontalCheck(crosswordData, newWord, intersectIndex, spawnPosition){
	//position of the first letter of the word relative to crosswordData
	let rootCoord = spawnPosition[0] - intersectIndex;
	//if the word is outside the borders (up or down)
	if (((rootCoord - 1) < 0) || ((rootCoord + newWord.length) >= crosswordData[spawnPosition[1]].length)){
		//the word can't spawn there
		//console.log("Fail: 4: Outside X Borders");
		return false
	}
	
	//if the word's blacklists collide with anything other than // or -/
	if ((crosswordData[spawnPosition[1]][rootCoord - 1][1] != "/") || (crosswordData[spawnPosition[1]][rootCoord + newWord.length][1] != "/")){
		//console.log("Fail 5: Horizontal Perpendicular Spawn");
		return false;
	}

	//for every letter
	for (let i = 0; i < newWord.length; i++){
		//if the letter is over a letter that doesn't match the current letter or is not on a empty tile
		let spawnSquare = crosswordData[spawnPosition[1]][rootCoord + i];
		//console.log(spawnSquare + " <-- " + newWord[i]);
		if (spawnSquare != "//" && spawnSquare[1] != newWord[i]){
			//the letter can't spawn so break and don't allow the word to spawn
			//console.log("Fail 6: Incompatible Letter at index " + i.toString() + " with an intersectIndex of " + intersectIndex.toString());
			return false;
		}
		// if the position above that position is a letter
		if (crosswordData[spawnPosition[1] - 1][rootCoord + i][1] != "/" && !((intersectIndex === 0 && i === 0) || (intersectIndex === newWord.length && i === newWord.length))){
			// if that position hosts a horizontal word
			let result = positionCheck(hitboxes, [rootCoord + i, spawnPosition[1] - 1])
			if (result === "horizontal") {
				// fail the spawn because parallel words should not spawn directly next to one another
				return false;
			}	
		}
		// if the position below that position is a letter
		if (crosswordData[spawnPosition[1] + 1][rootCoord + i][1] != "/" && !((intersectIndex === 0 && i === 0) || (intersectIndex === newWord.length && i === newWord.length))) {
			// if that position hosts a horizontal word
			let result = positionCheck(hitboxes, [rootCoord + i, spawnPosition[1] + 1])
			if (result === "horizontal") {
				// fail the spawn because parallel words should not spawn directly next to one another
				return false;
			}	
		}
	}
	return true;
};


//Finds all possible spawn positions because we are stupid and can't assign them correctly
function findPossiblePositions(crosswordData){
	//init vars
	let possiblePositions = [];
	let isPossible = false;
	let up = false;
	let left = false;
	let down = false;
	let right = false;
	
	for (let row = 0; row < crosswordData.length; row++){
		for (let column = 0; column < crosswordData[row].length; column++){
			isPossible = false;
			up = false;
			left = false;
			down = false;
			right = false;
			//if the current position being looked at is a letter
			if (crosswordData[row][column][1] != "/"){
				//first if statement prevents errors, others check for open spawn space next to position
				if (row != 0){
					//checks above
					if (crosswordData[row - 1][column] == "//"){
						isPossible = true;
						up = true;
					}
				}
				if (column != 0){
					//checks to the left
					if (crosswordData[row][column - 1] == "//"){
						isPossible = true;
						left = true;
					}
				}
					//checks below
				if (row != crosswordData.length){
					if (crosswordData[row + 1][column] == "//"){
						isPossible = true;
						down = true;
					}
				}
					//checks to the right
				if (column != crosswordData[row].length){
					if (crosswordData[row][column + 1] == "//"){
						isPossible = true;
						right = true;
					}
				}
				//algroithmicaly detirmine if the position being looked at is a intersection point
				if ((up && (left || right)) || (down && (left || right))){
					isPossible = false;
				}
				if (isPossible){
					possiblePositions.push([column, row]);
				}
			}
		}
	}
	return possiblePositions;
};


//Centers crossword
function centerCrossword(){
	let left = null;
	let right = null;
	let top = null;
	let bottom = null;
	//Determine where the furthest out letters are
	for (let row = 1; row <= crosswordData.length; row++) {
		for (let column = 1; column <= crosswordData[row - 1].length; column++){
			if (crosswordData[row - 1][column - 1][1] !== "/") {
				if (top === null) {
					top = row - 1;
				}
				//-bottom + crosswordDimensions[1] is the inverse of crosswordDimensions[1] - row
				if (row > -bottom + crosswordData.length || bottom === null) {
					bottom = crosswordData.length - row;
				}
				if (column < left + 1 || left === null) {
					left = column - 1;
				}
				//-right + crosswordDimensions[0] is the inverse of crosswordDimensions[0] - column
				if (column > -right + crosswordData[row - 1].length || right === null) {
					right = crosswordData[row - 1].length - column;
				}
			}
		}
	}
	// [length added to left, length added to top]
	crosswordOffset = [Math.round((right - left) / 2), Math.round((bottom - top) / 2)];
	
	if (crosswordOffset[1] < 0){
		//move each of the values in each of the crossword's rows to the left crosswordOffset[0] times
		usedOffset = Math.abs(crosswordOffset[1]);
		//for the amount of times needed to be moved
		for (let change = 0; change < usedOffset; change++) {
			//move one row from the left to the right
			crosswordData.push(crosswordData.shift());
		}
	} else {
		//for the amount of times needed to be moved
		for (let change = 0; change < crosswordOffset[1]; change++) {
			//move one row from the right to the left
			crosswordData.unshift(crosswordData.pop(crosswordData.length - 1));
		}
	}
	
	if (crosswordOffset[0] < 0){
		//abs values
		usedOffset = Math.abs(crosswordOffset[0]);
		//move each of the values in each of the crossword's columns up crosswordOffset[1] times
		for (let change = 0; change < usedOffset; change++) {
			for (let rowIndex = 0; rowIndex < crosswordData.length; rowIndex++){
				crosswordData[rowIndex].push(crosswordData[rowIndex].shift());
			}
		}
	} else {
		//move each of the values in each of the crossword's columns down crosswordOffset[1] times
		for (let change = 0; change < crosswordOffset[0]; change++) {
			for (let rowIndex = 0; rowIndex < crosswordData.length; rowIndex++){
				crosswordData[rowIndex].unshift(crosswordData[rowIndex].pop(crosswordData[rowIndex].length - 1));
			}
		}
	}
	//Move Hitboxes
	for (let hitboxIndex = 0; hitboxIndex < hitboxes.length; hitboxIndex++){
		hitboxes[hitboxIndex][0] += crosswordOffset[0];
		hitboxes[hitboxIndex][1] += crosswordOffset[1];
	}
};


//Main generation function
module.exports.generateCrossword = function generateCrossword(wordLength, wordCount){
	//Benchmarks (modeled by the linear regression model w(s) = 0.11400s - 7.697690). w = words, s = size
	//10 * 10 fits 4 - 7 words (predicted 4)
	//15 * 15 fits 17 - 20 words (predictied 18)
	//20 * 20 fits 34 - 39 words (predictied 38)
	//25 * 25 fits 56 - 58 words (Python Size) (predictied 64)
	//30 * 30 fits 83 - 88 words (predictied 95)
	//40 * 40 fits x - x words (predictied 174)
	//50 * 50 fits 255 - 275 words (predictied 277)
	//60 * 60 fits x - x words (predictied 403)
	//70 * 70 fits x - x words (predictied 551)
	//75 * 75 fits 615 - 635 words (predictied 634)
	//80 * 80 fits x - x words (predictied 722)
	//90 * 90 fits x - x words (predictied 916)
	//100 * 100 fits x - x words (predictied 1132)
	//150 * 150 fits x - x words (predictied 2557)
	//180 * 180 fits x - x words (error between 180 and 200) (predictied 3686)
	//200 * 200 predicted 4552

	
	//Initiate variables
	//Size for given words (with added space of 5) is size = sqrt((words + 7.69769)/0.114) + 5
	const size = Math.round(Math.sqrt((wordCount + 7.69769) / 0.114) + 5);
	const crosswordDimensions = [size, size]; //need to switch to user input
	const maxFails = 1000;
	const failsUntilPPRefresh = 100;
	let initWordCount = wordCount;
	//Number of consecutive fails
	let failCount = 0;

	console.log("\nGenerating Crossword of Size: " + size.toString());

	//Initiate a blank crossword
	crosswordData = initCrossword(crosswordDimensions);
	
	//Return usable words from allWords
	words = findUsableWords([wordLength[0], wordLength[1]]); 

	//Generate baseWord and extract the returned values
	returnPacket = generateBaseWord(crosswordData, words);
	//update crosswordData
	crosswordData = returnPacket[0];
	//update words to not include the base word
	words = returnPacket[1];
	//Hitbox format is [[x, y, width, height, word]]
	hitboxes = returnPacket[2];
	//possible positions is a list of every spot in crosswordData with a letter on it, in format of [[x, y], [x, y], ect.]
	possiblePositions = returnPacket[3];

	//While not enough words have been found
	let fails = 0;
	//subtract base word from word count
	wordCount -= 1;
	while (wordCount > 0 && fails < maxFails){
		let wordFound = false;
		//choose a random word that is able to spawn and return positions it can spawn in and extract returned values
		returnPacket = findWord(crosswordData, possiblePositions, words);
		//Positions that the word can spawn on
		wordPositions = returnPacket[0];
		//String containing the new random word
		newWord = returnPacket[1];
		//update words to not include the new word
		words = returnPacket[2];
		//indexes of all intersects
		intersectIndexes = returnPacket[3];
		//index of spawned word in words list
		wordIndex = returnPacket[4];

		//run through every position the word can spawn on
		//if there are no possible positions the word is ignored, no spawn positions
		for (let i = 0; i < wordPositions.length; i++){
			//the current position being referenced in the loop
			spawnPosition = wordPositions[i];
			//the index of the intersected letter of the word
			intersect = intersectIndexes[i];
			//console.log("Spawn Position [x, y]: " + spawnPosition);

			//try spawning verticaly on the position
			canSpawn = verticalCheck(crosswordData, newWord, intersect, spawnPosition, hitboxes);
			//if the word can spawn
			if (canSpawn){
				//delete the word from words
				del(words, wordIndex);
				//find intersections and remove them from possiblePositions
				intersections = findIntersects(newWord, spawnPosition, crosswordData);
				for (let k = 0; k < intersections.length; k++){
					possiblePositions = del(possiblePositions, intersections[k]);
				}
				//append to hitboxes
				hitboxes.push([spawnPosition[0], spawnPosition[1] - intersect, 1, newWord.length, newWord, false]);
				//write to crosswordData
				writeData(crosswordData, newWord, [spawnPosition[0], spawnPosition[1] - intersect], "vertical");
				//delete position of word spawn WRONG
				possiblePositions = del(possiblePositions, intersect);
				//append each letter to possible positions
				for (let k = 0; k < newWord.length; k++){
					possiblePositions.push([spawnPosition[0], spawnPosition[1] - intersect + k]);
				}
				wordFound = true;
				fails = 0;
				break;
			} else {
				//console.log("Word: " + newWord + " Could not spawn verticaly.");
			}
			//try spawing horizontaly on the position
			canSpawn = horizontalCheck(crosswordData, newWord, intersect, spawnPosition);
			//if the word can spawn
			if (canSpawn){
				//delete the word from words
				del(words, wordIndex);
				//console.log("Word: " + newWord + " Spawned Horizontaly");
				//find intersections and remove them from possiblePositions
				intersections = findIntersects(newWord, spawnPosition, crosswordData);
				//find intersections and remove them from possiblePositions
				for (let k = 0; k < intersections.length; k++){
					possiblePositions = del(possiblePositions, intersections[k]);
				}
				//append to hitboxes
				hitboxes.push([spawnPosition[0] - intersect, spawnPosition[1], newWord.length, 1, newWord, false]);
				//write to crosswordData
				writeData(crosswordData, newWord, [spawnPosition[0] - intersect, spawnPosition[1]], "horizontal");
				//delete position of word spawn
				possiblePositions = del(possiblePositions, intersect);
				//append each letter to possible positions
				for (let k = 0; k < newWord.length; k++){
					possiblePositions.push([spawnPosition[0] - intersect + k, spawnPosition[1]]);
				}
				wordFound = true;
				fails = 0;
				break;
			} else {
				//console.log("Word: " + newWord + " Could not spawn horizontaly.");
			}
		}
		
		if (wordFound){
			wordCount -= 1;
		} else {
			fails += 1;
			if (fails % failsUntilPPRefresh == 0){
				possiblePositions = findPossiblePositions(crosswordData);
			}
		}
		if (words.length <= 1){
			break
		}
		//console.log("Fail Streak: " + fails);
		//console.log("Words left: " + wordCount + "\n");
	}
	centerCrossword();
	//console.log(possiblePositions)
	return [crosswordData, hitboxes];
};