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

schema.statics.train = function(source_text, callback){
    var Word = mongoose.model('Word', schema);

    var breakdown,
        words;

    Word.remove({}, function (err) {
      if (err) return handleError(err);
      console.log("All words removed from set.");
    });

    fs.readFile(path.join(assets_path,'english_graphemes.json'), 'utf8', function (err, data) {
      if (err){ console.log(err) };

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

      // lineReader.on('line', function (line) {
      //   var word_obj = {"word":line};
      //
      //   word_obj.breakdown = [];
      //   for(var key in graphemes){
      //     var regexp = new RegExp(key, "g");
      //     while ((key = regexp.exec(line)) != null) {
      //       word_obj.breakdown.push(
      //         {
      //           "index":key["index"],
      //           "grapheme":key[0],
      //           "phonemes":graphemes[key]
      //         });
      //     }
      //   }
      //
      //   word_obj.breakdown.sort(function (a, b) {
      //     return a.index - b.index;
      //   });
      //
      //   var word = new Word(word_obj);
      //   var promise = new Promise(function(resolve, reject) {
      //     word.save(function (err, word) {
      //       if (err){
      //         reject(Error("Save error: " + err));
      //       }else{
      //         resolve("The word \""+word.word + "\" was saved to DB!");
      //       }
      //     });
      //   });
      //
      //   promise.then(function(result) {
      //     console.log(result);
      //   }, function(err) {
      //     console.log(err);
      //   });
      //
      // });

      callback(null,true);
    }); //end of readfile
}

module.exports = mongoose.model('Word', schema);
