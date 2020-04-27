'use strict'
const arrayTruck = [
    {
        "trans": "Chłodnia",
        "cargo": "1"
    },
    {
        "trans": "Firanka",
        "cargo": "2"
    },
    {
        "trans": "Plandeka",
        "cargo": "2"
    },
    {
        "trans": "Wywrotka",
        "cargo": "16"
    },
    {
        "trans": "Bus",
        "cargo": "9"
    },
    {
        "trans": "Coilmulde",
        "cargo": "2"
    },
    {
        "trans": "Cysterna chemiczna",
        "cargo": "7"
    },
    {
        "trans": "Cysterna gazowa",
        "cargo": "7"
    },
    {
        "trans": "Cysterna paliwowa",
        "cargo": "7"
    },
    {
        "trans": "Cysterna spożywcza",
        "cargo": "7"
    },
    {
        "trans": "Dłużyca",
        "cargo": "18"
    },
    {
        "trans": "Hakowiec",
        "cargo": "16"
    },
    {
        "trans": "Izoterma",
        "cargo": "3"
    },
    {
        "trans": "Izoterm",
        "cargo": "3"
    },
    {
        "trans": "Jumbo",
        "cargo": "5"
    },
    {
        "trans": "Koffer (Stała zabudowa)",
        "cargo": "8"
    },
    {
        "trans": "Kontener",
        "cargo": "4"
    },
    {
        "trans": "Kontener 20/40",
        "cargo": [
            "24",
            "25"
        ]
    },
    {
        "trans": "Laweta",
        "cargo": "6"
    },
    {
        "trans": "Meblowóz",
        "cargo": "9"
    },
    {
        "trans": "Mega",
        "cargo": "14"
    },
    {
        "trans": "Niskopodwoziowy",
        "cargo": "18"
    },
    {
        "trans": "Ponadgabaryt",
        "cargo": "18"
    },
    {
        "trans": "Przestrzenne",
        "cargo": "18"
    },
    {
        "trans": "Podłoga ruchoma",
        "cargo": "18"
    },
    {
        "trans": "Silos",
        "cargo": "16"
    },
    {
        "trans": "Wymienne podwozie",
        "cargo": "18"
    },
    {
        "trans": "Zestaw",
        "cargo": "8"
    },
    {
        "trans": "Inne",
        "cargo": "2"
    }
];
const currency = [
    {
        "trans": "BYR",
        "cargo": "18"
    },
    {
        "trans": "EUR",
        "cargo": "2"
    },
    {
        "trans": "KZT",
        "cargo": "19"
    },
    {
        "trans": "PLN",
        "cargo": "13"
    },
    {
        "trans": "RUB",
        "cargo": "6"
    },
    {
        "trans": "UAH",
        "cargo": "15"
    },
    {
        "trans": "USD",
        "cargo": "7"
    }
];
//const cargoLtUrl = "https://io.cargo.lt/";
const cargoLtUrl = "https://api.cargo.lt/";
// const urlDomain = "https://system.trans.eu/";
// const urlDomain = "https://platform.trans.eu/my-offers";
const urlDomain = "https://platform.trans.eu/freights/sent";
let g_login;
let g_password;
let g_token;
let g_managerId;

let idbName = 'trans'; 
let idbVersion = 1; //versions start at 1 
let db;
const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
const IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
let ordersFromDb = []; 
    const request = indexedDB.open(idbName, idbVersion);
    request.onerror = function(err){
        console.log(err);
    };
   request.onsuccess = async (event) => {
        console.log('Success! DB has been opened!');
        db = event.target.result;
        const objectStore = await db.transaction(["trans"], 'readwrite').objectStore("trans");
        const request = await objectStore.getAll();
        request.onsuccess = async function(event) {
            ordersFromDb = event.target.result;
            const now = new Date().getTime();
            for(const obj of ordersFromDb) {
                if(obj.loadTime + 86400000  < now)  {  objectStore.delete(obj.order) }
            }
        };

    };
        request.onupgradeneeded = function(event) {
        const DB = event.target.result;
        if(!DB.objectStoreNames.contains('Orders')) {
            const ObjectStore = DB.createObjectStore(idbName, { keyPath: "order", autoIncrement: true });
        }
    }

function getEndDay(start, end) {
    start = start - (3600 * 3); // Минус 3 часа в секундах, так как выводило на 1день вперед
    const _3_days_in_seconds = 3600 * 24 * 3;
    if (end - start > _3_days_in_seconds) {
        end = +start + _3_days_in_seconds;
    }
    return end; //если больше чем 3 дня, то обрезает до 3-х дней
}

function dateView(date_in_seconds) {
    date_in_seconds = date_in_seconds - (3600 * 1); // минус 1 час
    //date_in_seconds = date_in_seconds;
    const date = new Date(date_in_seconds * 1000);
    let day = date.getDate().toString();
    day = (day.length < 2) ? "0" + day : day;
    let month = (date.getMonth() + 1).toString();
    month = (month.length < 2) ? "0" + month : month;
    return day + "." + month;
}

