const axios = require('axios');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/dbConfig");

const { authenticate, jwtKey } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  let user = req.body;

  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;

  db("users").insert(user)
  .then(userId => {
    const [id] = userId;
    db("users").where("id", id).then(user => {
      res.status(201).json(user);
    })
  })
  .catch(err => {
    res.status(500).json({error: "There was an error registering the user."})
  })
}

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: '1d'
  };

  return jwt.sign(payload, jwtKey, options)
}

function login(req, res) {
  let { username, password } = req.body;

  db("users").where("username", username).first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.status(200).json({
          message: `Welcome, ${user.username}`,
          token
        })
      } else {
        res.status(401).json({error: "invalid credentials, please try again."})
      }
    })
    .catch(err => {
      res.status(500).json({message: "There was an error logging in the user."})
    })
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
