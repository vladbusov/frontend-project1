'use strict';

const path = require('path');
const express = require('express');
const body = require('body-parser');
const cookie = require('cookie-parser');
const morgan = require('morgan');
const debug = require('debug');
const uuid = require('uuid/v4');
const formidable = require('formidable');
const fs = require('fs');

const logger = debug('mylogger');
logger('Starting app');
const app = express();


app.use(morgan('dev'));
app.use(express.static(path.resolve(__dirname, '..', 'public')));
app.use(body.json());
app.use(cookie());


let users = {
	'a.ostapenko@corp.mail.ru': {
		email: 'a.ostapenko@corp.mail.ru',
		password: 'password',
		age: 20,
		score: 72,
		avatar: ""
	},
	'd.dorofeev@corp.mail.ru': {
		email: 'd.dorofeev@corp.mail.ru',
		password: 'password',
		age: 20,
		score: 100500,
		avatar: ""
	},
	'a.udalov@corp.mail.ru': {
		email: 'a.udalov@corp.mail.ru',
		password: 'password',
		age: 20,
		score: 72,
		avatar: ""
	},
	'marina.titova@corp.mail.ru': {
		email: 'marina.titova@corp.mail.ru',
		password: 'password',
		age: 20,
		score: 72,
		avatar: ""
	},
	'a.tyuldyukov@corp.mail.ru': {
		email: 'a.tyuldyukov@corp.mail.ru',
		password: 'password',
		age: 20,
		score: 72,
		avatar: ""
	},
	'to2002to2002@gmail.com': {
		email: 'to2002to2002@gmail.com',
		password: '12131415',
		age: 19,
		score: 72,
		avatar: "avatar/ava.png"
	}
};
const ids = {};

app.post('/signup', function (req, res) {
	const password = req.body.password;
	const email = req.body.email;
	const age = +req.body.age;
	if (
		!password || !email || !age ||
		!password.match(/^\S{4,}$/) ||
		!email.match(/@/) ||
		!(typeof age === 'number' && age > 10 && age < 100)
	) {
		return res.status(400).json({error: 'Не валидные данные пользователя'});
	}
	if (users[email]) {
		return res.status(400).json({error: 'Пользователь уже существует'});
	}

	const id = uuid();
	const user = {password, email, age, score: 0};
	ids[id] = email;
	users[email] = user;

	res.cookie('frontend', id, {expires: new Date(Date.now() + 1000 * 60 * 10)});
	res.status(201).json({id});
});


app.post('/editprofile', function (req, res) {
	const email = req.body.email;
	const age = +req.body.age;
	const id = req.cookies['frontend'];
	
	const currentEmail = ids[id];
	console.log(currentEmail);

	if (!email && !age ) {
		return res.status(400).json({error: 'Вы ничего не ввели!'});
	}

	if (users[email] && currentEmail != email) {
		return res.status(400).json({error: 'Почта уже была зарегистрирована!'});
	}
	if (age){
		users[currentEmail].age = age;
	} 
	if (email){
		users[currentEmail].email = email;
		ids[id] = email;
	} 
	res.status(201).json({id});
});

app.post('/upload', function (req, res) {
	/*
	let length = 0;
	req.on('data', function(chunk) {
      // ничего не делаем с приходящими данными, просто считываем
      length += chunk.length;
      if (length > 50 * 1024 * 1024) {
        res.statusCode = 413;
        res.end("File too big");
      }
    }).on('end', function() {
      res.end('ok');
    });
    */
    const id = req.cookies['frontend'];
    const email = ids[id];

    const form = new formidable.IncomingForm();

    form.parse(req);
    
    form.on('fileBegin', function (name, file){
        file.path = __dirname + '/uploads/' + id + '-' + file.name;
        if (users[email] != null){
        	users[email].avatar = '' + id + '-' + file.name;
    	}
    });

    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);
    });

    //res.sendFile(__dirname + '/index.html');
    res.end();
});


app.post('/login', function (req, res) {
	const password = req.body.password;
	const email = req.body.email;
	if (!password || !email) {
		return res.status(400).json({error: 'Не указан E-Mail или пароль'});
	}
	if (!users[email] || users[email].password !== password) {
		return res.status(400).json({error: 'Не верный E-Mail и/или пароль'});
	}

	const id = uuid();
	ids[id] = email;

	res.cookie('frontend', id, {expires: new Date(Date.now() + 1000 * 60 * 10)});
	res.status(201).json({id});
});

app.post('/unlogin', function (req, res) {

	res.cookie('frontend', req.cookies['frontend'], {expires: new Date(Date.now())});
	res.end();
});

app.get('/me', function (req, res) {
	const id = req.cookies['frontend'];
	const email = ids[id];
	if (!email || !users[email]) {
		return res.status(401).end();
	}

	users[email].score += 1;

	res.json(users[email]);
});

app.get('/users', function (req, res) {
	const scorelist = Object.values(users)
		.sort((l, r) => r.score - l.score)
		.map(user => {
			return {
				email: user.email,
				age: user.age,
				score: user.score
			};
		});

	res.json(scorelist);
});

const port = process.env.PORT || 3000;

app.listen(port, function () {
	logger(`Server listening port ${port}`);
});