function getAccounts(companyAccessToken) {
    return new Promise(function (resolve, reject) {

        let url = cargoLtUrl + "accounts";
        //const json = JSON.stringify(order);

        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        // xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('Access-Token', companyAccessToken);
        xhr.onload = function () {
            let res = JSON.parse(xhr.responseText);
            if (xhr.readyState == 4 && xhr.status == "200") {
                if (res.accounts) {
                    document.getElementById("cargo-managers").classList.remove("hidden");
                    document.getElementById("company-enter-token").classList.add("hidden");
                    document.getElementById("user").classList.add("hidden");
                    const selectCargoManagers = document.getElementById('select-cargo-managers');
                    for (let i = 0; i < res.accounts.length; i++) {
                        let opt = document.createElement('option');
                        opt.value = res.accounts[i].id;
                        opt.innerHTML = res.accounts[i].name;
                        selectCargoManagers.appendChild(opt);
                    }
                } else {
                    console.log("wrong token");
                }
                resolve(res.accounts);
            } else {
                let error = new Error(xhr.statusText);
                error.code = xhr.status;
                reject(error);
            }
        };
        xhr.send();
    });

}

function startEndDay(fromDate) {
    const now = new Date(fromDate * 1000);
    const newDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, -now.getTimezoneOffset(), 0, 0); //
    const startDay = Math.round(newDate.getTime() * 0.001);
    const diffTime = (60 * 60 * 24) - 60;
    const endDay = startDay + diffTime;
    return [startDay, endDay]
}

