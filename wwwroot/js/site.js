/*
RYMCAT VERSION 0.9.0 WEATHERMAN ALPHA

CREDITS:

Developers:
  Aaron Joshuamichael Cruz

Consultation:
  Alisha Townsend Cruz
  Cristopher Michael Mikatodd Cruz Tracy

With help from:
  Icons by Google
  Carnegie Mellon University for the CMU Pronouncing Dictionary
  Visual Studio / Visual Studio Code by Microsoft
  Documentation by Mozilla
  Documentation by W3schools
  Forum posts on StackOverflow

GITHUB:


"You don't need a weatherman to know which way the wind blows."
  - Bob Dylan, Subterranean Homesick Blues
*/
var sections;
var currentSection;

var editableContainer = document.getElementById('editable-container')
/* The editable container, which holds all of the editable sections. */

var words = {}
/*  This 'words' object is the dictionary. The dictionary
is written as the user types, taking its definitions from
the server. Each word is a property of the object. The
property returns an array containing information about that
word. For example, words['rhyme'] or words.rhyme returns:

[
0:  Pronunciation written in ARPABET format ('R AY1 M')
    for more information on ARPABET, visit
    https://en.wikipedia.org/wiki/ARPABET

1:  The index of the last vowel syllable in the word. (1)
    Used for finding rhyming words: if two words have
    the same final vowel syllable they rhyme. Also
    used to color the word.
]

Note: in code, the set of information returned by a word
is called 'info' */

class Section {
  constructor(container, back, text, dragIcon, trashIcon, index) {
    this.container = container;
    this.back = back;
    this.text = text;
    this.dragIcon = dragIcon;
    this.trashIcon = trashIcon;
    this.index = index;
  }

  // Does everything needed to format the text, including:
  // - Getting pronunciations for the words and letterizing all of the words
  // - Finding relations between the words (rhymes, assonance, consonance)
  // - Formatting based on those relations
  async FormatRoutine() {
    // Setting up variables
    let text = this.text.innerText.replace(/\n*\n/g, '\n').replace(/\n$/g, '')
    let flatText = text.replace(/\n/g, ' ').replace(/ $/, '').split(' ')
    let wordSets = []
    let isInSet = []

    if (flatText.length <= 1) {
      return
    }

    // Determining word sets based on the rhyme mode
    switch (document.querySelector('input[name="rhyme-mode"]:checked').value) {
      case 'none':
        break;

      case 'adjacent':
        let adjacentSplitText = text.split('\n')
        adjacentSplitText = adjacentSplitText.map(line => line.split(' '))

        let adjacentWordCount = 0

        adjacentSplitText.forEach((line, index) => {
          if (index != 0) {
            wordSets.push(line.concat(adjacentSplitText[index - 1]))

            isInSet.push(
              new Array(adjacentWordCount).fill(false).concat(
                new Array(line.length + adjacentSplitText[index - 1].length).fill(true),
                new Array(flatText.length - line.length - adjacentSplitText[index - 1].length - adjacentWordCount).fill(false)
              )
            )
            adjacentWordCount += adjacentSplitText[index - 1].length
          }
        })

      case 'lines':
        if (wordSets.length == 0) {
          let linesSplitText = text.split('\n')
          let linesWordCount = 0

          linesSplitText.forEach(line => {
            if(line != "") {
              line = line.split(' ')

              if (line.length > 1) {
                wordSets.push(line)
              }

              isInSet.push(
                new Array(linesWordCount).fill(false).concat(
                  new Array(line.length).fill(true),
                  new Array(flatText.length - line.length - linesWordCount).fill(false)
                )
              )
              linesWordCount += line.length
            }
          })
        }

      case 'end':
        let newSet = []
        let newInSet = []
        let spaceSplitText = text.split(' ')

        spaceSplitText.forEach(word => {
          let splitWord = word.split(/\n/)
          if (splitWord[0] != word) {
            newSet.push(splitWord[0])
            newInSet.push(true)
            newInSet.push(false)

          } else {
            newInSet.push(false)
          }
        })

        newSet.push(spaceSplitText[spaceSplitText.length - 1])
        newInSet[newInSet.length - 1] = true

        wordSets.push(newSet)
        isInSet.push(newInSet)

        break;

      default:
        wordSets[0] = flatText
        isInSet[0] = new Array(flatText.length).fill(true)
    }

    // Getting pronunciations for the words, letterizing all of the words, and counting how many of each word there is
    for (var i = 0; i < wordSets.length; i++) {
      for (var j = 0; j < wordSets[i].length; j++) {
        if(wordSets[i][j] != '') {
          wordSets[i][j] = Letterize(wordSets[i][j])
          let word = wordSets[i][j]

          if(!words.hasOwnProperty(word)) {
            let data = await FetchPronunciation(word)

            words[word] = []

            words[word][0] = data.voicing.split(' ')

            words[word][1] = []

            let j = words[word][0].length - 1
            while(j >= 0) {
              if (words[word][0][j][0].match(/A|E|I|O|U/) != null) {
                break
              }
              j--
            }

            while(j < words[word][0].length) {
              words[word][1].push(words[word][0][j])
              j++
            }
          }
        }
      }
    }

    // Removing words from the wordSets array which we don't have a pronunciation for
    for(i = 0; i < wordSets.length; i++) {
      wordSets[i] = wordSets[i].filter(word => words[word][0][0] != '!')
    }

    // Listing words in pairs
    let isRhyme = new Array(flatText.length).fill(false)
    flatText = flatText.map(word => Letterize(word))

    wordSets.forEach((wordSet, setIndex) => {
      let decIndex = 0
      let wordCount = wordSet.length
      let wordPairs = []

      wordSet.forEach(word => {
        for (let i = decIndex; i < wordCount; i++) {
          let checkWord = wordSet[i]

          if (word != checkWord) {
            wordPairs.push([word, checkWord])
          }
        }

        decIndex++
      })

      // Finding relations between the words
      let rhymes = []

      wordPairs.forEach(pair => {
        if (Rhyme(pair) > 0) {
          rhymes.push(pair)
        }
      })

      rhymes = ToSet(rhymes)

      flatText.forEach((word, index) => {
        if (rhymes.has(word) && isInSet[setIndex][index]) {
          isRhyme[index] = true
        }
      })
    })

    let wordPos = 0
    flatText.forEach((word, index) => {

      if(isRhyme[index]) {
        let tag = '<span%class="r' + words[word][1][0].replace(/[0-9]/, '') + '%' + (word[0].charCodeAt(0) % 2 == 0) + '">'
        text = StringSplice(text, tag, wordPos)
        wordPos += tag.length + 1
      }

      while(!IsWhitespace(text.charCodeAt(wordPos))) {
        wordPos++
      }

      if(isRhyme[index]) {
        text = StringSplice(text, '</span>', wordPos)
        wordPos += 7
      }

      wordPos++
    })

    
    this.back.innerHTML = text.replace(/\n/g, '</br>').replace(/%/g, ' ')
  }

