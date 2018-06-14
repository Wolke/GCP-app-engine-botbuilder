var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require("./conf")
var builder = require("botbuilder");
var botbuilder_linebot_connector_1 = require("botbuilder-linebot-connector");
var connector = new botbuilder_linebot_connector_1.LineConnector({
  hasPushApi: false,
  autoGetUserProfile: false,
  // your line
  channelId: process.env.channelId || config.channelId,
  channelSecret: process.env.channelSecret || config.channelSecret,
  channelAccessToken: process.env.channelAccessToken || config.channelAccessToken
});


const Datastore = require('@google-cloud/datastore');
var database = require("botbuilder-storage-google-cloud-datastore");

const ds = Datastore({
  projectId: 'appgg-207107'
});
const kind = 'botState';
var client = new database.GDatastoreBotStorage(ds, { kind: kind });


var bot = new builder.UniversalBot(connector)
  .set("storage", client);


bot.dialog("/", [s => {
  s.send("hello");

  s.beginDialog("greetings")
}
  , s => {
    s.send("bady")
  }

])
bot.dialog('greetings', [
  // Step 1
  function (session) {
    session.send(new builder.Message(session).addAttachment(new botbuilder_linebot_connector_1.Sticker(session, 1, 2)))
    builder.Prompts.text(session, 'Hi! What is your name?');
  },
  // Step 2
  function (session, results) {
    session.endDialog(`Hello ${results.response}!`);
  }
]);

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);



// app.post("line", (req, rep) => connector.listen())
app.use("/line", connector.listen());


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