async function addCargo(accessToken, accountId, cargosArray) {
    
    let notesCargo; // comment on cargo
    let numberOrders = 0;
    for (let cargos of cargosArray) {
        let order = {};
        let orderForDB = {};
        let fromDate = Number(cargos.date_start);
        let tillDate = Number(cargos.date_end);
        orderForDB.date_start = cargos.date_start_old;
        orderForDB.date_end = cargos.date_end_old;
        console.log("accountId", accountId);
        if(accountId) {
                //order.accountId = accountId;
                order.account = accountId;
        }
            //[array of Place objects] - one or more origin locations of the cargo (see Place object)
        order.origins = [{
            country: cargos.from_country,
            region: cargos.from_city_code,
            name: cargos.from_city
        }]
            orderForDB.from_country = cargos.from_country;
            orderForDB.from_city = cargos.from_city;
            // "destinations": [array of Place object] - one or more destination locations of the cargo (see Place object)
        order.destinations = [{
            country: cargos.to_country,
            region: cargos.to_city_code,
            name: cargos.to_city
        }];
            orderForDB.to_country = cargos.to_country;
            orderForDB.to_city = cargos.to_city;


       // order.type = 55; //[number]
        order.id = 0; 
        order.type = 0; //[number]
        order.ctype = 1; 
function secontsToTime(time) {
    time = time * 1000;
    time = new Date(time);
    const year = time.getFullYear();
    const month = String(+time.getMonth()+1).padStart(2, '0');
    const date = String(time.getDate()).padStart(2, '0');  
    return year + '-' + month + '-' + date;
}        
        const startEndDayFrom = startEndDay(fromDate);
       // order.fromDate = startEndDayFrom[0];
        //order.tillDate = startEndDayFrom[1];
        order.fromDate = secontsToTime(startEndDayFrom[0]) + ' ' + '00:00:00';
        order.tillDate = secontsToTime(startEndDayFrom[0]) + ' ' + '23:59:59';

        const startEndDayTo = startEndDay(tillDate);
        //order.fromDateto = startEndDayTo[0];
        //order.tillDateto = startEndDayTo[1];
        order.fromDateto = secontsToTime(startEndDayTo[0]) + ' ' + '00:00:00';
        order.tillDateto = secontsToTime(startEndDayTo[0]) + ' ' + '23:59:59';


        //order.trailers = cargos.type_truck_ids; //[array of numbers]
        order.cargotype = [54]; //[array of numbers]
        order.volume = cargos.volume ? Number(cargos.volume) : 0;           //[float] - volume (m3)
        order.volumeldm = cargos.length ? Number(cargos.length) : 0; // [float] - volume (ldm)
        order.weight = cargos.weight ? Number(cargos.weight) : 0; //[float] - weight (t)
        orderForDB.weight = cargos.weight;
        if (cargos.pallets && cargos.pallets.amount && cargos.pallets.amount > 0) {
            order.pallets = Number(cargos.pallets.amount);  //[float] - number of pallets
            if (cargos.pallets.dimensions == "120x80") {
                order.pallettype = 1; //[number] - type of pallets (see GET /palletTypes)*/
            } else {
                order.pallettype = 4;
            }
        }
        const pallets_comment = cargos.x_pallets ? "\nPallets: " + cargos.x_pallets : "";

        if (cargos.loadingType) {
            order.top = (cargos.loadingType.match(/górą/)) ? 1 : 0; //[number 0, 1] - loading from top
            order.side = (cargos.loadingType.match(/bokiem/)) ? 1 : 0; //[number 0, 1] - loading from side
            order.back = (cargos.loadingType.match(/tyłem/)) ? 1 : 0; //[number 0, 1] - loading from back
        }

        order.adr = (cargos.adr) ? Math.floor(Number(cargos.adr)) : 0; //adr = [number 0, 1] - ADR

        if(cargos.loadingType == 'LTL') {
            order.partly = 1;
            order.full = 0;
        } else {
            order.partly = 0; // "partly": [number 0, 1] - partially loaded cargo
            order.full = 1; // "full": [number 0, 1] - fully loaded cargo
        }
        orderForDB.loadingType = cargos.loadingType;
        orderForDB.loadTime = new Date().getTime();

        let price_comment = "";
        if (cargos.price) {
            for (let i = 0; i < currency.length; i++) {
                if (currency[i].trans == cargos.price_add) {
                    order.price = Math.ceil(cargos.price);   //[number] - price
                    order.currency = currency[i].cargo; //[number] - currency (see GET /currencies)
                    price_comment = ""
                    break;
                } else {
                    price_comment = "Price: " + cargos.price + " " + cargos.price_add;
                }
            }
        }
        const height = cargos.height ? "Height: " + cargos.height : "";
        const length = cargos.length ? "Length: " + cargos.length : "";
        const parameters_comment = (height || length) ? "\nCargo: " + height + " " + length : "";
        const comment = (cargos.comment) ? "\nComment: " + cargos.comment : "";
        const truck_list_comment = cargos.truck_list ? "Trucks: " + cargos.truck_list + "\n" : "";
        let loadFormat = "";
        if (cargos.loadFormat && cargos.loadFormat.label) {
            const loadFormatArray = cargos.loadFormat.label.split('Type');
            loadFormat = "Cargo: " + loadFormatArray[1] + "\n";
        }

        order.notes = truck_list_comment + loadFormat + price_comment + parameters_comment + pallets_comment + comment;
        order.lift = cargos.lift ? 1 : 0; //[number 0, 1] - lift

        /*        declaration = [number 0, 1] - by declaration
                  boxes = [array of objects] - Box objects (see Box object)
                  boxtype = [number] - box type (see Box type)
                  accountId : 1 [number] - Cargo.LT account associated with the offer (required when using company access token)
        */

        //let url = cargoLtUrl + "cargos";
        let url = cargoLtUrl + "offers/add/";
        console.log(order);
        const json = JSON.stringify(order);

            console.log(accessToken);

        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('Access-Token', accessToken);
        xhr.setRequestHeader('X-Api-Source', "api");
        xhr.setRequestHeader('Site-User-Language', "PL");
        xhr.onload = await function () {
            console.log(xhr);
            let res = JSON.parse(xhr.responseText);
            if (xhr.readyState == 4 && xhr.status == "200") {
                $("#table").addClass("hidden");
                numberOrders++;
                const order_text = (numberOrders === 1) ? " order." : " orders.";
                $("#main-table").html("<div>&nbsp;</div><div  class='result'>Upload " + numberOrders + order_text + "</div><div class='result'>Go to site <a href='https://www.cargo.lt/' target='_blank'>Cargo.Lt</a></div>");

try {
    
        let transaction = db.transaction(['trans'], 'readwrite'); //readonly - для чтения
        let store = transaction.objectStore('trans');
        let req = store.add(orderForDB);
        req.onsuccess = (event) => console.log('Success save object to db');
        req.onerror = (event) => console.log(event);
 } catch (err) {
console.log("Same error in db.transaction")
 }
                order = {};
                orderForDB = {};
            } else {
                console.error("Error");
                $("#table").addClass("hidden");
                $("#main-table").append("<div class='result' style='color: red'>Error: " + res.error.message + "</div>");
            }
        };
       
        xhr.send(json);
    } 
    return numberOrders;

}


function setCookies(url = "https://system.trans.eu/", login = "login", password = "id", token = "") {
    const days = 3600 * 1000 * 24 * 20; //20 days
    const expirationDate = (new Date().getTime() + days) / 1000;
    const loginCookieObj = {
        name: "login",
        value: login,
        path: "/",
        url: url,
        expirationDate: expirationDate,
        secure: true
    };
    const passwordCookieObj = {
        name: "id",
        value: password,
        path: "/",
        url: url,
        expirationDate: expirationDate,
        secure: true
    };
    const tokenCookieObj = {
        name: "token",
        value: token,
        path: "/",
        url: url,
        expirationDate: expirationDate,
        secure: true
    };
    try {
        chrome.cookies.set(loginCookieObj, function (res) {
        });
        chrome.cookies.set(passwordCookieObj, function (res) {
        });
        chrome.cookies.set(tokenCookieObj, function (res) {
        });
    } catch (e) {
        console.error("Error setting cookie:\n" + e)
    }
}

