'use strict';

let mongoose = require('mongoose');
let mail_queue = require('./send.js');


mongoose.connect('mongodb://ds053448.mlab.com:53448/demodb', {
  user: '',
  pass: ''
});

var Schema = mongoose.Schema;
var userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  age: String
});

let User = mongoose.model('users', userSchema);
exports.UserModel = User;

let express = require('express');
let app = express();


let rootDir = __dirname,
  config = require('./config'),
  http = require('http'),
  path = require('path'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  mw = {
    requestlogger: require('./middleware/requestlogger')
  };


app.get('/', function (req, res) {
  // render out the angular bootstrap page
  res.render('index.html.ejs');
});

app.set('port', config.PORT || process.env.port || 3000);
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  secret: config.SESSION_SECRET,
  saveUninitialized: true,
  resave: true
}));
// app.use(express.static(__dirname + '/public'));

// Our custom middleware
app.use(mw.requestlogger);
// ---

// --- Authentication ---
var passport = require('passport'),
  flash = require('connect-flash');

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// --------

//This allows you to require files relative to the root http://goo.gl/5RkiMR
var requireFromRoot = (function (root) {
  return function (resource) {
    return require(root + "/" + resource);
  }
})(__dirname);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

app.get('/api/users', function (req, res, next) {
  User.find()
    .exec(function (err, users) {
      if (err) return next(err);
      res.json(users);
    });
});

app.post('/api/users', function (req, res, next) {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    age: req.body.age
  });
  user.save(function (err) {
    if (err) return next(err);
    res.sendStatus(201);
    //add to queue
    mail_queue.send_to_queue(req.body);
    console.log(`added ${user.name}`);
  });
});

app.post('/api/remove', function (req, res, next) {
  User.findByIdAndRemove(req.body._id, function (err, user) {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

app.post('/api/update', function (req, res, next) {

  const modelId = req.body._id;
  const newName = req.body.name;
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  const newAge = req.body.age;

  User.findById(modelId).then(function (model) {
    return Object.assign(model, {
      name: newName,
      email: newEmail,
      password: newPassword,
      age: newAge
    });
  }).then(function (model) {
    return model.save();
  }).then(function (updatedModel) {
    if (err) return next(err);
    res.sendStatus(201);
  }).catch(function (err) {
    res.send(err);
  });
});

app.use(express.static('public'));

var settings = {
  config: config,
  passport: passport
};

var routes = require('./routes')(app, settings);

// listen on $PORT or 3000
// this makes the app work on heroku
// app.listen(process.env.PORT || 3000);