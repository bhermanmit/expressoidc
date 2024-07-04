'use strict';

require('dotenv').config();

const express = require('express')
const hbs = require('hbs')
const config = require('./config.js')

const issuer = require('./openIdIssuer')();
issuer.defaultHttpOptions = { timeout: 3500 }

const app = express()

app.set('view engine', 'hbs')

global.Headers = fetch.Headers;

let client;
let user;

app.get('/', (req, res) => {
    console.log(user);
	res.render('home', {session: user, pretty: JSON.stringify(user, null, 2)})
})

app.get('/login', (req, res, next) => {

    let authUrl = client.authorizationUrl({
        redirect_uri: 'http://localhost:3000/callback',
        scope: config.scope
    });

    res.redirect(authUrl);
})

app.get('/callback', async (req, res, next) => {

    const params = client.callbackParams(req);
    const token = await client.callback('http://localhost:3000/callback', params);
    const userinfo = await client.userinfo(token.access_token);
    user = {
        token: token,
        userinfo: userinfo
    }

    res.redirect('/');
})

issuer.then(issuer => {
  client = new issuer.Client({
    client_id: config.client_id,
    client_secret: config.client_secret
  })

  app.listen(config.port, () => console.log(`Sample app listening on port ${config.port}!`))
})
