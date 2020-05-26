'use strict';
const trucks = new Map([
  ['skrzynia', '3'],
  ['sztywna zabudowa', '3'],
  ['standard', '2'],
  ['firanka', '2'],
  ['izoterma', '3'],
  ['cysterna spożywcza', '7'],
  ['chłodnia', '1'],
  ['hakówka', '1'],
  ['inna cysterna', '7'],
  ['laweta', '6'],
]);
let userId;
const preparingBody = body => {
  const fromDates = body.fromDate.split('.');
  let fromDate = new Date(fromDates[2], +fromDates[1] - 1, fromDates[0], 3, 0, 0, 0);
  fromDate = fromDate.getTime() * 0.001;
  const tillDate = fromDate + (23 * 3600 + 59 * 60 + 59);

  const toDates = body.toDate.split('.');
  let fromDateto = new Date(toDates[2], +toDates[1] - 1, toDates[0], 3, 0, 0, 0);
  fromDateto = fromDateto.getTime() * 0.001;
  const tillDateto = fromDateto + (23 * 3600 + 59 * 60 + 59);

  const originCountry = body.origins.split(',')[0];
  const originName = body.origins.split(' ')[2];
  const originZipcode = body.origins.split(' ')[1];

  const destinationsCountry = body.destinations.split(',')[0];
  const destinationsName = body.destinations.split(' ')[2];
  const destinationsZipcode = body.destinations.split(' ')[1];

  const trailersCargo = body.trailers.split(',');
  const trailers = [];
  for (let trailer of trailersCargo) {
    trailer = trailer ? trailer.trim() : 'standard';
    const number = trucks.has(trailer) ? Number(trucks.get(trailer)) : 55;
    trailers.push(number);
  }
  if (trailers.length > 5) return null;
  const volumeldm = body.volumeldm;
  const weight = body.weight;
  const wayOfLoading = body.wayOfLoading;
  const top = wayOfLoading.includes('górą') ? 1 : 0;
  const side = wayOfLoading.includes('bokiem') ? 1 : 0;
  const back = wayOfLoading.includes('tyłem') ? 1 : 0;
  const notes = body.other;
  const ftlOrLtl = body.ftlOrLtl ? body.ftlOrLtl : '';
  const full = ftlOrLtl.includes('FTL') ? 1 : 0;
  const partly = ftlOrLtl.includes('LTL') ? 1 : 0;
  const type = 55;
  if (!(originCountry && originName && destinationsCountry && destinationsName && trailers && type && (weight || volumeldm))) return null;
  const response = {
    origins: [
      {
        country: originCountry,
        zipcode: originZipcode,
        name: originName,
      },
    ],
    destinations: [
      {
        country: destinationsCountry,
        zipcode: destinationsZipcode,
        name: destinationsName,
      },
    ],
    type,
    trailers,
    fromDate,
    tillDate,
    fromDateto,
    tillDateto,
    volumeldm,
    weight,
    notes,
    top,
    side,
    back,
    full,
    partly,
    // account: userId,
  };
  return response;
};

const selectorButtonSendCargo = '#app > div > div > div > div > div > div > div > div > div > div > div > section > footer > div > div:nth-child(2) > button[data-ctx="search-publications"]';

let login, password;

const baseApiUrl = 'https://cargo-api-express.herokuapp.com';
const getCookie = name =>
  new Promise((resolve, reject) => {
    try {
      const coookies = document.cookie.split(';');
      for (let cookie of coookies) {
        cookie = cookie ? cookie.trim() : '';
        const cookieArray = cookie.split('=');
        if (cookieArray[0] === name) resolve(cookieArray[1]);
      }
      resolve('');
    } catch (err) {
      resolve('');
    }
  });

const getToken = async body => {
  const urlApi = baseApiUrl + '/accounts/signin';
  const jsonBody = JSON.stringify(body);
  const response = await fetch(urlApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': jsonBody.length,
    },
    body: jsonBody,
  });
  const result = await response.json();
  console.log(result);
  return result.data;
};

const sendCargo = async (body, token) => {
  const urlApi = baseApiUrl + '/cargos';
  const jsonBody = JSON.stringify(body);
  const response = await fetch(urlApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': jsonBody.length,
      'Access-Token': token
    },
    body: jsonBody,
  });
  const result = await response.json();
  return result.data;
};

