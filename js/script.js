function getRelicName(relic){return relic.tier+" "+relic.relicName;}
String.prototype.matches = function(arr) {return new RegExp(arr.join("|").toLowerCase()).test(this.toLowerCase())}
var xhr = new XMLHttpRequest(),objects,relics,relicKeys,objectKeys,showParts=true,showVaultedParts=true,showVaultedRelics=true,
	partList = document.getElementById("parts"),relicList = document.getElementById("relics");
xhr.onreadystatechange = _=>{
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200){
    	data=JSON.parse(LZString.decompressFromUTF16(xhr.responseText));
    	sortRelics();
    }
};
xhr.open("GET", 'data.txt', true);
xhr.send();

document.addEventListener('click', function(e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    var isInEventGroup = (element) => {
    	if(element.parentElement.nodeName=="DIV" && element.parentElement.className.includes("searchBar"))return element.parentElement;
    	else if(element.parentElement.nodeName=="HTML")return false;
    	return isInEventGroup(element.parentElement);
    };
    element = isInEventGroup(target);
    Array.from(document.getElementsByClassName("searchList")).forEach(e=> {e.style.display='none'});
    if(element)toggleFocus(element,true);
}, false);

function searchPart(search){
	partList.innerHTML="";
	var filtered = (function(pattern){
		var filtered = [], i = objectKeys.length, re = new RegExp(pattern,'i');
		for(i=0;i<objectKeys.length;i++) {
			var partHtml="";
			if(!showParts && !objectKeys[i].includes("Prime Blueprint"))continue;

			if(!showVaultedParts && objects[objectKeys[i]].vaulted)continue;

			if (re.test(objectKeys[i])) {
				filtered.push(objectKeys[i]);
				if(filtered.length<15){
					img = getImgPart(objectKeys[i]);
					partHtml=`<li onmouseover="expandRelicData(this,true)" onmouseout="expandRelicData(this,false)"><img src="${img}"><span>${objectKeys[i].replace(re,str => {return `<bl>${str}</bl>`})} ${(objects[objectKeys[i]].vaulted)?"(V)":""}</span>`;

					relicHtml="";
					Object.keys(objects[objectKeys[i]].relics).sort((a,b) => {
						rl={"Axi":3,"Neo":2,"Meso":1,"Lith":0},a=rl[a.slice(0, -3)],b=rl[b.slice(0, -3)];
						if(a<b)return -1;
						else if(a>b)return 1;
						else return 0;
					}).forEach(relic=>{
						img = getImgPart(relic);
						rel = objects[objectKeys[i]].relics[relic];
						relicHtml+=`<li style="color:${{"Common":"#9c784e","Uncommon":"#b4b7d0","Rare":"#e6bd68"}[rel.rarity]}">${relic} ${rel.rarity} ${(rel.vaulted)?"(V)":""}<img src="${img}"></li>`;
					});

					partHtml+=`<ul style="display:none" class="dropsDetails">${relicHtml}</ul></li>`
					partList.innerHTML+=partHtml;
				}
			}
		}
		return filtered;
	})(search.value);
	partList.innerHTML+=`<li>Found ${filtered.length} Items</li>`
	toggleFocus(search.parentElement,search.value!="");
}

function searchRelic(search){
	relicList.innerHTML="";
	
	var filtered = (function(pattern){
		var filtered = [], i = relicKeys.length, re = new RegExp(pattern,'i');
		for(i=0;i<relicKeys.length;i++) {
			var relicHtml="";
			if(!showVaultedRelics && relics[relicKeys[i]].vaulted)continue;
			if (re.test(relicKeys[i])) {
				filtered.push(relicKeys[i]);
				if(filtered.length<15){
					img = getImgPart(relicKeys[i]);
					relicHtml+=`<li class="relics" onmouseover="expandRelicData(this,true)" onmouseout="expandRelicData(this,false)"><img src="${img}"><span>${relicKeys[i].replace(re,str => {return `<bl>${str}</bl>`})} ${(relics[relicKeys[i]].vaulted)?"(V)":""}</span>`;

					rewardHtml="";
					relics[relicKeys[i]].rewards.sort((a,b) => {
						ra={"Rare":2,"Uncommon":1,"Common":0},a=ra[a.rarity],b=ra[b.rarity];
						if(a<b)return -1;
						else if(a>b)return 1;
						else return 0;
					}).forEach(reward=>{
						img = getImgPart(reward.itemName);
						rewardHtml+=`<li style="color:${{"Common":"#9c784e","Uncommon":"#b4b7d0","Rare":"#e6bd68"}[reward.rarity]}">${reward.itemName}<img src="${img}"></li>`;
					});
					relicHtml+=`<ul style="display:none" class="dropsDetails">${rewardHtml}</ul></li>`;

					relicList.innerHTML+=relicHtml;
				}
			}
		}
		return filtered;
	})(search.value);
	relicList.innerHTML+=`<li>Found ${filtered.length} Relics</li>`;
	toggleFocus(search.parentElement,search.value!="");
}

