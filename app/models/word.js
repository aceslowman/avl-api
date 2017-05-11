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
  var current_word;
  // Person.
  //   find({ occupation: /host/ }).
  //   where('name.last').equals('Ghost').
  //   where('age').gt(17).lt(66).
  //   where('likes').in(['vaporizing', 'talking']).
  //   limit(10).
  //   sort('-occupation').
  //   select('name occupation').
  //   exec(callback);

  // get a random word
  Word.aggregate({ $sample: { size: 1 } } , function(err, res){
    current_word = res[0];

    current_grapheme = current_word.breakdown[0];


    console.log(current_grapheme);

    callback(null,current_grapheme);
  });
  //pick it's first grapheme

  //find a new word that begins at that grapheme



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
