// Array of words used in the typing game
const words = 'the quick brown fox jumps over the lazy dog exploring various terrains from vast mountains to dense forests amidst the cacophony of nature tranquility prevails an enigmatic aura surrounds the mystical lands filled with vibrant flora and fauna the majestic eagle soars high embodying freedom below a meandering river glistens under the radiant sun whispers of ancient tales echo through the valleys revealing secrets of yore as twilight descends the horizon glows with hues of orange and pink in this serene wilderness every creature thrives harmonizing in an intricate delicate balance a testament to the beauty of the natural world the gentle breeze carries the scent of wildflowers while the stars emerge in the night sky their brilliance guiding the nocturnal wanderers through the peaceful expanse of the wilderness where dreams and reality intertwine in perfect harmony'.split(' ');
const wordsCount = words.length; // Total number of words available
const gameTime = 30 * 1000; // Total game time in milliseconds (30 seconds)
let timer = null; // Timer for game countdown
let gameStart = null; // Start time of the game

// Helper function to add a CSS class to an element
function addClass(el, name) {
  el.classList.add(name);
}

// Helper function to remove a CSS class from an element
function removeClass(el, name) {
  el.classList.remove(name);
}

// Function to get a random word from the array
function randomWord() {
  return words[Math.floor(Math.random() * wordsCount)];
}

// Function to format a word into HTML, with each letter wrapped in a span
function formatWord(word) {
  return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}

// Function to start a new game
function newGame() {
  const wordsContainer = document.getElementById('words');
  // Clear the words container and add 200 formatted random words
  wordsContainer.innerHTML = Array.from({ length: 200 }, () => formatWord(randomWord())).join('');
  // Set the first word and letter as 'current'
  addClass(wordsContainer.firstChild, 'current');
  addClass(wordsContainer.querySelector('.letter'), 'current');
  // Display the initial time remaining
  document.getElementById('info').textContent = (gameTime / 1000).toString();
  timer = null; // Reset the timer
}

// Function to calculate the Words Per Minute (WPM)
function getWpm() {
  const wordsElements = [...document.querySelectorAll('.word')]; // All word elements
  const lastTypedWord = document.querySelector('.word.current'); // Last typed word
  const lastTypedWordIndex = wordsElements.indexOf(lastTypedWord) + 1;
  const typedWords = wordsElements.slice(0, lastTypedWordIndex); // Words typed by the player

  // Filter words that are correctly typed
  const correctWords = typedWords.filter(word => {
    const letters = [...word.children];
    return letters.every(letter => letter.classList.contains('correct')) &&
           !letters.some(letter => letter.classList.contains('incorrect'));
  });
  return (correctWords.length / gameTime) * 60000; // Calculate WPM
}

// Function to handle the end of the game
function gameOver() {
  clearInterval(timer); // Stop the timer
  addClass(document.getElementById('game'), 'over'); // Add 'over' class to game container
  const result = getWpm(); // Calculate WPM
  document.getElementById('info').textContent = `WPM: ${result}`; // Display the result
}

// Event listener for typing within the game
document.getElementById('game').addEventListener('keyup', ev => {
  const key = ev.key;
  const currentWord = document.querySelector('.word.current');
  const currentLetter = document.querySelector('.letter.current');
  const expected = currentLetter?.textContent || ' ';
  const isLetter = key.length === 1 && key !== ' ';
  const isSpace = key === ' ';
  const isBackspace = key === 'Backspace';
  const isFirstLetter = currentLetter === currentWord.firstChild;

  // If the game is over, ignore input
  if (document.getElementById('game').classList.contains('over')) return;

  // Start the timer on the first letter typed
  if (!timer && isLetter) {
    gameStart = Date.now();
    timer = setInterval(() => {
      const msPassed = Date.now() - gameStart;
      const sLeft = Math.round((gameTime - msPassed) / 1000);
      if (sLeft <= 0) {
        gameOver(); // End game if time is up
        return;
      }
      document.getElementById('info').textContent = sLeft.toString(); // Update time remaining
    }, 1000);
  }

  if (isLetter) {
    if (currentLetter) {
      // Check if the typed letter matches the expected letter
      addClass(currentLetter, key === expected ? 'correct' : 'incorrect');
      removeClass(currentLetter, 'current');
      addClass(currentLetter.nextSibling, 'current'); // Move to the next letter
    } else {
      // Handle extra characters beyond the length of the word
      const incorrectLetter = document.createElement('span');
      incorrectLetter.textContent = key;
      incorrectLetter.className = 'letter incorrect extra';
      currentWord.appendChild(incorrectLetter);
    }
  }

  if (isSpace) {
    if (expected !== ' ') {
      // Mark all remaining letters in the word as incorrect if space is pressed prematurely
      [...currentWord.querySelectorAll('.letter:not(.correct)')].forEach(letter => {
        addClass(letter, 'incorrect');
      });
    }
    removeClass(currentWord, 'current');
    addClass(currentWord.nextSibling, 'current'); // Move to the next word
    if (currentLetter) {
      removeClass(currentLetter, 'current');
    }
    addClass(currentWord.nextSibling.firstChild, 'current'); // Mark the first letter of the next word as current
  }

  if (isBackspace) {
    if (isFirstLetter) {
      // Move to the previous word and make the last letter current
      removeClass(currentWord, 'current');
      addClass(currentWord.previousSibling, 'current');
      removeClass(currentLetter, 'current');
      addClass(currentWord.previousSibling.lastChild, 'current');
      removeClass(currentWord.previousSibling.lastChild, 'incorrect');
      removeClass(currentWord.previousSibling.lastChild, 'correct');
    } else if (currentLetter) {
      // Move to the previous letter and remove its status
      removeClass(currentLetter, 'current');
      addClass(currentLetter.previousSibling, 'current');
      removeClass(currentLetter.previousSibling, 'incorrect');
      removeClass(currentLetter.previousSibling, 'correct');
    } else {
      // Make the last letter of the current word current if there is no current letter
      addClass(currentWord.lastChild, 'current');
      removeClass(currentWord.lastChild, 'incorrect');
      removeClass(currentWord.lastChild, 'correct');
    }
  }

  // Adjust the viewport if the current word goes beyond a certain height
  if (currentWord.getBoundingClientRect().top > 250) {
    const words = document.getElementById('words');
    const margin = parseInt(words.style.marginTop || '0px');
    words.style.marginTop = (margin - 35) + 'px';
  }

  // Move the cursor to the current letter or word
  const nextLetter = document.querySelector('.letter.current');
  const nextWord = document.querySelector('.word.current');
  const cursor = document.getElementById('cursor');
  if (nextLetter) {
    cursor.style.top = nextLetter.getBoundingClientRect().top + 2 + 'px';
    cursor.style.left = nextLetter.getBoundingClientRect().left + 'px';
  } else if (nextWord) {
    cursor.style.top = nextWord.getBoundingClientRect().top + 2 + 'px';
    cursor.style.left = nextWord.getBoundingClientRect().right + 'px';
  }
});


// Event listener for starting a new game
document.getElementById('newGameBtn').addEventListener('click', () => {
    location.reload(); // Refresh the page to start a new game
  });
// Initialize the first game when the page loads
  newGame();