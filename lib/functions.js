//from w3schools -> https://www.w3schools.com/js/js_cookies.asp
const getCookie = (cname) => {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');

    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

const dateTime = (dateObj, hoursDifference = 0) => {
    dateObj.setTime(dateObj.getTime() - dateObj.getTimezoneOffset() * 60 * 500 * hoursDifference);
    const date = dateObj.toLocaleDateString();
    let formated = '';

    if(date.indexOf('.') > -1) {
        formated = dateObj.toLocaleDateString().split('.');
        formated = `${formated[2]}-${formated[1].padStart(2, '0')}-${formated[0].padStart(2, '0')} ${dateObj.toLocaleTimeString()}`;
    }
    else if(date.indexOf('/') > -1) {
        formated = dateObj.toLocaleDateString().split('/');
        formated = `${formated[2]}-${formated[0].padStart(2, '0')}-${formated[1].padStart(2, '0')} ${dateObj.toLocaleTimeString()}`;
    }

    return formated;
}

const percentageDifference = (num1, num2) => {
    return Math.round((1 - (num1 / num2)) * 100);
}

const spbLog = (msg, data) => {
    console.log('[' + new Date().toLocaleTimeString() + '] [SP-BOT] ' + msg, data);
}