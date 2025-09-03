import { Request, Response, NextFunction } from 'express';

function checkAuthenticationRequired(req: Request, res: Response, next: NextFunction) {
  let url = req.url.split("?").shift()?.slice(1).split("/");
  url = (url && url[0] === "") ? undefined : url;
  const regex = /\\([a-zA-Z0-9])\\g/;
  if (url && url.some(segment => regex.test(segment))) {
    basicAuthentication(req, res, next);
  }
  next();
}

function basicAuthentication(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"');
    return res.status(401).send('Authentication required.');
  }

  const base64Credentials = authHeader.split(' ')[1];
  if (!base64Credentials) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"');
    return res.status(401).send('Invalid authentication header.');
  }
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [username, password] = credentials.split(':');

  // Replace these with your desired username and password
  const validUsername = 'admin';
  const validPassword = 'password';

  if (username === validUsername && password === validPassword) {
    return next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"');
    return res.status(401).send('Invalid credentials.');
  }
}

export default checkAuthenticationRequired;