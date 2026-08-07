import { ISessionUser } from './common';

declare module 'express-session' {
  interface SessionData {
    user: ISessionUser;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: ISessionUser;
  }
}
