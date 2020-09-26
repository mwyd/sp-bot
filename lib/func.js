function getDiffAsPercentage(num1, num2) {
    return Math.round((1 - (num1 / num2)) * 100);
}

function validateNumberInput(target, min, max) {
    if(target.value < min && min !== null) target.value = min;
    if(target.value > max && max !== null) target.value = max;
}

function getFullDate(dateObj, timeZoneDiff = 0) {
    dateObj.setTime(dateObj.getTime() - dateObj.getTimezoneOffset() * 60 * 500 * timeZoneDiff);
    let dmy = dateObj.toLocaleDateString().split('.');
    return `${dmy[2]}-${dmy[1]}-${dmy[0]} ${dateObj.toLocaleTimeString()}`
}

function fetchPostConfig(_body, isJSON = false) {
    let contentType = 'application/x-www-form-urlencoded';
    if(isJSON) contentType = 'application/json';

    return {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
        'Content-Type': contentType
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: isJSON ? JSON.stringify(_body) : _body
    }
}

async function loadFile(fileName, isJSON = false) {
    const data = await fetch(chrome.extension.getURL(fileName));
    if(isJSON) return data.json();

    return data.text();
}

//from w3schools -> https://www.w3schools.com/js/js_cookies.asp
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
    if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}
