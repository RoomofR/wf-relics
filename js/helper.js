function output(inp) {
    document.body.appendChild(document.createElement('pre')).innerHTML = inp;
}

function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function loadJSON(path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function getRelicName(relic){return relic.tier+" "+relic.relicName;}

function getCookie(){
    return document.cookie;
}

function setCookie(){

}

initCookie();
function initCookie(){
    //if(document.cookie)
}

String.prototype.matches = function(arr) {return new RegExp(arr.join("|").toLowerCase()).test(this.toLowerCase())}

function initData(callback){
	loadJSON('data/relics.json',relics=>{

			loadJSON('data/vaultedRelics.json',vaultedRelics => {

				loadJSON('data/primes.json',primes => {
					//Object.assign({},relics, vaultedRelics)
					return callback({
						"relics":relics.relics,
						"vaultedRelics":vaultedRelics.vaultedRelics,
						"ref":primes.ref,
						"frames":primes.frames,
						"weapons":primes.weapons
					});

				});

			});

		}

	);

}