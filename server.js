var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');

var Word       = require('./app/models/word');

mongoose.connect('localhost/avl');
mongoose.connection.on('error', function() {
  console.info('Error: Could not connect to MongoDB. Did you forget to run `mongod`?');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 2000;

var router = express.Router();

router.use(function(req, res, next) {
  console.log('Request received');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/**
  #### `api/dictionary/words`

  * **GET:**
    * Returns a full collection of all words in the current dictionary.
  * **POST:**
    * Accepts a body of text, which will build the current dictionary.
**/

router.route('/dictionary/words')

  // train system on a new set of words (accessed at POST http://localhost:2000/api/dictionary/words)
  .post(function(req, res) {
    Word.train(req.body.source,function(err, response){
      if(err){ res.send(err) }
      res.send(response);
    });
  })

  // get all the words (accessed at GET http://localhost:2000/api/dictionary/words)
  .get(function(req, res) {
    Word.find(function(err, words) {
      if (err){ res.send(err) }
      res.json(words);
    });
  });

/**
  #### `api/dictionary/word/{word}`

  * **GET:**
    * an individual word from the dictionary, as well as it's breakdown.
**/

router.route('/dictionary/words/:word')

  // get the document that matches the word. (GET http://localhost:2000/api/dictionary/words/WORD)
  .get(function(req, res) {
    Word.find({word: req.params.word}, function(err,word){
      if(err){
        res.send(err);
      }
      res.json(word);
    });
  });

/**
  #### `api/create/word`

  * **GET:**
    * Returns a new word using the procedure above.
**/

router.route('/create/word')

  //get a newly created word
  .get(function(req, res) {
    Word.create(function(err, word){
      if(err){ res.send(err) }
      res.json(word);
    });
  });



app.use('/api', router);

router.get('/', function(req, res) {
    res.json({ message: 'api is accessible at /api/{verb}' });
});

app.listen(port,function(){console.log('Listening at: ' + port);});
