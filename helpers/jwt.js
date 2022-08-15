const expressJwt = require("express-jwt").expressjwt;

function authJwt() {
  const secret = process.env.SECRET;
  const api = process.env.API_URL;
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      //URLS wich don't require authorization 'token'
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },

      //when token expired
      `${api}/users/login`,
      //when is a new user
      `${api}/users/register`,
    ],
  });
}
/*
async function isRevoked(req, payload, done) {
  if (!payload.payload.isAdmin) {
    done(null, true);
  }
  done();
} */
async function isRevoked(req, token) {
  // token now contains payload data
  //console.log(token);

  if (!token.payload.isAdmin) {
    return true; // if the isAdmin flag in payload is false, then we reject the token
  }
  return false;
}
module.exports = authJwt;
