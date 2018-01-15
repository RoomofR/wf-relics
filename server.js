const http = require('http'),
	 url = require('url'),
	 fs = require('fs'),
	 path = require('path'),
	 lz = require('./js/lz-string.js');
	 minify =  true;
const port = process.argv[2] || 5959;

readFiles('data/',_=>{
	console.log("Data File Aggregated!!!");
	http.createServer(function (req, res) {
	  console.log(`${req.method} ${req.url}`);
	  // parse URL
	  const parsedUrl = url.parse(req.url);
	  // extract URL path
	  let pathname = `.${parsedUrl.pathname}`;
	  // maps file extention to MIME types
	  const mimeType = {
		'.ico': 'image/x-icon',
		'.html': 'text/html',	
		'.js': 'text/javascript',
		'.json': 'application/json',
		'.css': 'text/css',
		'.png': 'image/png',
		'.jpg': 'image/jpeg',
		'.wav': 'audio/wav',
		'.mp3': 'audio/mpeg',
		'.svg': 'image/svg+xml',
		'.pdf': 'application/pdf',
		'.doc': 'application/msword',
		'.eot': 'appliaction/vnd.ms-fontobject',
		'.ttf': 'aplication/font-sfnt'
	  };
	  fs.exists(pathname, function (exist) {
		if(!exist) {
		  // if the file is not found, return 404
		  res.statusCode = 404;
		  res.end(`File ${pathname} not found!`);
		  return;
		}
		// if is a directory, then look for index.html
		if (fs.statSync(pathname).isDirectory()) {
		  pathname += '/index.html';
		}
		// read file from file system
		fs.readFile(pathname, function(err, data){
		  if(err){
			res.statusCode = 500;
			res.end(`Error getting the file: ${err}.`);
		  } else {
			// based on the URL path, extract the file extention. e.g. .js, .doc, ...
			const ext = path.parse(pathname).ext;
			// if the file is found, set Content-type and send data
			res.setHeader('Content-type', mimeType[ext] || 'text/plain' );
			res.end(data);
		  }
		});
	  });
	}).listen(parseInt(port));
	console.log(`Server listening on port ${port}`);
});

/**/

function readFiles(dirname, callback) {
	var data={},rawData;


	fs.readFile(dirname + 'primes.json', 'utf-8', (err, primes) => {rawData+=primes;
			json = JSON.parse(primes);
			data=Object.assign(data,{
				"ref":json.ref,
				"frames":json.frames,
				"weapons":json.weapons
			});

		fs.readFile(dirname + 'vaultedRelics.json', 'utf-8', (err, vaulted) => {rawData+=vaulted;
				json = JSON.parse(vaulted);
				data=Object.assign(data,{"vaultedRelics":json.vaultedRelics});

			fs.readFile(dirname + 'relics.json', 'utf-8', (err, relics) => {rawData+=relics;
				json = JSON.parse(relics);
				data=Object.assign(data,{'relics':sortRelics(Object.assign(data,json))});
				fs.writeFile('data.txt', lz.compressToUTF16(JSON.stringify(data,null,0)), 'utf8', _=>{return callback(data)});
			});
		});
	});
}

function sortRelics(data){
	sortedRelics = {};
	data.relics.forEach(relic => {
		isRelicVaulted = getRelicName(relic).matches(data.vaultedRelics);
		//Fix Rarity Labels
		if(!(getRelicName(relic) in sortedRelics))
			sortedRelics[getRelicName(relic)]=Object.assign(relic,{"vaulted":isRelicVaulted,"fixed":false})

		if(!("fixed" in sortedRelics[getRelicName(relic)] && sortedRelics[getRelicName(relic)].fixed)){
			//console.log(sortedRelics[getRelicName(relic)].fixed);
			rarity = {};
			sortedRelics[getRelicName(relic)].rewards.forEach((r,i) => {
				if(rarity[r.chance]==undefined)rarity[r.chance]=[];
				rarity[r.chance].push(i);
			});
			Object.keys(rarity).forEach(r=>{
				rareState="Common"
				if(rarity[r].length==2)rareState="Uncommon";
				else if(rarity[r].length==1)rareState="Rare";

				rarity[r].forEach(i => {
					sortedRelics[getRelicName(relic)].rewards[i].rarity =rareState;
				})
			})
			sortedRelics[getRelicName(relic)].fixed=true;
		}
	});
	//console.log({'relics':sortedRelics});
	return sortedRelics;
}

String.prototype.matches = function(arr) {return new RegExp(arr.join("|").toLowerCase()).test(this.toLowerCase())}
function getRelicName(relic){return relic.tier+" "+relic.relicName;}

function lzw_encode(s) {
    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i=1; i<data.length; i++) {
        currChar=data[i];
        if (dict[phrase + currChar] != null) {
            phrase += currChar;
        }
        else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase=currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var i=0; i<out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }
    return out.join("");
}