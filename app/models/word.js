var fs = require('fs');
var readline = require('readline');
var mongoose = require('mongoose');

var path = require('path');
var assets_path = path.resolve(__dirname, '../../app/assets/');

var schema = mongoose.Schema({
  word: String,
  breakdown: [
    {
      index: Number,
      grapheme: String,
      phonemes: [String]
    }
  ]
});

schema.statics.create = function(callback){
  var Word = mongoose.model('Word', schema);
  var current_word, current_grapheme;

  // #1 retrieve a random word.
  var getRandom = new Promise(function(resolve, reject) {
    Word.aggregate({ $sample: { size: 1 } } , function(err, res){
      if(err){ reject("Failed to find a random word."); }

      // set the current word to the random word
      current_word     = res[0];
      // and grab the first random grapheme from it
      current_grapheme = current_word.breakdown[0];
      console.log("Word found: " + current_word.word);
      resolve("Random Word: " + current_word.word);
    });
  });

  // #2 find the next word that has a matching grapheme.
  // retrieve and return the grapheme that follows the match
  var findNext = new Promise(function(resolve, reject){
    //search for any word containing the current_grapheme in it's breakdown
    Word.find({ 'breakdown.grapheme': current_grapheme }, function(err, match){
      // once it's found, update both current_word, and current_grapheme
      current_word = match;
      // current_grapheme = match.

      console.log("Next match: " + match);
      resolve("move on");
    });
  });

  // step through the algorithm using promises
  getRandom             // #1
    .then(findNext)     // #2

    .then(function() {  // END
      callback(null, current_word);
    },
    function(err) {
      console.log(err);
      callback(err, null);
    });

}

schema.statics.train = function(source_text, callback){
    var Word = mongoose.model('Word', schema);

    var breakdown,
        words;

    Word.remove({}, function (err) {
      if (err) return handleError(err);
      console.log("All words removed from set.");
    });

    fs.readFile(path.join(assets_path,'english_graphemes.json'), 'utf8', function (err, data) {
      if (err)
        console.log(err);

      graphemes = JSON.parse(data);

    //   var lineReader = readline.createInterface({
    //  // input: fs.createReadStream("/usr/share/dict/words")
    //     input: fs.createReadStream(path.join(assets_path,'afewwords'))
    //   });

      var splitString = source_text.toLowerCase().split(' ');

      for(var i = 0; i < splitString.length; i++){

        var word_obj = {"word":splitString[i]};

        word_obj.breakdown = [];
        for(var key in graphemes){
          var regexp = new RegExp(key, "g");
          while ((key = regexp.exec(splitString[i])) != null) {
            word_obj.breakdown.push(
              {
                "index":key["index"],
                "grapheme":key[0],
                "phonemes":graphemes[key]
              });
          }
        }

        word_obj.breakdown.sort(function (a, b) {
          return a.index - b.index;
        });

        var word = new Word(word_obj);
        var promise = new Promise(function(resolve, reject) {
          word.save(function (err, word) {
            if (err){
              reject(Error("Save error: " + err));
            }else{
              resolve("The word \""+word.word + "\" was saved to DB!");
            }
          });
        });

        promise.then(function(result) {
          console.log(result);
        }, function(err) {
          console.log(err);
        });
      }
    });

    callback(err,true);
}

module.exports = mongoose.model('Word', schema);