function setTokenCookies(url = "https://system.trans.eu/", token = "") {
    const days = 3600 * 1000 * 24 * 20; //20 days
    const expirationDate = (new Date().getTime() + days) / 1000;

    const tokenCookieObj = {
        name: "token",
        value: token,
        path: "/",
        url: url,
        expirationDate: expirationDate,
        secure: true
    };
    try {
        chrome.cookies.set(tokenCookieObj, function (res) {
        });
    } catch (e) {
        console.error("Error setting cookie:\n" + e)
    }
}

function getCookie(url = "https://system.trans.eu/", name) {
    return new Promise((resolve, reject) => {
        const cookieObj = {
            name: name,
            url: url
        };
        try {
            chrome.cookies.get(cookieObj, function (cookie) {
                if (cookie) {
                    resolve(cookie.value);
                } else {
                    resolve("");
                }
            });
        } catch (e) {
            reject("Error setting cookie:\n" + e);
            console.error("Error setting cookie:\n" + e)
        }
    });
}

function insertToken(token) {
    const accessToken = document.getElementById("access-token");
    accessToken.value = token;
}

function logged(login) {  // если залогинились, скрывает форму регистрации
    const body = document.getElementById("body");
    body.removeAttribute("style");

    const cargoLogin = document.getElementById("cargoLogin");
    cargoLogin.classList.add("hidden");

    const textLoad = document.getElementById("text-load");
    textLoad.classList.remove("hidden");


    const top = document.getElementById("top");
    top.classList.remove("center");


    const loadCargo = document.getElementById("load");
    loadCargo.classList.remove("hidden");


    const table = document.getElementById("table");
    table.classList.add("hidden");

    const exit = document.getElementById("exit");
    exit.classList.remove("hidden");

    const textExport = document.getElementById("text-export");
    textExport.classList.add("hidden");

    document.getElementById("company-enter-token").classList.remove("hidden");
    document.getElementById("company-access-token").classList.remove("hidden");

    document.querySelector("table").classList.remove("hidden");

    const user = document.getElementById("user");
    user.classList.remove("hidden");
    user.innerHTML = " Manager: " + login + " ";
}


