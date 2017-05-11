# avl-api

avl is hopefully going to be a generative language library. The intended series of rules are, at least right now:

## rules

1. Pick a word at random.
2. Get the first grapheme (random grapheme occurring at the first position)
3. Search for all occurances of that grapheme at the 1st position
4. Pick a random match, and then get the grapheme following that match.
5. Repeat unless the match has no following grapheme (the end of the word). If it's the end of the word, pick a new word and repeat.

---

## routes

### dictionary

`api/dictionary/words`

* **GET:**
  * Returns a full collection of all words in the current dictionary.
* **POST:**
  * Accepts a body of text, which will build the current dictionary.

`api/dictionary/word/{word}`

* **GET:**
  * an individual word from the dictionary, as well as it's breakdown.

`api/dictionary/graphemes`

* **POST:**
  * Provide the dictionary with the appropriate grapheme map

### create

`api/create/word`

* **GET:**
  * Returns a new word using the procedure above.

`api/create/words/{#number}`

* **GET:**
  * Returns a number of words based on the procedure.
* **Parameters:**
  * Don't know yet. I think you should be able to enter in a number of methods shaping the algorithm. Some ideas:
    * Average word length
    * Average sentence length

`api/create/paragraph`

* **GET:**
  * Returns a paragraph using all new words.

`api/create/book/{pages}`

* **GET:**
  * Returns a lot of text, with however many pages specified.
