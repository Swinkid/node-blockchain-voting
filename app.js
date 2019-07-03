var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var socket_io = require('socket.io');
var client = require('socket.io-client');

const { PORT } = process.env;

var Block = require('./models/block');
var Blockchain = require('./models/blockchain');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var io = socket_io();
app.io = io;

const blockchain = new Blockchain(null, io);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.io.on('connection', (socket) => {
  console.info(`Blockchain Node connected, ID: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Blockchain Node disconnected, ID: ${socket.id}`);
  });
});

blockchain.addNode(client(`http://localhost:${PORT}`));

module.exports = app;
