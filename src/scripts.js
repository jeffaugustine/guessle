const words = ['qw'];// ['aa', 'ab', 'ad', 'ae', 'ag', 'ah', 'ai', 'al', 'am', 'an', 'ar', 'as', 'at', 'aw', 'ax', 'ay', 'ba', 'be', 'bi', 'bo', 'by', 'da', 'de', 'do', 'ed', 'ef', 'eh', 'el', 'em', 'en', 'er', 'es', 'et', 'ex', 'fa', 'fe', 'gi', 'go', 'ha', 'he', 'hi', 'hm', 'ho', 'id', 'if', 'in', 'is', 'it', 'jo', 'ka', 'ki', 'la', 'li', 'lo', 'ma', 'me', 'mi', 'mm', 'mo', 'mu', 'my', 'na', 'ne', 'no', 'nu', 'od', 'oe', 'of', 'oh', 'oi', 'ok', 'om', 'on', 'op', 'or', 'os', 'ow', 'ox', 'oy', 'pa', 'pe', 'pi', 'po', 'qi', 're', 'sh', 'si', 'so', 'ta', 'te', 'ti', 'to', 'uh', 'um', 'un', 'up', 'us', 'ut', 'we', 'wo', 'xi', 'xu', 'ya', 'ye', 'yo', 'za'];

var word;
var guessCount;
var currentGuess;
var grid;
var rowCount;
var winner = false;
onInit();

function onInit() {
  word = pickWord();
  rowCount = 8;

  guessCount = 0;
  currentGuess = [];

  grid = document.getElementById('grid');
  createGrid(word.length, rowCount);
  document.addEventListener('keydown', keyPress);

  console.log(`Wow there's ${words.length} words in this set!`);
  console.log(`Don't tell anyone but the word is ${word}`);
}

function pickWord() {
  return words[Math.floor(Math.random() * words.length)].toUpperCase();
}

function createGrid(width, height) {
  var table = document.createElement('table');
  var tBody = document.createElement('tBody');

  for (i = 0; i < height; i++) {
    var tBodyTr = document.createElement('tr');
    for (j = 0; j < width; j++) {
      var tBodyTd = document.createElement('td');
      tBodyTd.setAttribute('id', `${i}${j}`);
      tBodyTr.appendChild(tBodyTd);
    }
    tBody.appendChild(tBodyTr);
  }
  table.appendChild(tBody);

  grid.appendChild(table);
}

function swapLetter(value) {
  document.getElementById(`${guessCount}${currentGuess.length - 1}`).innerHTML = value;
}

function paintNext(add = true) {
  if (add) {
    document.getElementById(`${guessCount}${currentGuess.length - 1}`).classList.add('neutral');
  } else {
    if (currentGuess.length > 0) {
      document.getElementById(`${guessCount}${currentGuess.length - 1}`).classList.add('neutral');
    }
    document.getElementById(`${guessCount}${currentGuess.length}`).classList.remove('neutral');
  }
}

// Basic keyboard support
function keyPress(value) {
  var key = value.key.toUpperCase();
  if (key == 'ENTER') {
    guess();
  } else if (key == 'BACKSPACE') {
    back();
  } else if (key.match(/[A-Z]/i)) {
    letterPress(key);
  } else {
    console.debug(value);
  }
}

// Buttons on page
function letterPress(value) {
  if (currentGuess.length < word.length) {
    currentGuess.push(value);
    swapLetter(value);
    paintNext();
  } else {
    console.log('Too many letters!')
  }
}

function back() {
  if (!winner && currentGuess.length > 0) {
    swapLetter('');
    currentGuess.pop();
    paintNext(false);
  }
}

function guess() {
  if (currentGuess.length == word.length) {
    var tempGuess = [...currentGuess];
    var tempWord = Array.from(word);
    var exists = -1;

    // Find exact matches
    for (var i = 0; i < tempWord.length; i++) {
      if (tempWord[i] == tempGuess[i]) {
        // Recolor guess cell
        if (document.getElementById(`${guessCount}${i}`).classList.contains('neutral')) {
          document.getElementById(`${guessCount}${i}`).classList.replace('neutral', 'matched');
        }

        // Recolor key
        if (document.getElementById(`${tempGuess[i]}`).classList.contains('neutral')) {
          document.getElementById(`${tempGuess[i]}`).classList.replace('neutral', 'matched');
        }

        tempGuess[i] = '';
        tempWord[i] = '';
      }
    }

    // Find containing letter matches
    for (var i = 0; i < tempWord.length; i++) {
      exists = tempWord.indexOf(tempGuess[i])
      if (exists > 0) {
        console.log(i)
        console.log(`Guess: ${tempGuess}`);
        console.log(`Match: ${tempWord}`);
        console.log(`Word: ${word}`);

        // Recolor guess cell
        if (document.getElementById(`${guessCount}${exists}`).classList.contains('neutral')) {
          document.getElementById(`${guessCount}${exists}`).classList.replace('neutral', 'contains');
        }

        // Recolor key
        if (document.getElementById(`${tempWord[exists]}`).classList.contains('neutral')) {
          document.getElementById(`${tempWord[exists]}`).classList.replace('neutral', 'contains');
        }

        tempGuess[i] = '';
      }
    }
    guessCount++;

    // Determine if we've won
    if (tempWord.join('').length == 0) {
      console.log('Winner!');
      winner = true;

      // Recolor all remaining
      for (var i = guessCount; i < rowCount; i++) {
        for (var j = 0; j < tempWord.length; j++) {
          document.getElementById(`${i}${j}`).classList.add('matched');
          document.getElementById(`${i}${j}`).innerHTML = word[j];
        }
      }

    } else {
      console.log(`Guess: ${tempGuess}`);
      console.log(`Match: ${tempWord}`);
      console.log(`Word: ${word}`);

      currentGuess = [];
    }

  } else {
    console.log('Blocked');
  }
}