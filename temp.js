// const createError = require('http-errors');
const express = require('express');
const path = require('path');
// const cookieParser = require('cookie-parser'); // not for Netlify
const logger = require('morgan');
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cors = require('cors')({ origin: true, credentials: true }); // deploy Netlify
require('dotenv').config();
mongoose.set('useCreateIndex', true);
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('connected to: ', process.env.MONGO_URL);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  });
const authRouter = require('./routes/auth');
// const indexRouter = require('./routes/index');
const usersRouter = require('./routes/user');
const employeesRouter = require('./routes/employee');
const workingDaysRouter = require('./routes/workingDay');
const shiftsRouter = require('./routes/shift');
const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser()); // not to be used for Netlify
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60, // 1 day
    }),
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    name: 'relevo24', // cookie config
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'none', // important for Netlify
      secure: process.env.NODE_ENV === 'production', // important for Netlify
    },
  }),
);
app.set('trust proxy', true);
app.use(cors); // Netlify
app.options('*', cors); // Netlify
// // to be used if not deployed with Netlify
// app.use(
//   cors({
//     credentials: true,
//     origin: [process.env.FRONTEND_URL],
//   }),
// );
app.use((req, res, next) => {
  app.locals.currentUser = req.session.currentUser;
  next();
});
app.use('/', authRouter);
// app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/workingdays', workingDaysRouter);
app.use('/api/shifts', shiftsRouter);
// catch 404 and forward to error handler
// eslint-disable-next-line no-unused-vars
app.use((req, res, next) => {
  res.status(404).json({ code: 'not found' });
});
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // always log the error
  // eslint-disable-next-line no-console
  console.error('ERROR', req.method, req.path, err);
  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500).json({ code: 'unexpected' });
  }
});
module.exports = app;