function toggleFocus(element,focus){
	(element.getElementsByTagName('input')[0].value=='') ? focus=false : null;
	document.getElementById({"searchRelics":"relics","searchParts":"parts"}[(typeof element != 'string')?element.id:element]).style.display = focus ? "block" : "none";
}

function toggleSetting(element){
	eval(element.id+"=!"+element.id);
	switch(element.id){
		case "showVaultedRelics":
		case "showVaultedParts":
			document.getElementById({"showVaultedRelics":"vaultRelic","showVaultedParts":"vaultPart"}[element.id]).src = "https://i.imgur.com/" + (eval(element.id) ? "RbCgY36" : "klU7igo") + ".png";
			document.getElementById({"showVaultedRelics":"vaultRelic","showVaultedParts":"vaultPart"}[element.id]).title = (eval(element.id) ? "Hide Vaulted Items" : "Show Vaulted Items");
			(element.id=="showVaultedRelics")?searchRelic(document.getElementById("searchRelicsBar")):searchPart(document.getElementById("searchPartsBar"));
			break;
		case "showParts":
			document.getElementById("stock").src = "https://i.imgur.com/" + (showParts ? "vNDFczG" : "N54k436") + ".png";
			document.getElementById("stock").title = (showParts ? "Hide Parts" : "Show Parts");
			searchPart(document.getElementById("searchPartsBar"));
	}
}

function addRelicToList(relic){
	document.getElementById("relicHistory").innerHTML += `<li><h>${relic}</h1></li>`;
}

function expandRelicData(element,state){element.childNodes[2].style.display=(state) ? "block" : "none";}

function getImgPart(object){
	var imgObject="",scale=30;
	part = object.replace(" Prime Blueprint","");

	//Relics
	if(part.trim().split(/\s+/).length==2){
		tier = part.trim().split(/\s+/)[0].toLowerCase();
		if(tier in data.ref.relics)imgObject=data.ref.relics[tier];
	}

	//Weapon/Frame BP
	if(part.trim().split(/\s+/).length == 1){
		//Frames
		if(part.toLowerCase() in data.frames)imgObject=data.frames[part.toLowerCase()].img;
		//Weapons
		if(part.toLowerCase() in data.weapons)imgObject=data.weapons[part.toLowerCase()].img;
	}

	//Genric Parts
	part = part.replace(" Blueprint","").trim().split(/\s+/)[part.replace(" Blueprint","").trim().split(/\s+/).length-1].toLowerCase();
	if(!imgObject && part in data.ref.icons)
		imgObject=data.ref.icons[part];
	else if(!imgObject && part in data.ref.partsRef)
		imgObject=data.ref.icons[data.ref.partsRef[part]];

	img = (imgObject) ? data.ref.img + imgObject + data.ref.scaleImg + scale : "";

	//if(!imgObject)console.error(object,part);//Missing Images
	return img;
}

function sortRelics(){
	var t0 = performance.now(),sortedObjects = {};
	Object.keys(data.relics).forEach(relic => {
		data.relics[relic].rewards.forEach((item,i) => {
			if(!sortedObjects.hasOwnProperty(item.itemName))sortedObjects[item.itemName]={};
			if(!sortedObjects[item.itemName].hasOwnProperty("relics"))sortedObjects[item.itemName].relics={};

			sortedObjects[item.itemName].vaulted=false;
			part = item.itemName.trim().split(/\s+/)[0];
			if(part.toLowerCase() in data.frames)sortedObjects[item.itemName].vaulted=(data.frames[part.toLowerCase()].state=='v')
			if(part.toLowerCase() in data.weapons)sortedObjects[item.itemName].vaulted=(data.weapons[part.toLowerCase()].state=='v')

			if(!sortedObjects[item.itemName].relics.hasOwnProperty(relic)) sortedObjects[item.itemName].relics[relic]={};
			
			sortedObjects[item.itemName].relics[relic] = Object.assign(sortedObjects[item.itemName].relics[relic],{
				"tier":data.relics[relic].tier,
				"name":data.relics[relic].relicName,
				"rarity":data.relics[relic].rewards[i].rarity,
				"vaulted":relic.matches(data.vaultedRelics)
			});
			//TODO Add Chance Data in Server Side Data.json
			sortedObjects[item.itemName].relics[relic][data.relics[relic].state]=item.chance;
		});
	});

	console.log(data.relics,sortedObjects);
	objects = sortedObjects,objectKeys = Object.keys(objects).sort();
	relics = data.relics,relicKeys = Object.keys(data.relics).sort();
	var t1 = performance.now();
	console.log("Sort of relics took " + (t1 - t0) + " milliseconds.");
}