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

router.route('/dictionary/words')

  // train system on a new set of words (accessed at POST http://localhost:8080/api/dictionary/words)
  .post(function(req, res) {
    Word.train(req.param('source_text'),function(err, response){
      if(err){ res.send(err) }
      res.send(response);
    });
  })

  // get all the words (accessed at GET http://localhost:8080/api/dictionary/words)
  .get(function(req, res) {
    Word.find(function(err, words) {
      if (err){ res.send(err) }
      res.json(words);
    });
  });

app.use('/api', router);

router.get('/', function(req, res) {
    res.json({ message: 'api is accessible at /api/{verb}' });
});

app.listen(port,function(){console.log('Listening at: ' + port);});