  get Height() {
    return Math.max(this.text.innerText.replace(/\n*\n/g, '\n').split(/\n/).length, 2) * 24 + 45
  }

  ChangeHeight(targetHeight) {
    console.log('changing height...')
    if (targetHeight === true) {
      var height = targetHeight + 0
      targetHeight = this.Height
    } else {
      var height = this.Height
    }

    this.container.style.height = height + 'px'

    var animation = setInterval(frame, 5, this)

    function frame(section) {
      if (Math.abs(height - targetHeight) < 2) {
        if (targetHeight != 0) {
          section.container.style.height = targetHeight + 'px';
          clearInterval(animation);
        } else {
          section.container.remove()
          CreateSections()
        }
      } else {
        height -= (height - targetHeight) / 5;
        section.container.style.height = height + 'px';
      }
    }
  }

  ChangePosition(targetX, targetY) {
    if(this.container.style.top == '') {
      this.container.style.left = targetX + 'px';
      this.container.style.top = targetY + 'px';
      return
    }

    var x = 0
    var y = this.container.style.top.slice(0, -2)

    var animation = setInterval(frame, 5, this)

    function frame(section) {
      if (Math.abs(y - targetY) < 2) {
        section.container.style.left = targetX + 'px';
        section.container.style.top = targetY + 'px';
        clearInterval(animation);
      } else {
        y -= (y - targetY) / 5;
        x -= (x - targetX) / 5;
        section.container.style.left = x + 'px';
        section.container.style.top = y + 'px';
      }
    }
  }

  Clone(newIndex) {
    return(new Section(this.container, this.back, this.text, this.dragIcon, this.trashIcon, newIndex))
  }
}

var formatWait
/* The ID of a SetInterval SendBatch() function set when
the user presses a letter key. */

