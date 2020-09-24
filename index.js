window.onload = () => {
    chrome.runtime.sendMessage({action: 'get_style', params: {}}, res => {
        const {data} = res;
        if(data.success) {
            console.log('[' + new Date().toLocaleTimeString() + '] [SP-BOT] style load success');
            
            let styleElement = document.createElement('style');
            styleElement.type = 'text/css';
            styleElement.rel = 'stylesheet';
            styleElement.innerHTML = data.style;
            document.querySelector('head').appendChild(styleElement);

            chrome.runtime.sendMessage({action: 'get_script', params: {}}, res => {
                const {data} = res;
                if(data.success) {
                    console.log('[' + new Date().toLocaleTimeString() + '] [SP-BOT] script load success');
                    eval(data.script);
                }
                else console.log('[' + new Date().toLocaleTimeString() + '] [SP-BOT] script load fail');
            });
        }
        else console.log('[' + new Date().toLocaleTimeString() + '] [SP-BOT] style load fail');
    });
}
