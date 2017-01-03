'use strict';

const OAuth = require('oauth');
const CONFIG = require('../config');

var oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  CONFIG.consumer_key,
  CONFIG.consumer_secret,
  '1.0A',
  null,
  'HMAC-SHA1'
);

let express = require('express');
let session = require('express-session');

let app = express();

app.use(session({
  secret: 'sapphire',
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
	oauth.getOAuthRequestToken((err, oauth_token, oauth_token_secret) => {
		if(err) {
			console.error(err);
		}
		req.session.oauth = {
			oauth_token,
			oauth_token_secret
		}
		res.redirect(`https://twitter.com/oauth/authenticate?oauth_token=${oauth_token}`);
	});
});

app.get('/callback', (req, res) => {
	if(req.session.oauth) {
		req.session.oauth.oauth_verifier = req.query.oauth_verifier;

		oauth.getOAuthAccessToken(
			req.session.oauth.oauth_token,
			req.session.oauth.oauth_token_secret,
			req.session.oauth.oauth_verifier,
			(err, access_token, access_token_secret) => {
				if(err) {
					console.error(err);

					res.send('failure');
				}
				else {
					console.log(access_token);
					console.log(access_token_secret);

					res.send('success');
				}
			}
		)
	}
	else {
		res.redirect('/');
	}
});

const port = process.env.PORT || 8019;

app.listen(port, (err) => {
	if(err) {
		console.error(err);
	}
	console.info(`http://localhost:${port}`);
});
