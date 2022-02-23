var words;
var debug = false;
var winner = false;
var word;
var guessCount;
var currentGuess;
var grid;
var rowCount;
var snackTime = 5000;
onInit();

async function onInit() {
  rowCount = 8;
  guessCount = 0;
  currentGuess = [];
  await getGameMode().then(() => {
    word = pickWord();
    grid = document.getElementById('grid');
    createGrid(word.length, rowCount);
    styleRow(guessCount);
  })

  document.addEventListener('keydown', keyPress);

  console.log(`Wow there's ${words.length} words in this set!`);
  console.log(`Don't tell anyone but the word is ${word}`);

  if (!debug) console.debug = () => { };
}

function snack(message) {
  var bar = document.getElementById("snackbar");
  bar.innerText = message;
  bar.className = "show";
  setTimeout(() => { bar.className = bar.className.replace("show", ""); }, snackTime); // timeout must match total css animation
}

async function getGameMode() {
  var title = document.getElementById("title");

  switch (window.location.search.substring(1)) {
    case 'threedle':
      title.innerHTML = `<span class="neutral">T</span><span class="contains">H</span><span class="matched">R</span><span class="contains">E</span><span class="neutral">E</span>-<span class="matched">D</span><span class="matched">L</span><span class="matched">E</span>`;
      await getWords('three-letter.js');
      break;
    // case 'twodle':
    //   break;
    default:
      title.innerHTML = `<span class="neutral">T</span><span class="contains">W</span><span class="contains">O</span>-<span class="matched">D</span><span class="matched">L</span><span class="matched">E</span>`;
      await getWords('two-letter.js');
      break;
  }
}

async function getWords(fileName) {
  const xhr = new XMLHttpRequest(),
    method = "GET",
    url = `/src/${fileName}`;
  xhr.open(method, url, true);
  xhr.send();
  await new Promise((resolve) => {
    xhr.onreadystatechange = (e) => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        var status = xhr.status;
        if (status === 0 || (status >= 200 && status < 400)) {
          var response = xhr.responseText;
          words = response.split('\n');
          resolve();
        }
      }
    }
  });
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

function styleRow(row) {
  for (var i = 0; i < word.length; i++) {
    (document.getElementById(`${row}${i}`).classList.add('between-grey'));
  }
}

function styleCell(add = true) {
  if (add) {
    document.getElementById(`${guessCount}${currentGuess.length - 1}`).classList.replace('between-grey', 'neutral');
    document.getElementById(`${guessCount}${currentGuess.length - 1}`).classList.add('zoom-in-out');
  } else {
    document.getElementById(`${guessCount}${currentGuess.length}`).classList.replace('neutral', 'between-grey');
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
    styleCell();
  } else {
    console.debug('Too many letters!')
  }
}

function back() {
  if (!winner && currentGuess.length > 0) {
    swapLetter('');
    currentGuess.pop();
    styleCell(false);
  }
}

function guess() {
  if (currentGuess.length == word.length) {
    if (!words.includes(currentGuess.join('').toLowerCase())) {
      snack(`${currentGuess.join('')} isn't real!`);
    } else {
      var tempGuess = [...currentGuess];
      var tempWord = Array.from(word);
      var exists = -1;

      // Find exact matches
      for (var i = 0; i < tempWord.length; i++) {
        if (tempWord[i] == tempGuess[i]) {
          console.debug(`MATCH ${tempWord[i]} == ${tempGuess[i]}`);

          // Recolor guess cell
          if (document.getElementById(`${guessCount}${i}`).classList.contains('neutral')) {
            document.getElementById(`${guessCount}${i}`).classList.replace('neutral', 'matched');
          }

          // Recolor key
          if (document.getElementById(`${tempGuess[i]}`).classList.contains('neutral')) {
            document.getElementById(`${tempGuess[i]}`).classList.replace('neutral', 'matched');
          } else if (document.getElementById(`${tempGuess[i]}`).classList.contains('contains')) {
            document.getElementById(`${tempGuess[i]}`).classList.replace('contains', 'matched');
          }

          tempGuess[i] = '';
          tempWord[i] = '';
        }
      }

      // Find containing letter matches
      for (var i = 0; i < tempWord.length; i++) {
        if (tempGuess[i] == '') {
          continue;
        }

        console.debug(`LETTER ${tempGuess[i]}`);

        exists = tempWord.indexOf(tempGuess[i])
        if (exists != -1) {
          console.debug(`EXISTS ${tempWord[exists]} at ${i}`);

          // Recolor guess cell
          if (document.getElementById(`${guessCount}${i}`).classList.contains('neutral')) {
            document.getElementById(`${guessCount}${i}`).classList.replace('neutral', 'contains');
          }

          // Recolor key
          if (document.getElementById(`${tempWord[exists]}`).classList.contains('neutral')) {
            document.getElementById(`${tempWord[exists]}`).classList.replace('neutral', 'contains');
          }

          tempGuess[i] = '';
        } else {
          // Recolor key
          if (document.getElementById(`${tempGuess[i]}`).classList.contains('neutral')) {
            document.getElementById(`${tempGuess[i]}`).classList.replace('neutral', 'not-grey');
          }
        }
      }

      // Determine if we've won
      if (tempWord.join('').length == 0) {

        // Recolor all remaining
        for (var i = guessCount; i < rowCount; i++) {
          for (var j = 0; j < tempWord.length; j++) {
            document.getElementById(`${i}${j}`).classList.add('matched');
            document.getElementById(`${i}${j}`).innerHTML = word[j];
          }
        }

        snack(`Winner! The word was ${word}`);
        setTimeout(() => {
          location.reload();
        }, snackTime + 2000);

      } else {
        console.debug(`Guess: ${tempGuess}`);
        console.debug(`Match: ${tempWord}`);
        console.debug(`Word: ${word}`);

        // Empty out the guess and set next row style
        currentGuess = [];
        guessCount++;


        if (rowCount == guessCount) {
          snack(`Better luck next time! The word was ${word}`);
          setTimeout(() => {
            location.reload();
          }, snackTime + 2000);
        } else {
          styleRow(guessCount);
        }
      }

    }
  } else {
    console.debug('Blocked');
  }
}