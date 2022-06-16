const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const PORT = 15002;
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const housesDB = require('./houses');
const historyDB = require('./history');

// let now = new Date();

let options = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

// now.toLocaleString('en-us', options);

//DB variables
const connection = mongoose.connection;
let collection;
let historyCollection;
let history;
//Allow apps CORS access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use('/public', express.static(path.join(__dirname, 'public')));

let houses;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// var hbs = exphbs.create({});

// hbs.registerHelper('date', function (aDate) {
//   return aString.toLocaleString('en-us', options);
// });

//Homepage route
app.get('/', (req, res) => {
  res.render('index', {
    title: 'My title',
    houses,
  });
});

app.get('/logs', (req, res) => {
  updateLogs();
  setTimeout(() => {
    history.forEach((log, index) => {
      log.lastUpdate = log.lastUpdate.toDateString();
      // console.log(log.lastUpdate);
      // console.log('This is working');
    });

    res.render('log', {
      history,
    });
  }, 1000);
});

app.post('/add', (req, res) => {
  let currentIndex;
  houses.forEach((locHouse, index) => {
    if (req.body.house == locHouse.house) {
      currentIndex = index;
      locHouse.points += +req.body.amount;
      if (req.body.message != '') {
        locHouse.message = req.body.message;
      }
    }
  });

  collection.findOneAndUpdate(
    { house: req.body.house },
    { $set: { points: houses[currentIndex].points } },
    (err, data) => {
      if (err) {
        console.log('Had an error');
        console.log(err);
      }
    }
  );

  collection.findOneAndUpdate(
    { house: req.body.house },
    { $set: { message: houses[currentIndex].message } },
    (err, data) => {
      if (err) {
        console.log('Had an error');
        console.log(err);
      }
    }
  );

  let demoHistory = new historyDB({
    house: req.body.house,
    points: req.body.amount,
    message: req.body.message,
    reason: req.body.reason,
    ageGroup: req.body.schoolGroup,
  });
  demoHistory.save(function (err, doc) {
    if (err) return console.error(err);
    // console.log('Document inserted succussfully!');
  });
  updateLogs();
  res.redirect('/');
});

app.get('/get', (req, res) => {
  res.json(houses);
});

/**
 *
 * App runs after the database connection is open
 *
 */
mongoose.connect(process.env.CONNECTION);

mongoose.connection.once('open', () => {
  app.emit('ready');
});

app.on('ready', function () {
  app.listen(process.env.PORT || PORT, () => {
    console.log(`Listening on port: ${PORT}`);
  });
});

connection.once('open', async function () {
  collection = connection.db.collection('houses');
  historyCollection = connection.db.collection('histories');
  collection.find({}).toArray(function (err, data) {
    houses = data;
    // console.log(houses);
  });
  historyCollection.find({}).toArray(function (err, data) {
    history = data;
    // console.log(history);
  });

  // collection.find({ house: 'Amber' }).toArray(function (err, data) {
  // console.log(data);
  // });
});

// async function addToHistoryArr() {
//   const user = new User({ name: 'Bob', age: 100 });
//   user.save().then(() => {
//     console.log('User saved');
//   });
// }

async function updateLogs() {
  await historyCollection.find({}).toArray(function (err, data) {
    history = data;
    // console.log(history);
  });
}

//Code for adding houses to an empty DB
// const ruby = new housesDB({
//   house: 'Ruby',
//   points: 100,
//   message: 'Go Amber',
// });

// ruby.save(function (err, doc) {
//   if (err) return console.error(err);
// });

// const sapphire = new housesDB({
//   house: 'Sapphire',
//   points: 100,
//   message: 'Go Sapphire',
// });

// sapphire.save(function (err, doc) {
//   if (err) return console.error(err);
// });

// const pearl = new housesDB({
//   house: 'Pearl',
//   points: 100,
//   message: 'Go Pearl',
// });

// pearl.save(function (err, doc) {
//   if (err) return console.error(err);
// });

// const amber = new housesDB({
//   house: 'Amber',
//   points: 100,
//   message: 'Go Amber',
// });

// amber.save(function (err, doc) {
//   if (err) return console.error(err);
// });
