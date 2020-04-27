'use strict';

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) { 
        console.log('!!!!!!!!!!!!!!!', request);
        if (request.greeting == "load") {
            let orders = document.querySelectorAll("#offersList > div > table > tbody > tr");

            console.log(orders);
            const transFrameToken = window.localStorage.getItem('transFrameToken');
            const transFrameCSRFToken = window.localStorage.getItem('transFrameCSRFToken');
            let infoArray = [];
            if (orders && typeof(orders) === "object") {

                for (let i = 0; i < orders.length; i++) {
                    const obj = {};
                    obj.transFrameToken = transFrameToken;
                    obj.transFrameCSRFToken = transFrameCSRFToken;
                    console.log(orders[i]);
                    obj.id = orders[i].getAttribute("data-ctx-id");
                    console.log(obj.id);
                    console.log(orders[i].querySelector("td > span").innerText);
                    obj.type = orders[i].querySelector("td > span").innerText;
                    obj.from = orders[i].querySelector("td:nth-child(2) > span > div > div:nth-child(2) > span > span > span").innerText;
                    const fromDate = orders[i].querySelector("td:nth-child(2) > span > div > div:nth-child(2) > span:nth-child(2)");
                    obj.fromDate = (fromDate && fromDate.innerText && fromDate.innerText.split(/,|-/)[1]) ? fromDate.innerText.split(/,|-/)[0] : '';

                    obj.to = orders[i].querySelector("td:nth-child(3) > span > div > div:nth-child(2) > span > span > span").innerText;
                    const toDate = orders[i].querySelector("td:nth-child(3) > span > div > div:nth-child(2) > span:nth-child(2)");
                    obj.toDate = (toDate && toDate.innerText && toDate.innerText.split(/,|-/)[1]) ? toDate.innerText.split(/,|-/)[0] : '';

                    obj.property = orders[i].querySelector("td:nth-child(4) > span > div:nth-child(2) > div > span > span").innerText;

                    obj.fullPartly = orders[i].querySelector("td:nth-child(4) > span > div:nth-child(2) > div > span > span:nth-child(2)").innerText;

                    const propertyAddLabel = orders[i].querySelector("td:nth-child(4) > span > div:nth-child(2) > div > span:nth-child(2) > span");
                    obj.propertyAddLabel = propertyAddLabel ? propertyAddLabel.innerText : '';

                    const propertyAdd = orders[i].querySelector("td:nth-child(4) > span > div:nth-child(2) > div > span:nth-child(2) > label");
                    obj.propertyAdd = propertyAdd ? propertyAdd.innerText : '';
                    const manager = orders[i].querySelector("td:nth-child(6) > span > span:nth-child(2) > div > div");
                    obj.manager = manager ? manager.innerText : '';
                    infoArray.push(obj);                    
                }
            }
  
            sendResponse(infoArray);
        }
    });