(function () {
  checkButtonSendCargo();
})();
async function getCookies() {
  login = await getCookie('login');
  password = await getCookie('id');
  userId = await getCookie('userId');
  console.log(login, password, userId);
}

const getCargoFromPage = () => {
  const order = {};
  const fromDate = document.querySelector(
    '#form > div > div > div:nth-child(2) > div > div > div:nth-child(1) > div:nth-child(2) > div > div > div > label > div > div > label[data-ctx="date-input-trigger"] > div > div > input');
  order.fromDate = fromDate ? fromDate.value : '';
  const fromTime = document.querySelector('#form > div > div > div:nth-child(2) > div > div > div:nth-child(1) > div:nth-child(2) > div > div:nth-child(2) > label > div > div > label > div > div > input');
  order.fromTime = fromTime ? fromTime.value : '';

  const toDate = document.querySelector('#form > div > div > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div > label > div > div > label > div > div > input');
  order.toDate = toDate ? toDate.value : '';
  const toTime = document.querySelector(
    '#form > div > div > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > label > div > div > label > div > div > input');
  order.toTime = toTime ? toTime.value : '';

  const origins = document.querySelector('#form > div > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div > div > div > div');
  order.origins = origins ? origins.innerText : '';

  const destinations = document.querySelector('#form > div > div > div:nth-child(2) > div > div > div:nth-child(2) > div > div > div > div > div');
  order.destinations = destinations ? destinations.innerText : '';

  const type = document.querySelector('#form > div > div > div > div > div:nth-child(1) > div > div > div > div > label > div > div:nth-child(2) > label > div > div > input');
  order.trailers = type ? type.value : '';

  const volumeldm = document.querySelector('#form > div > div > div > div > div:nth-child(1) > div > div > div > div > label[data-ctx="loading-meters-text-field"] > div:nth-child(2) > div > input');
  order.volumeldm = volumeldm ? volumeldm.value : '';

  const weight = document.querySelector('#form > div > div > div > div > div:nth-child(1) > div > div > div > div > label > div:nth-child(2) > div > input');
  order.weight = weight ? weight.value : '';

  const wayOfLoading = document.querySelector('#form > div > div > div > div > div:nth-child(1) > div > div > div > div > div[data-ctx="wayOfLoading"] > div[data-ctx="value"]');
  order.wayOfLoading = wayOfLoading ? wayOfLoading.innerText : '';

  const other = document.querySelector('#form > div > div > div > div > div:nth-child(1) > div > div > div > div > div[data-ctx="other"] > div[data-ctx="value"]');
  order.other = other ? other.innerText : '';

  const ftlOrLtl = document.querySelector('input[name="form.requirements.isFtl"]:checked');
  order.ftlOrLtl = ftlOrLtl && ftlOrLtl.value ? ftlOrLtl.value : '';

  if (order.origins &&
    order.destinations &&
    order.trailers &&
    order.fromDate &&
    order.toDate &&
    order.weight
  ) {
    return order;
  }
  return null;
};

function checkButtonSendCargo() {
  const checkButtonInterval = setInterval(() => {
    const sendCorgoButton = document.querySelector(selectorButtonSendCargo);
    if (sendCorgoButton) {
      sendCorgoButton.onclick = async function () {
        try {
          const cargo = getCargoFromPage();
          console.log({ cargo });
          if (!cargo) {
            console.error('Extension: cargo empty');
            return;
          }
          await getCookies();
          const body = preparingBody(cargo);
          console.log({ body });
          if (!body) {
            console.error('Extension: preparingBody empty');
            return;
          }

          const origins = Array.isArray(body.origins) ? body.origins : null;
          const destinations = Array.isArray(body.destinations) ? body.destinations : null;
          if (body &&
            origins && origins[0] && origins[0].country && origins[0].name &&
            destinations && destinations[0] && destinations[0].country && destinations[0].name &&
            body.trailers &&
            body.fromDate &&
            body.tillDate &&
            body.fromDateto &&
            body.tillDateto &&
            body.weight
          ) {
            const token = await getToken({ login, password });
            const responseFromApi = await sendCargo(body, token);
            console.log('Extension: ' + responseFromApi);
          } else {
            console.error('Extension: empty body');
          }
        } catch (err) {
          console.error(err);
        }
      };
    } else {
      console.log('No checkButtonSendCargo');
    }
  }, 5000);
}
