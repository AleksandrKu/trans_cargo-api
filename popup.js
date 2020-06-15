/* eslint-disable no-undef */
'use strict';
const cargoLtUrl = 'https://io.cargo.lt/';
const urlDomain = 'https://platform.trans.eu/freights/sent';
let globalLogin;
let globalPassword;
let globalUserId;

function setCookies(url = 'https://system.trans.eu/', login, password, userId) {
  const days = 3600 * 1000 * 24 * 20; //20 days
  const expirationDate = (new Date().getTime() + days) / 1000;
  const loginCookieObj = {
    name: 'login',
    value: login,
    path: '/',
    url,
    expirationDate,
    secure: true
  };
  const passwordCookieObj = {
    name: 'id',
    value: password,
    path: '/',
    url,
    expirationDate,
    secure: true
  };
  const userIdCookieObj = {
    name: 'userId',
    value: String(userId),
    path: '/',
    url,
    expirationDate,
    secure: true
  };
  try {
    chrome.cookies.set(loginCookieObj, res => {});
    chrome.cookies.set(passwordCookieObj, res => {});
    chrome.cookies.set(userIdCookieObj, res => {});
  } catch (e) { console.error('Error setting cookie:\n' + e); }
}

function getCookie(url = 'https://system.trans.eu/', name) {
  return new Promise((resolve, reject) => {
    const cookieObj = { name, url };
    try {
      chrome.cookies.get(cookieObj, cookie => {
        if (cookie) {
          resolve(cookie.value);
        } else {
          resolve('');
        }
      });
    } catch (e) {
      console.error('Error setting cookie:\n' + e);
      reject('Error setting cookie:\n' + e);
    }
  });
}

function logged(login) {
  const body = document.getElementById('body');
  body.removeAttribute('style');

  const cargoLogin = document.getElementById('cargoLogin');
  cargoLogin.classList.add('hidden');

  const top = document.getElementById('top');
  top.classList.remove('center');

  const exit = document.getElementById('exit');
  exit.classList.remove('hidden');

  const textExport = document.getElementById('text-export');
  textExport.classList.add('hidden');

  const user = document.getElementById('user');
  user.classList.remove('hidden');
  user.textContent = ` Manager:  ${login}`;

  const textImport = document.getElementById('text-import');
  textImport.classList.remove('hidden');
}

(async () => {
  const loginCookie = await getCookie(urlDomain, 'login');
  const passwordCookie = await getCookie(urlDomain, 'id');
  const userIdCookie = await getCookie(urlDomain, 'userId');
  if (loginCookie && passwordCookie && userIdCookie) {
    globalLogin = loginCookie;
    globalPassword = passwordCookie;
    globalUserId = userIdCookie;
    logged(loginCookie); //hide registration form
  }
})();

// exit, delete cookie
const cargoExit = document.getElementById('exit');
cargoExit.addEventListener('click', () => {
  chrome.cookies.remove({ name: 'login', url: urlDomain }, () => {});
  chrome.cookies.remove({ name: 'id', url: urlDomain }, () => {});
  chrome.cookies.remove({ name: 'userId', url: urlDomain }, () => {});
  chrome.runtime.reload();
});

// logIn
const cargoSubmit = document.getElementById('cargoSubmit');
cargoSubmit.addEventListener('click', () => {
  const url = cargoLtUrl + 'accounts/signin';
  const credential = {};
  credential.login = document.getElementById('cargo_login').value;
  credential.password = document.getElementById('cargo_password').value;
  const json = JSON.stringify(credential);
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  xhr.onload = async function () {
    try {
      const tokenObject = JSON.parse(xhr.responseText);
      if (xhr.readyState === 4 && xhr.status === 200 && typeof tokenObject.userId === 'number') {
        await setCookies(urlDomain, credential.login, credential.password, tokenObject.userId);
        globalLogin = tokenObject.login;
        globalPassword = tokenObject.password;
        globalUserId = tokenObject.userId;
        logged(credential.login); //hide registration form
      } else {
        document.getElementById('error').innerText = 'Invalid login or password';
        console.error(tokenObject);
      }
    } catch (err) {
      console.error(err);
    }
  };
  xhr.send(json);
}, false);