let loadButton = document.getElementById('load');
loadButton.addEventListener('click', function () {
   // console.log("click load");
    const table = document.getElementById("table");
    table.classList.remove("hidden");

    const mainTable = document.getElementById("main-table");
    mainTable.classList.remove("hidden");

    const textLoad = document.getElementById("text-load");
    textLoad.classList.add("hidden");

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: "load"}, function (infoArray) { //massive id and truck="Plandeka"

            let number = 0;
            let orders_array = [];
            if (infoArray && infoArray.length > 0) {
                for (let ord of  infoArray) {
                    if(ord.type == "Ładunek") {
                    number++;
                    const res = {};
                    const year = new Date().getFullYear();

                    const dayFrom = ord.fromDate ? ord.fromDate.split('.')[0] : '';

                    res.date_start_old = ord.fromDate;
                    const monthFrom  = ord.fromDate ? +ord.fromDate.split('.')[1] - 1 : '';  
                    res.date_start = new Date(year, monthFrom, dayFrom, 3).getTime() * 0.001;
                    res.date_start = res.date_start ? res.date_start : (new Date().getTime() + 3600000) * 0.001;
                    if(dayFrom == 'jutro') {
                        res.date_start += 86400;
                    }


                    const dayTo = ord.toDate ? ord.toDate.split('.')[0] : dayFrom;
                    res.date_end_old = ord.toDate;
                    const monthTo  = ord.toDate ? +ord.toDate.split('.')[1] - 1 : monthFrom;  
                    res.date_end = new Date(year, monthTo, dayTo, 3).getTime() * 0.001;
                    res.date_end = res.date_end ? res.date_end : (new Date().getTime() + 3600000) * 0.001;
                    if(dayTo == 'jutro') {
                        res.date_end += 86400 + 3600; //in seconds 3600 = 1 hour
                    }
                    res.from_country = ord.from ? ord.from.split(',')[0] : '';
                    //res.from_city = ord.from ? ord.from.split(' ').pop() : '';
                    const cityFromInString = ord.from ? ord.from.split(',')[1].trim() : '';
                    const from_city_code = cityFromInString ? cityFromInString.substring(0,2).trim() : '';
                    res.from_city_code = from_city_code && from_city_code.length === 2 ? from_city_code : ''; 
                    res.from_city = cityFromInString ? cityFromInString.slice(2).trim() : '';


                    res.to_country = ord.to ? ord.to.split(',')[0] : '';
                    //res.to_city = ord.to ? ord.to.split(' ').pop() : '';                    
                    const cityToInString = ord.to ? ord.to.split(',')[1].trim() : '';
                    const to_city_code = cityToInString ? cityToInString.substring(0,2).trim() : '';
                    res.to_city_code = to_city_code && to_city_code.length === 2 ? to_city_code : ''; 
                    res.to_city = cityToInString ? cityToInString.slice(2).trim() : '';

                    res.truck = ord.type;
                    res.managerFistName = ord.manager ? ord.manager.split(' ')[0] : '';
                    res.managerLastName = ord.manager ? ord.manager.split(' ')[1] : '';
                    res.price_symbol = '';
                    res.price = '';
                    res.price_add = '';
                    res.weight = ord.property ? ord.property.split('t')[0] : "";
                    res.fullPartly = ord.fullPartly;


                    const url = 'https://platform.trans.eu/app/exchange/api/rest/v1/vehicle-offers/' + ord.id;
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true)
                    xhr.setRequestHeader('accept', ['application/json', ' text/plain', ' */*']);
                    xhr.setRequestHeader('authorization', 'Bearer '+ ord.transFrameToken);
                    xhr.setRequestHeader('x-csrf-token', ord.transFrameCSRFToken);      
                    xhr.onload = function () {
                        /* fetch('https://platform.trans.eu/app/exchange/api/rest/v1/vehicle-offers/' + ord.id, {
                      method: 'GET',
                      mode: 'cors',
                      credentials: 'include',   
                      headers: {        
                        'accept':['application/json', ' text/plain', ],
                        'authorization':'Bearer '+ ord.transFrameToken,
                        'x-csrf-token': ord.transFrameCSRFToken
                      }
                        })  */       
                        //.then(function(response) {
                        //     if (!response.ok) throw Error(response.statusText); 
                        let result = JSON.parse(xhr.responseText);
                        if (xhr.readyState == 4 && xhr.status == "200") {
                           // const dateFinish = new Date(result.result.data.dateFinish * 1000);
                           // const dateLoading = new Date(result.result.data.dateLoading * 1000 - (3600 * 4 * 1000));
                           // const datePublish = new Date(result.result.data.datePublish * 1000);
                           // const dateUnloading = new Date(result.result.data.dateUnloading * 1000);
                          /* res.date_start = result.vehicle.available_on.begin;
                            res.date_start_view = result.vehicle.available_on.begin;
                            res.date_end = result.vehicle.available_on.end;
                            res.date_end_view = result.vehicle.available_on.end;
                            
                            res.x_adds = result.result.data.x.adds;
                            res.x_adrClasses = result.result.data.x.adrClasses;
                            res.x_dateLoading = result.result.data.x.dateLoading;
                            res.x_dateUnloading = result.result.data.x.dateUnloading;
                            res.x_loadingType = result.result.data.x.loadingType; //Załadunek:
                            res.x_pallets = result.result.data.x.pallets;
                            res.x_type = result.result.data.x.type;


                            res.id = result.result.data.id;
                            res.from_city = result.result.data.address.start.city;
                            res.from_country = result.result.data.address.start.country.iso2;
                            res.to_city = result.result.data.address.destination.city;
                            res.to_country = result.result.data.address.destination.country.iso2;
                            res.truck = ord.truck;
                            res.truckArray = ord.truckArray;

                            if (result.result.data.parameters.adrClasses) {
                                res.adr = Object.keys(result.result.data.parameters.adrClasses)["0"];
                            }
                            res.type_cargo = "";

                            res.volume = result.result.data.parameters.volume ? result.result.data.parameters.volume : "";

                            res.price_symbol = (result.result.data.price && result.result.data.price.currency && result.result.data.price.currency.symbol) ? result.result.data.price.currency.symbol : "";
                            res.price = result.result.data.price.value ? result.result.data.price.value : "";
                            res.price_add = "";
                            res.comment = result.result.data.additionalInfo ? result.result.data.additionalInfo : "";
                            res.phone = "";
                            res.name = "";
                            res.weight = result.result.data.parameters.capacity ? result.result.data.parameters.capacity : "";

                            res.crane = result.result.data.parameters.crane ? result.result.data.parameters.crane : "";
                            res.height = result.result.data.parameters.height ? result.result.data.parameters.height : "";
                            res.length = result.result.data.parameters.length ? result.result.data.parameters.length : "";
                            res.lift = result.result.data.parameters.lift ? result.result.data.parameters.lift : "";
                            res.supplementLoad = result.result.data.parameters.supplementLoad ? result.result.data.parameters.supplementLoad : ""; //Doładunek
                            res.pallets = result.result.data.parameters.pallets ? result.result.data.parameters.pallets : "";

                            res.truckBody = result.result.data.parameters.truckBody;
                            res.loadFormat = result.result.data.parameters.loadFormat;

                            res.managerFistName = result.result.data.owner.user.firstName;
                            res.managerLastName = result.result.data.owner.user.lastName;
                            res.managerEmail = result.result.data.owner.user.email;
                            res.managerAccountId = result.result.data.owner.user.accountId;*/

                           // orders_array.push(res);
                           // if (infoArray.length === orders_array.length) {
                              //  addToPopup(orders_array);
                           // }
                         } else {
                             console.error(result);
                         }
                        //})
                        //.catch(function(error) {
                        //     console.log('Looks like there was a problem: \n', error);
                        //});
                    }
                    
                   // xhr.send(null);
                      orders_array.push(res);  
                    }                     
                }
                addToPopup(orders_array);
            } else {
                $("#main-table").html(
                    "<br><div class='result'>Open cargoes page or reload page<button id='go-to-site' class='link default'>Go</button></div>");
                const goToSite = document.getElementById('go-to-site');
                funGoToSite(goToSite);
            }
        });

    });
});