function Start() {
  console.log(dictionary[1]);
  // Waiting 1 second after each keypress for FormatRoutine()
  document.addEventListener('keydown', e => {
    if (e.key.match(/[A-z]|[0-9]|\.|\?|!|,|'|"|-| /) == null) {
      e.preventDefault()
      console.log('entered')
    } else if (e.key == ' ') {
      clearTimeout(formatWait)
    } else {
      clearTimeout(formatWait)
      formatWait = setTimeout(FormatCurrent, 1000)
    }

    currentSection = GetCurrentSection()
    if (Math.abs(currentSection.container.offsetHeight - currentSection.Height) > 2 ) {
      currentSection.ChangeHeight(currentSection.Height)
      RepositionElements(-1, 0)
    }
  })

  CreateCSS()
  CreateSections()
  FormatAll()
}

//#region EDTIOR FUNCTIONS

function FormatAll() {
  sections.forEach(section => {
    section.FormatRoutine()
  })
}

function FormatCurrent() {
  if (currentSection != null) {
    currentSection.FormatRoutine()
  }
}

// Checks if checkee and checker rhyme, returning the following values corresponding to different types of rhymes:
// 0: These two words do NOT rhyme: they do not sound similar enough to classify as rhyming. (ex. 'rhyme', 'duck')
// 1: These two words are near rhymes: their final vowels are the same, but everything after is different. (ex. 'rhyme', 'light')
// 2: These two words are perfect rhymes: everything after the last vowel sounds the same. (ex. 'rhyme', 'time')
function Rhyme(pair) {
  clonedPair = [words[pair[0]], words[pair[1]]]

  if (clonedPair[0][1] == clonedPair[1][1]) {
    return 2
  }

  if (clonedPair[0][1][0].replace(/[0-9]/, '') == clonedPair[1][1][0].replace(/[0-9]/, '')) {
    return 1
  }

  return 0
}

// Returns the pronunciation for a word by pinging the server.
async function FetchPronunciation(word) {
  return await fetch('api/words/' + word)
    .then(response => response.json())
    .catch(error => {
      console.error('Unable to get items: ' + word, error)
    })
}

function CreateCSS() {
  let pronLetters = ['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EL', 'EH', 'EM', 'EN', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW']

  let ending = ''
  let endingDark = ''
  pronLetters.forEach((letter, index) => {
    if (index % 2 == 0 | index == 3) {
      ending = ',100%,85%'
      endingDark = ',100%,70%'
    }

    index = index * 20

    css = ''
    css += '.r' + letter.toUpperCase() + ':before{border-image:linear-gradient(86deg,hsl(' + index + ending +') 92%,hsl(' + index + endingDark + ')) 20% stretch;}'
    document.styleSheets[0].insertRule(css)

    css = ''
    css += '.r' + letter.toUpperCase() + ':after{border-image:linear-gradient(86deg,hsl(' + index + ending +'), 60%, hsl(' + index + endingDark + ')) 10% stretch;}'
    document.styleSheets[0].insertRule(css)
  })
}

//#endregion

//#region SECTION FUNCTIONS

function CreateSections() {
  console.log("let's goooooo");
  sections = []

  let containerElements = document.getElementsByClassName('editable')
  let backElements = document.getElementsByClassName('editable-back')
  let textElements = document.getElementsByClassName('editable-text')
  let DragIconElements = document.getElementsByClassName('editable-drag')
  let TrashElements = document.getElementsByClassName('editable-trash')

  for(let i = 0; i < containerElements.length; i++) {
    sections.push(new Section(containerElements[i], backElements[i], textElements[i], DragIconElements[i], TrashElements[i], i))
  }

  RepositionElements(-1, 0)
  ResetSectionHeights()
  ResetContainerHeight()
  SetUpSections()
}

function SetUpSections() {
  for(let i = 0; i < sections.length - 1; i++) {
    dragElement(sections[i])
  }
}

function dragElement(section) { // Adapted from https://www.w3schools.com/howto/howto_js_draggable.asp
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, heightIndex = section.container.offsetTop + 20;
  section.dragIcon.onmousedown = DragMouseDown;
  section.trashIcon.onmousedown = Delete;

  function DragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();

    heightIndex = section.container.offsetTop - 20

    for(let i = 0; i < sections.length; i++) {
      if(i != section.index) {
        sections[i].ChangeHeight(23)
      } else {
        RepositionElements(i, heightIndex)
      }
    }

    section.ChangeHeight(40)
    
    pos3 = e.clientX;
    pos4 = e.clientY;

    document.onmouseup = CloseDragElement;
    document.onmousemove = ElementDrag;
  }

  function ElementDrag(e) {
    e = e || window.event;
    e.preventDefault();

    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    section.container.style.top = (section.container.offsetTop - pos2) + "px";
    section.container.style.left = (section.container.offsetLeft - pos1) + "px";

    let curSecY = section.container.style.top.slice(0, -2)

    if(section.index != 0 && curSecY * 1 < sections[section.index - 1].container.style.top.slice(0, -2) * 1) {
      sections[section.index] = sections[section.index - 1].Clone(section.index)
      sections[section.index - 1] = section.Clone(sections[section.index - 1].index)
      section.index--
      RepositionElements(section.index, heightIndex)
    }

    if(section.index != sections.length - 2 && curSecY * 1 > sections[section.index + 1].container.style.top.slice(0, -2) * 1) {
      sections[section.index] = sections[section.index + 1].Clone(section.index)
      sections[section.index + 1] = section.Clone(sections[section.index + 1].index)
      section.index++
      RepositionElements(section.index, heightIndex)
    }
  }

  function CloseDragElement() {
    RepositionElements(-1, 0)
    ResetSectionHeights()

    document.onmouseup = null;
    document.onmousemove = null;

    SetUpSections()
  }

  function Delete() {
    section.ChangeHeight(0)
  }
}

function RepositionElements(curSecIndex, heightIndex) {
  sections.forEach((section, index) => {
    if (curSecIndex == -1) {
      section.ChangePosition(0, heightIndex)
      heightIndex += section.Height + 20
    } else if (curSecIndex == index) {
      heightIndex += 60
    } else {
      section.ChangePosition(0, heightIndex)
      heightIndex += 43
    }
  })
}

function ResetContainerHeight() {
  let heightIndex = 0

  sections.forEach(section => {
    heightIndex += section.Height + 20
  })

  editableContainer.style.height = heightIndex + 20 + 'px'
}

function CopySection(newIndex, oldIndex) {
  if (oldIndex == -1) {
    oldIndex = sections.length - 1
  }

  let copy = sections[oldIndex].container.cloneNode(true)
  sections[oldIndex].text.setAttribute('onfocus', null)
  sections[oldIndex].container.childNodes[1].childNodes[1].childNodes[3].setAttribute('contenteditable', true)
  editableContainer.appendChild(copy)
  CreateSections()
}

function ResetSectionHeights() {
  for(let i = 0; i < sections.length; i++) {
    sections[i].container.style.position = ''
    sections[i].ChangeHeight(true)
  }
}

//#endregion

//#region GLOBAL FUNCTIONS

// Sleep function.
function Sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Returns a number whose value is limited to the given range.
Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

// Checks if character code is whitespace, meaning a space, tab, return, or the beginning of the input.
function IsWhitespace(code) {
  if (code == 10 | code == 32 | code == 38 | code == 42 | code == 160 | isNaN(code)) {
    return true;
  }

  return false;
}

// Removes all characters from a string except for letters and apostrophes, makes all letters uppercase,
// and replaces words like "rhymin'" with "rhyming" For example, "&r3h2y & m,|ES^s)" becomes "RHYMESS".
function Letterize(string) {
  return string.replace(/[^A-z\d'-]/g, '').toUpperCase().replace(/IN'$/, 'ING');
}

// Converts an array like [[A, B], [B, C], [D, E]] to a set [A, B, C, D, E]
function ToSet(array) {
  let newArray = []
  array.forEach(pair => {
    newArray.push(pair[0])
    newArray.push(pair[1])
  })

  return new Set(newArray)
}

// Gets all indexes of a value in an array. For example, in the array [43, 20, 94, 43] AllIndexesOf(array) would return [0, 3]. Taken from https://stackoverflow.com/a/20798567
function AllIndexesOf(array, value) {
  let indexes = [], i = -1;
  while ((i = array.indexOf(value, i+1)) != -1){
      indexes.push(i);
  }
  return indexes;
}

// Inserts addition into string at index
function StringSplice(string, addition, index) {
  string = string.slice(0, index) + addition + string.slice(index)
  return string;
}

// Gets the interior text node within a span node. For example, will return 'rhymess' (the node, not the string) in <span><span>rhymess</span></span>
function GetTextInNode(node) {
  if (node.tagName == 'DIV' | node.tagName == 'SPAN') {
    node = node.childNodes[0]
  }
  return node
}

// Returns the section that the user is currently editing.
function GetCurrentSection() {
  for(let i = 0; i < sections.length; i++) {
    if(sections[i].text == document.activeElement) {
      return sections[i]
    }
  }

  return null
}

function Debug(string) {
  console.log(JSON.stringify(string))
}

//#endregion