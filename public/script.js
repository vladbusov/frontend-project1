'use strict';


const application = document.getElementById('application');
const signupSection = document.getElementById('signup');
const signinSection = document.getElementById('signin');
const scoreboardSection = document.getElementById('scoreboard');
const profileSection = document.getElementById('profile');
const profileEditSection = document.getElementById('profileEdit');
const gameSection = document.getElementById('game');
const menuSection = document.getElementById('menu');
const signinAlert = document.getElementById('alert');
const exitButton = document.getElementById('exit');

const subheader = document.getElementsByClassName('js-subheader')[0];
const unauth = document.getElementsByClassName('onlyunauth');
const auth = document.getElementsByClassName('onlyauth');
const profileInfo = document.getElementsByClassName('js-profile-info')[0];
const avatarForm = document.getElementsByClassName('js-avatar-form')[0];
const signupForm = document.getElementsByClassName('js-signup-form')[0];
const signinForm = document.getElementsByClassName('js-signin-form')[0];
const editForm = document.getElementsByClassName('js-editprofile-form')[0];
const scoreboardContainer = document.getElementsByClassName('js-scoreboard-table')[0];

signupSection.hidden = true;
signinSection.hidden = true;
scoreboardSection.hidden = true;
profileSection.hidden = true;
gameSection.hidden = true;
profileEditSection.hidden = true;

const sections = {
	signup: signupSection,
	signin: signinSection,
	scoreboard: scoreboardSection,
	menu: menuSection,
	profile: profileSection,
	game: gameSection,
	profileEdit: profileEditSection
};


function openScoreboard() {
	scoreboardContainer.innerHTML = '';

	loadAllUsers(function (err, users) {
		if (err) {
			console.error(err);
			return;
		}

		console.dir(users);
		const table = document.createElement('table');
		const tbody = document.createElement('tbody');
		table.appendChild(tbody);

		users.forEach(function (user) {
			const trow = document.createElement('tr');

			const tdEmail = document.createElement('td');
			tdEmail.textContent = user.email;

			const tdAge = document.createElement('td');
			tdAge.textContent = user.age;

			const tdScore = document.createElement('td');
			tdScore.textContent = user.score;

			trow.appendChild(tdEmail);
			trow.appendChild(tdAge);
			trow.appendChild(tdScore);

			tbody.appendChild(trow);
		});

		scoreboardContainer.appendChild(table);

		table.style.fontSize = '18px';
	});
}

function onSubmitSigninForm(evt) {
	evt.preventDefault();
	const fields = ['email', 'password'];

	const form = evt.currentTarget;
	const formElements = form.elements;

	const formdata = fields.reduce(function (allfields, fieldname) {
		allfields[fieldname] = formElements[fieldname].value;
		return allfields;
	}, {});

	console.info('Авторизация пользователя', formdata);

	loginUser(formdata, function (err, response) {
		if (err) {
			signupForm.reset();
			//alert('Неверно!');
			signinAlert.textContent = "Неверно";
			return;
		}

		checkAuth();
		loadProfile();
		openSection('menu');
	});
}

function upload(file) {

  var xhr = new XMLHttpRequest();

  // обработчик для закачки
  xhr.upload.onprogress = function(event) {
    console.log(event.loaded + ' / ' + event.total);
  }

  // обработчики успеха и ошибки
  // если status == 200, то это успех, иначе ошибка
  xhr.onload = xhr.onerror = function() {
    if (this.status == 200) {
      console.log("success");
    } else {
      console.log("error " + this.status);
    }
  };

  xhr.open("POST", "upload", true);
  xhr.send(file);

}

function onSubmitAvatarForm(evt) {
	evt.preventDefault();
	console.log("обработчик сработал!");
	const form = evt.currentTarget;
	const avatar = form.elements.file.files[0];
	console.log(avatar);
	if (avatar){
		upload(avatar);
	}
}

function onSubmitEditForm(evt) {
	evt.preventDefault();
	const fields = ['email', 'age'];
	const form = evt.currentTarget;
	const formElements = form.elements;

	const formdata = fields.reduce(function (allfields, fieldname) {
		allfields[fieldname] = formElements[fieldname].value;
		return allfields;
	}, {});

	console.info('Изменение данных пользователя', formdata);

	editUser(formdata, function (err, response) {
		if (err) {
			signupForm.reset();
			return;
		}

	checkAuth();
	loadProfile();
	});

}

function onSubmitSignupForm(evt) {
	evt.preventDefault();
	const fields = ['email', 'password', 'password_repeat', 'age'];

	const form = evt.currentTarget;
	const formElements = form.elements;

	const formdata = fields.reduce(function (allfields, fieldname) {
		allfields[fieldname] = formElements[fieldname].value;
		return allfields;
	}, {});

	console.info('Регистрация пользователя', formdata);

	signupUser(formdata, function (err, response) {
		if (err) {
			signupForm.reset();
			alert('Неверно!');
			return;
		}

		checkAuth();
		loadProfile();
		openSection('menu');
	});
}