let cargosArray = [];
let cargosArrayCargoIt = [];
let tempArray = [];

function addToPopup(result) {
    tempArray = []
    result.orders_array = [];
    let managersTransArray = [];
    if (result && result.length > 0) {
        cargosArray = result;
        $("#table .cargo_line").addClass("hidden"); //удаление предыдущих записей если больше 1 раза нажали на load
        cargosArray.forEach(function (res, i) {

        let color = "black", check = true;
        for(const orderFromDb of ordersFromDb) {
            if( orderFromDb.date_start === res.date_start_old
                && orderFromDb.date_end === res.date_end_old
                && orderFromDb.from_city === res.from_city
                && orderFromDb.from_country === res.from_country
                && orderFromDb.weight === res.weight
                && orderFromDb.loadingType === res.fullPartly
                ) { 
                color = "#91b247";  check = false;
               } 
            }

            let cargoLt = {};
            cargoLt.managersAccountId = [];  

            let now = new Date();
            now = Math.round(now * 0.001);
            if(res.date_start < now) {
                  res.date_start = now;
            }
            cargoLt.date_start_old = res.date_start_old;
            cargoLt.date_end_old = res.date_end_old;
            cargoLt.date_start = Math.round(res.date_start); // в секундах            
            
      
            if (res.date_start && res.date_end) {
                cargoLt.date_end = Math.round(res.date_end); // в секундах
            } else {
                cargoLt.date_end = "";
                console.error("DateEnd Error");
            }
            cargoLt.date_end = cargoLt.date_start < cargoLt.date_end ? cargoLt.date_end : cargoLt.date_start + 3600;

            const date_view = dateView(cargoLt.date_start) + " - " + dateView(cargoLt.date_end);

            const fromToAll = res.from_city + " (" + res.from_country + ") - " + res.to_city
                + " (" + res.to_country + ")";

            cargoLt.from_city = res.from_city;
            cargoLt.from_city_code = res.from_city_code;
            cargoLt.from_country = res.from_country;

            cargoLt.to_city = res.to_city;
            cargoLt.to_city_code = res.to_city_code;
            cargoLt.to_country = res.to_country;

            cargoLt.truck = res.truck;
            cargoLt.truckArray = res.truckArray ? res.truckArray : '';
            if (res.truckArray && res.truckArray.length && res.truckArray.length > 1) {
                cargoLt.truck_comment = res.truckArray.join();
            } else {
                cargoLt.truck_comment = res.truck;
            }

            cargoLt.type_truck_ids = [];
            res.truckArray = Array.isArray(res.truckArray) ? res.truckArray : [];
            for (let truck of res.truckArray) {
                let truck_1 = "";
                let truck_list = "";
                for (let tr of arrayTruck) {

                    if (tr.trans && truck && tr.trans.toLowerCase() == truck.toLowerCase().trim()) {
                        if (typeof tr.cargo === "object") {
                            cargoLt.type_truck_ids.push(tr.cargo.map(function (item) {
                                return Number(item);
                            }));
                        } else {
                            cargoLt.type_truck_ids.push(Number(tr.cargo));
                        }
                        truck_1 = "";
                        break;
                    } else {
                        truck_1 = truck;
                    }
                }
                truck_list += truck_1;
            }
            if (!cargoLt.type_truck_ids) {
                cargoLt.type_truck_ids = [2];
            }

            cargoLt.weight = res.weight;
            cargoLt.volume = res.volume;
            cargoLt.price = res.price;
            cargoLt.price_add = res.price_symbol;
            cargoLt.comment = res.comment;
            cargoLt.adr = res.adr;
            cargoLt.phone = res.phone;
            cargoLt.name = res.name;

            cargoLt.height = res.height;
            cargoLt.length = res.length;
            cargoLt.lift = res.lift;
            cargoLt.supplementLoad = res.fullPartly; //Doładunek
            cargoLt.pallets = res.pallets;
            cargoLt.x_pallets = res.x_pallets;

            res.x_loadingType = res.fullPartly;
            cargoLt.loadingType = res.x_loadingType;
            cargoLt.comment = res.comment;

            cargoLt.truck_list = res.truck_list;
            cargoLt.loadFormat = res.loadFormat ? res.loadFormat : "";

            cargoLt.managerFistName = res.managerFistName;
            cargoLt.managerLastName = res.managerLastName;
            cargoLt.managerEmail = res.managerEmail;

            res.managerAccountId = cargoLt.managerFistName + cargoLt.managerLastName;

            cargoLt.managerAccountId = res.managerAccountId;
            const manager = res.managerFistName + " " + res.managerLastName;

                managersTransArray.push({
                         id : cargoLt.managerAccountId,
                         manager: manager
                });
            

            cargoLt.id = i;
            const table = $("#table");
            const weight = res.weight ? "<b>Weight</b>: " + res.weight + " t" : "";
            const volume = res.volume ? ". <b>Volume</b>: " + res.volume + " m³" : "";
            const length = res.length ? ". <b>Length</b>: " + res.length + " m" : "";
            const height = res.height ? ". <b>Height</b>: " + res.height + " m" : "";
            const loadingType = res.loadingType ? ". <b>Loading type</b>: " + res.loadingType : "";
            const pallets = res.x_pallets ? "<br><b>Pallets</b>: " + res.x_pallets : "";
            const adds = res.x_adds ? "<br><b>Add info</b>: " + res.x_adds : "";
            const comment = res.comment ? "<br><b>Comment</b>: " + res.comment : "";
            const loading = res.x_loadingType ? "<br>" + res.x_loadingType : "";

            let typeCargo = "";

            if (cargoLt.loadFormat.label && cargoLt.loadFormat.label.split("Type")) {
                typeCargo = "<b>Cargo</b>: " + cargoLt.loadFormat.label.split("Type")[1] + "<br>";
            }
            let title = "";
            title = check ? "" : "The order was loaded today.";
            let checkedWorld = check ? "checked" : "";
            table.append("<tr title = '" + title + "' class='cargo_line'data-id='"+ res.managerAccountId + "'><td width='3%'><input type='checkbox' name='' id='" + i + "' class='check' " + checkedWorld + " ></td>" +
                "<td width='20%'  class='center'  style='color:" + color +"' ><span>" + fromToAll + "</span></td>" +
                "<td width='15%' class='center'  style='color:" + color +"' >" + date_view + "</td>" +
                "<td  width='38%'  style='color:" + color +"' ><b>Type</b>: " + cargoLt.truck_comment + " " + typeCargo +
                ""+ weight + volume + length + height + loadingType + pallets + adds + loading + comment + "</td>" +
                "<td width='10%'  style='color:" + color +"' >" + res.price + " " + res.price_symbol + "</td>" +
                "<td width='14%'  style='color:" + color +"' >" + manager + "</td>" +
                "</tr>\n");

            tempArray.push(cargoLt);
        });


        document.getElementById("trans-managers").classList.remove("hidden");
 
        const selectTransManagers = document.getElementById('select-trans-managers');
        let copyManagers = [];

                    for (let i = 0; i < managersTransArray.length; i++) {
                        
 
                    if(!copyManagers.includes(managersTransArray[i].id)) {
                        let opt = document.createElement('option');
                        //opt.value = managersTransArray[i].id;
                        opt.value = managersTransArray[i].id;
                        opt.innerHTML = managersTransArray[i].manager;
                        selectTransManagers.appendChild(opt);
                    }
                    copyManagers.push(managersTransArray[i].id);

                    }

        const exportCargo = document.getElementById("export");
        exportCargo.classList.remove("hidden");
    } else {
        chrome.tabs.query(
            {
                active: true,
                currentWindow: true
            },
            function (tabs) {
                chrome.tabs.update(tabs[0].id, {url: tabs[0].url}); //получение адреса текущщей страницы и перезагрузка
                chrome.tabs.sendMessage(tabs[0].id, {txt: "toToPage"}); //отправка сообщения на страницу
                if (tabs[0].url == "https://platform.trans.eu/my-offers") {
                    $("#main-table").html(
                        "<br><div class='result'>No transportation Proposal</div>");
                }
            });

        $("#table").addClass("hidden");
        $("#export").hide();
        $("#user").addClass("right");
        $("#main-table").html(
            "<br><div class='result'>Open cargoes page <button id='go-to-site' class='link default'>Go</button></div>");
        const goToSite = document.getElementById('go-to-site');
        funGoToSite(goToSite);
    }
}

