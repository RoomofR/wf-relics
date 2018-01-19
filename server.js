const http = require('http'),
	 url = require('url'),
	 fs = require('fs'),
	 path = require('path'),
	 lz = require('./js/lz-string.js');
const port = process.argv[2] || 5959;

// LZ String 24.1+3.5+8.4=36
// LZ Small 25.8+8.9

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

String.prototype.matches = function(arr) {return new RegExp(arr.join("|").toLowerCase()).test(this.toLowerCase())}

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

				Object.keys(data.relics).forEach(relic => {
					delete data.relics[relic].fixed;
					delete data.relics[relic].relicName;
					delete data.relics[relic].tier;
					delete data.relics[relic]._id;
				})

				fs.writeFile('raw.json', JSON.stringify(data,null,'\t'), 'utf8',_=>{});
				fs.writeFile('data.json', lzw_encode(JSON.stringify(data,null,0)), _=>{return callback(data)});
				console.log(` Raw Data:         ${rawData.length}\n`,
					`Uncompressed:     ${JSON.stringify(data,null,0).length}\n`,
					`Compressed UTF16: ${lz.compressToUTF16(JSON.stringify(data,null,0)).length} (${lz.compressToUTF16(JSON.stringify(data,null,0)).length+3437})\n`,
					`Compressed LZW:   ${lzw_encode(JSON.stringify(data,null,0)).length} (${lzw_encode(JSON.stringify(data,null,0)).length+529})\n`)

				/*fs.writeFile('data.json', lzw_encode(JSON.stringify(data,null,0)), 'utf8', _=>{return callback(data)});
				console.log(` Uncompressed:     ${rawData.length}\n`,
					`Compressed UTF16: ${lzw_encode(JSON.stringify(data,null,0)).length}\n`)*/
			});
		});
	});
}

function sortRelics(data){
	const getRelicName = (relic) => {return relic.tier+" "+relic.relicName};
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
				rareState="c"
				if(rarity[r].length==2)rareState="u";
				else if(rarity[r].length==1)rareState="r";

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

//data=JSON.parse(LZString.decompressFromUTF16(xhr.responseText));
//data=JSON.parse(lzw_decode(xhr.responseText));
function lzw_encode(r){for(var n,t={},e=(r+"").split(""),o=[],h=e[0],l=256,_=1;_<e.length;_++)null!=t["_"+h+(n=e[_])]?h+=n:(o.push(h.length>1?t["_"+h]:h.charCodeAt(0)),t["_"+h+n]=l,l++,h=n);o.push(h.length>1?t["_"+h]:h.charCodeAt(0));for(_=0;_<o.length;_++)o[_]=String.fromCharCode(o[_]);return o.join("")}
function lzw_decode(r){for(var n,t={},e=(r+"").split(""),o=e[0],h=o,l=[o],_=256,a=1;a<e.length;a++){var c=e[a].charCodeAt(0);n=c<256?e[a]:t["_"+c]?t["_"+c]:h+o,l.push(n),o=n.charAt(0),t["_"+_]=h+o,_++,h=n}return l.join("")}