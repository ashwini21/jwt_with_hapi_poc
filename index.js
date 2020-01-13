const Hapi = require("hapi");
const hapiAuthJWT = require('./lib/');
const JWT         = require('jsonwebtoken');  // used to sign our content
const port        = process.env.PORT || 3000; // allow port to be set
const jwt_decode = require("jwt-decode");
const secret = 'NeverShareYourSecret'; 

const people = {
    1: {
      id: 1,
      name: 'John Thomas'
    }

};



const token = JWT.sign(people[1], secret); 
console.log(token);
var decoded = jwt_decode(token);
console.log(decoded);

// bring your own validation function
const validate = async function (decoded, request, h) {
  // do your checks to see if the person is valid
  if (!people[decoded.id]) {
    return { isValid: false };
  }
  else {
    return { isValid: true };
  }
};

const init = async () => {
  const server = new Hapi.Server({ port: port });
  await server.register(hapiAuthJWT);
  server.auth.strategy('jwt', 'jwt',
  { key: secret, // Never Share your secret key
    validate,  // validate function defined above
    verifyOptions: { ignoreExpiration: true }
  });

  server.auth.default('jwt');

  server.route([
    {
      method: "POST", path: "/", config: { auth: false },
      handler: function(request, h) {
        return {text: 'Token not provided' };
      }
    },
    {
      method: 'POST', path: '/checkAuth', config: { auth: 'jwt' },
      handler: function(request, h) {
        console.log("++++",request.info.hostname);
        const response = h.response({message: 'You used a Valid JWT Token'});
        response.header("Authorization", request.headers.authorization);
        return response;
      }
    }
  ]);
  await server.start();
  return server;
}
init().then(server => {
  console.log('Server running at:', server.info.uri);
})
.catch(err => {
  console.log(err);
});


