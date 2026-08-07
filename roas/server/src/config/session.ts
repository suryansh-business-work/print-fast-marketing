import session from 'express-session';
import MongoStore from 'connect-mongo';
import config from './config';

const sessionConfig: session.SessionOptions = {
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.mongodbUri,
    collectionName: 'sessions',
    ttl: config.sessionMaxAge / 1000,
  }),
  cookie: {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
    maxAge: config.sessionMaxAge,
  },
};

export default sessionConfig;