function exit() {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', '/unlogin', true);
	xhr.withCredentials = true;
	xhr.send();
	setTimeout(checkAuth, 4);
}

const openFunctions = {
	scoreboard: openScoreboard,
	signup: function () {
		signupForm.removeEventListener('submit', onSubmitSignupForm);
		signupForm.reset();
		signupForm.addEventListener('submit', onSubmitSignupForm);
	},
	signin: function () {
		signinForm.removeEventListener('submit', onSubmitSigninForm);
		signinForm.reset();
		signinForm.addEventListener('submit', onSubmitSigninForm);
	},
	profileEdit: function(){
		editForm.removeEventListener('submit', onSubmitEditForm);
		avatarForm.removeEventListener('submit', onSubmitAvatarForm);
		editForm.reset();
		avatarForm.reset();
		editForm.addEventListener('submit', onSubmitEditForm);
		avatarForm.addEventListener('submit', onSubmitAvatarForm);
	}
};

function openSection(name) {
	Object.keys(sections).forEach(function (key) {
		if (key === name) {
			sections[key].hidden = false;
		} else {
			sections[key].hidden = true;
		}
	});

	if (openFunctions[name]) {
		openFunctions[name]();
	}
}

application.addEventListener('click', function (evt) {
	console.log(evt);
	const target = evt.target;
	if (target.tagName.toLowerCase() !== 'a') {
		return;
	}

	evt.preventDefault();

	const section = target.getAttribute('data-section');
	const action = target.id;

	if (section != null){
		console.log(`Открываем секцию`, section);
		openSection(section);
	} else if (action === 'exit'){
		exit();
	}
});


function loadAllUsers(callback) {
	const xhr = new XMLHttpRequest();
	xhr.open('GET', '/users', true);

	xhr.onreadystatechange = function () {
		if (xhr.readyState != 4) {
			return;
		}

		if (xhr.status === 200) {
			const responseText = xhr.responseText;
			const response = JSON.parse(responseText);
			callback(null, response);
		} else {
			callback(xhr);
		}
	};

	xhr.send();
}

function loadMe(callback) {
	const xhr = new XMLHttpRequest();
	xhr.open('GET', '/me', true);

	xhr.onreadystatechange = function () {
		if (xhr.readyState != 4) {
			return;
		}

		if (xhr.status === 200) {
			const responseText = xhr.responseText;
			const response = JSON.parse(responseText);
			callback(null, response);
		} else {
			callback(xhr);
		}
	};

	xhr.withCredentials = true;

	xhr.send();
}


function signupUser(user, callback) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', '/signup', true);

	xhr.onreadystatechange = function () {
		if (xhr.readyState != 4) {
			return;
		}

		if (xhr.status < 300) {
			const responseText = xhr.responseText;
			const response = JSON.parse(responseText);
			callback(null, response);
		} else {
			callback(xhr);
		}
	};

	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	xhr.withCredentials = true;

	xhr.send(JSON.stringify(user));
}

function editUser(user, callback) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', '/editprofile', true);

	xhr.onreadystatechange = function () {
		if (xhr.readyState != 4) {
			return;
		}

		if (xhr.status < 300) {
			const responseText = xhr.responseText;
			const response = JSON.parse(responseText);
			callback(null, response);
		} else {
			callback(xhr);
		}
	};

	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	xhr.withCredentials = true;

	xhr.send(JSON.stringify(user));
}

function loginUser(user, callback) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', '/login', true);

	xhr.onreadystatechange = function () {
		if (xhr.readyState != 4) {
			return;
		}

		if (xhr.status < 300) {
			const responseText = xhr.responseText;
			const response = JSON.parse(responseText);
			callback(null, response);
		} else {
			callback(xhr);
		}
	};

	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	xhr.withCredentials = true;

	xhr.send(JSON.stringify(user));
}

function loadProfile() {
	loadMe(function (err, me) {
		if (err) {
			profileInfo.textContent = 'Вы неавторизованы';
			return;
		}

		console.dir(me);
		profileInfo.innerHTML = `<h4> ${me.email} </h4> <p> Ваш возраст: ${me.age} </p> <p> Ваш рекорд: ${me.score} </p>`;
		profileInfo.innerHTML = profileInfo.innerHTML + `<p> <img width="50" height="50" src = "../server/upload/${me.avatar}"> </img> </p>`
	});

}

function checkAuth() {
	loadMe(function (err, me) {
		if (err) {
			subheader.textContent = 'Вы неавторизованы';
			[].forEach.call(unauth, function (el) {
				el.hidden = false;
			});
			[].forEach.call(auth, function (el) {
				el.hidden = true;
			});
			return;
		}

		console.dir(me);
		subheader.textContent = `Привет, ${me.email}!!!`;
		[].forEach.call(auth, function (el) {
			el.hidden = false;
		});
		[].forEach.call(unauth, function (el) {
			el.hidden = true;
		});
	});

}

checkAuth();
loadProfile();