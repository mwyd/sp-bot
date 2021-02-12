//from w3schools -> https://www.w3schools.com/js/js_cookies.asp
function getCookie(cname) {
    let name = cname + "="
    let decodedCookie = decodeURIComponent(document.cookie)
    let ca = decodedCookie.split(';')

    for(let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') {
            c = c.substring(1)
        }

        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length)
        }
    }
    return ""
}

function getFullDate(dateObj, timeZoneDiff = 0) {
    dateObj.setTime(dateObj.getTime() - dateObj.getTimezoneOffset() * 60 * 500 * timeZoneDiff);
    let dmy = dateObj.toLocaleDateString().split('.');
    return `${dmy[2]}-${dmy[1].padStart(2, '0')}-${dmy[0].padStart(2, '0')} ${dateObj.toLocaleTimeString()}`
}

function getDiffAsPercentage(num1, num2) {
    return Math.round((1 - (num1 / num2)) * 100);
}

function spbLog(msg, data) {
    console.log('[' + new Date().toLocaleTimeString() + '] [SP-BOT] ' + msg, data);
}