function funGoToSite(goToSite) {
    if (goToSite) {
        goToSite.addEventListener('click', function () {
           // chrome.tabs.update({url: "https://system.trans.eu/lite.php?Act=index_dashboard_index#/tabs_offers"}); // переход на страницу
            chrome.tabs.update({url: "https://platform.trans.eu/my-offers"});
            chrome.runtime.reload(); //перезагрузка и оключение попапа
            chrome.tabs.query(
                {
                    active: true,
                    currentWindow: true
                },
                function (tabs) {
                    chrome.tabs.update(tabs[0].id, {url: tabs[0].url}); //получение адреса текущщей страницы и перезагрузка
                    chrome.tabs.sendMessage(tabs[0].id, {txt: "toToPage"}); //отправка сообщения на страницу
                });
        });
    }
}

window.onload = function () { // when the page has loaded
    document.getElementById("select-cargo-managers").onchange = function () {
        g_managerId = this.value;
       // console.log(g_managerId);
    }
 
    document.getElementById("select-trans-managers").onchange = function () {
        const transManagerId = this.value;
        //console.log(transManagerId);

        const els = document.querySelectorAll('table .cargo_line');

        for (let i = 0; i < els.length; i++) {

       let input = els[i].querySelector('input');
        els[i].classList.remove("hidden");
        input.checked = true;
        if(transManagerId != els[i].dataset.id) {
            input.checked = false;
            //console.log(input);
            //console.log(els[i].dataset.id);
            els[i].classList.add("hidden")
        }   
      // els[i].classList.add("hidden");

  }
/*els.forEach(function(e){

    e.querySelector('input').removeAttr('checked');
    console.log(e);
}); */






    }
}
//export в карго
let exportButton = document.getElementById('export');
exportButton.addEventListener('click', function () {

    const checkboxs = document.querySelectorAll(".check");
    //console.log(checkboxs);
    let ids = [];
    for (let j = 0; j < checkboxs.length; j++) {
        ids.push(checkboxs[j].checked);
        if (checkboxs[j].checked) {
            cargosArrayCargoIt.push(tempArray[j]);
        }
    }

    let url = cargoLtUrl + "accounts/signin";
    let data = {};
    data.login = g_login;
    data.password = g_password;
    const json = JSON.stringify(data);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.onload = async function () {
        const tokenObject = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
            //const numberOrders = await addCargo(tokenObject.accessToken, cargosArrayCargoIt);
             console.log("g_token", g_token);
             console.log("g_managerId", g_managerId);
            if (g_token && g_managerId) { // токен компании и выбран менеджер
                let numberOrders = await addCargo(g_token, g_managerId, cargosArrayCargoIt);
                //console.log("токен компании", g_token, g_managerId);
            } else {
                let numberOrders = await addCargo(tokenObject.accessToken, "", cargosArrayCargoIt);
                //console.log("токен клиента", tokenObject.accessToken, g_managerId);
            }
        } else {
            console.error(tokenObject);
        }
    };
    xhr.send(json);
}, false);


