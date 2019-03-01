const axios = require('axios');
const bcrypt = require("bcryptjs");
const db = require("../database/dbConfig");

const { authenticate } = require('../auth/authenticate');

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

function login(req, res) {
  // implement user login
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
