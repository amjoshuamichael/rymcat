const uri = 'api/words/'
var input = document.getElementById('input')
var words = {}
var text
var flatText

function Start() {
  input.addEventListener('keydown', (e) => {
    if (e.code == 'Space' | e.code == 'Enter') {
      var caretPos = GetCaretPos(input)
      text = input.innerText.slice(0, -1)
      flatText = text.replace('\n', ' ')

      if ( !IsWhitespace(text.charCodeAt([caretPos - 1])) ) {
        RegisterWordAtCursor(caretPos)
      } else if (e.code == 'Enter') {
        
      } else {
        e.preventDefault()
      }
    }

    if (e.key == '<' | e.key == '>' | e.key == 'Tab') {
      e.preventDefault()
    }
  })
}

// Takes a cursor position one space in front of a word and adds that word to the local dictionary.
async function RegisterWordAtCursor(caretPos) {
  await Sleep(20) // We wait a couple milliseconds for the letter to register at the cursor.
  let word = Letterize(FindWords(caretPos, 1))
  // Debug(word)
  // let data = await FetchPronunciation(word)
  // words[word] = data.voicing
  // RhymeWordsBehindCursor()
}

// Searches for rhymes wordsToCheck words behind a given word.
async function RhymeWordsBehindCursor() {
  await Sleep(20)

  var checkList = text.replace('\n', ' ').replace(/ $/g, '').split(' ')
  var checkCount = checkList.length - 1
  var checker = Letterize(checkList[checkCount])
  checkList.splice(checkCount, 1)

  checkList.forEach(element => {
    if (Rhyme(Letterize(element), checker) == 1) {
      let re = new RegExp(element + '(?!<)', 'g')
      input.innerHTML = input.innerHTML.replace(re, '<sred>' + element + '</sred>')

      let lChecker = checker.toLowerCase()
      re = new RegExp(lChecker + '(?!<)', 'g')
      input.innerHTML = input.innerHTML.replace(re, '<sred>' + lChecker + '</sred>')
    }
  })
}

function Rhyme(checkee, checker) {
  checkee = words[checkee].split(' ')
  checker = words[checker].split(' ')
  if( (checkee[checkee.length - 1] + checkee[checkee.length - 2]) == (checker[checker.length - 1] + checker[checker.length - 2]) ) {
    return 1;
  }


  return 0
}

async function FetchPronunciation(word) {
  word = Letterize(word);

  return fetch(uri + word)
    .then(response => response.json())
    .catch(error => console.error('Unable to get items.', error))
}

function PrintWords() {
  console.log(input.document.defaultView.getSelection())
  // for(var key in words) {
  //   console.log(key + "," + words[key])
  // }
}

function DisplayText(data) {
  document.getElementById('prounciationfield').innerHTML += data + '; '
}

// GLOBAL FUNCTIONS

// Finds the position of the caret in the textbox. 
function GetCaretPos(element) { // from https://stackoverflow.com/a/4812022
  if (typeof window.getSelection != "undefined") {
    var range = window.getSelection().getRangeAt(0);
    var preCaretRange = window.getSelection();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
  
    console.log(preCaretRange.toString())

    return preCaretRange.toString().length;
  }
}

// Sleep function.
function Sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Checks if character code is whitespace, meaning a space, tab, return, or the beginning of the input.
function IsWhitespace(code) {
  if (code == 10 | code == 32 | code == 160 | isNaN(code)) {
    return true;
  }

  return false;
}

// Removes all characters from a string except for letters. Also makes all letters uppercase. For example, "&r3h2y & m,|ES^s)" becomes "RHYMESS".
function Letterize(string) {
  return string.replace(/(?![A-z])./g, '').toUpperCase();
}

// Starts at text position in i characters, goes back wordCount words, and returns a string containing all of those words.
function FindWords(i, wordCount) {
  let wordsEnd = i
  
  Debug(flatText)

  while ( !IsWhitespace(flatText.charCodeAt([i - 1])) ) {
    i--
  }
  
  if (i == 0) {
    
  } else {
    i--
  }

  let words = flatText.substring(i, wordsEnd)

  if (wordCount > 1) {
    return words.replace('\n', ' ')
  } else {
    return words
  }
}

function Debug(string) {
  console.log(JSON.stringify(string))
}