//получаем логин и пароль из куков
(async () => {
    const loginCookie = await getCookie(urlDomain, "login");
    const passwordCookie = await getCookie(urlDomain, "id");
    const companyAccessToken = await getCookie(urlDomain, "token");
    if (loginCookie && passwordCookie) { //если есть то скрываем формму вода логина и пароля и записываем логи и пароль глобально
        g_login = loginCookie;
        g_password = passwordCookie;
        logged(loginCookie);  //скрывает форму регистрации

        if (companyAccessToken) { //если есть то вставляем в поле токена
            g_token = companyAccessToken;
            insertToken(companyAccessToken);
            getAccounts(companyAccessToken);
        }
    }
})();

//выход из аккаунта, удаление куков
const cargoExit = document.getElementById('exit');
cargoExit.addEventListener('click', function () {
    const loginCookieObj = {
        name: "login",
        url: urlDomain
    };
    chrome.cookies.remove(loginCookieObj, function () {
    });
    const passwordCookieObj = {
        name: "id",
        url: urlDomain
    };
    chrome.cookies.remove(passwordCookieObj, function () {
    });
    const tokenCookieObj = {
        name: "token",
        url: urlDomain
    };
    chrome.cookies.remove(tokenCookieObj, function () {
    });

    //  chrome.runtime.restart();
    chrome.runtime.reload();

});

//регистрация
const cargoSubmit = document.getElementById('cargoSubmit');
cargoSubmit.addEventListener('click', function () {

    const url = cargoLtUrl + "accounts/signin";
    const credential = {};
    credential.login = document.getElementById("cargo_login").value;
    credential.password = document.getElementById("cargo_password").value;
    g_login = credential.login;
    g_password = credential.password;
    const json = JSON.stringify(credential);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.onload = async function () {
        let tokenObject = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
            if (typeof tokenObject.accessToken == "string") {
                await setCookies(urlDomain, credential.login, credential.password);
                logged(credential.login); //скрывает форму регистрации
            }
        } else {
            document.getElementById('error').innerText = "Invalid login or password";
            console.error(tokenObject);
        }
    };
    xhr.send(json);
}, false);


async function saveToken() {
    const companyAccessToken = document.getElementById('access-token').value;
    setTokenCookies(urlDomain, companyAccessToken);
    //getAccounts("8bf8dce9400f7368ba244d24a74378e8");
    g_token = companyAccessToken;
    const cargoUsers = await getAccounts(companyAccessToken);
    /* document.getElementById("trans-managers").classList.remove("hidden"); */
    if (cargoUsers) {
       // console.log(cargoUsers);
    } else {
        console.log("wrong token");
    }
}


// Enter company access token
document.getElementById('access-token').addEventListener("keyup", async (event) => {
    event.preventDefault();
    if (event.keyCode === 13) {
        await saveToken();
    }
});
const enterToken = document.getElementById('enter-token');
enterToken.addEventListener('click', async () => {
    await saveToken();
});
