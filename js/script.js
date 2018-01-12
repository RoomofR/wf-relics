var data,objects,relics,showParts=true,showVaultedParts=true,showVaultedRelics=true;
initData(data=>{
	this.data=data;
	sortRelics();
})

var objectKeys,partList = document.getElementById("parts");
function searchPart(search){
	console.log(search.value);
	(search.value=="") ? partsFocus(false) : partsFocus(true);
	var partsHtml="";
	var filtered = (function(pattern){
		var filtered = [], i = objectKeys.length, re = new RegExp(pattern,'i');
		for(i=0;i<objectKeys.length;i++) {

			if(!showParts && !objectKeys[i].includes("Prime Blueprint"))continue;

			if(!showVaultedParts && objects[objectKeys[i]].vaulted)continue;

			if (re.test(objectKeys[i])) {
				filtered.push(objectKeys[i]);
				if(filtered.length<300){
					img = getImgPart(objectKeys[i]);
					partsHtml+=`<li><img src="${img}"><span>${objectKeys[i].replace(re,str => {return `<bl>${str}</bl>`})} ${(objects[objectKeys[i]].vaulted)?"(V)":""}</span></li>`;
				}
			}
		}
		return filtered;
	})(search.value);
	partsHtml+=`<li>Found ${filtered.length} Items</li>`
	partList.innerHTML=partsHtml;
	//document.getElementById("debug").innerHTML=filtered.join("|");
}

var relicKeys,relicList = document.getElementById("relics");
function searchRelic(search){
	console.log(search.value);
	(search.value=="") ? relicsFocus(false) : relicsFocus(true);
	var relicsHtml="";
	var filtered = (function(pattern){
		var filtered = [], i = relicKeys.length, re = new RegExp(pattern,'i');
		for(i=0;i<relicKeys.length;i++) {
			if(!showVaultedRelics && relics[relicKeys[i]].vaulted)continue;
			if (re.test(relicKeys[i])) {
				filtered.push(relicKeys[i]);
				if(filtered.length<15){
					img = getImgPart(relicKeys[i]);
					relicsHtml+=`<li onmouseover="expandRelicData(this,true)" onmouseout="expandRelicData(this,false)"><img src="${img}"><span>${relicKeys[i].replace(re,str => {return `<bl>${str}</bl>`})} ${(relics[relicKeys[i]].vaulted)?"(V)":""}</span>`;

					rewardHtml="";
					relics[relicKeys[i]].rewards.sort((a,b) => {
						ra={"Rare":2,"Uncommon":1,"Common":0},a=ra[a.rarity],b=ra[b.rarity];
						if(a<b)return -1;
						else if(a>b)return 1;
						else return 0;
					}).forEach(reward=>{
						img = getImgPart(reward.itemName);
						rewardHtml+=`<li style="color:${{"Common":"#9c784e","Uncommon":"#b4b7d0","Rare":"#e6bd68"}[reward.rarity]}"><img src="${img}">${reward.itemName}</li>`;
					});
					relicsHtml+=`<ul style="display:none" class="relicDropsDetails">${rewardHtml}</ul>`;

					relicsHtml+="</li>";
				}
			}
		}
		return filtered;
	})(search.value);
	relicsHtml+=`<li>Found ${filtered.length} Relics</li>`
	relicList.innerHTML=relicsHtml;
	//document.getElementById("debug").innerHTML=filtered.join("|");
}

function expandRelicData(element,state){element.childNodes[2].style.display=(state) ? "block" : "none";}

function partsFocus(focus,obj){
	document.getElementById('parts').style.display = focus ? "block" : "none";
	if(obj && obj.value=='') document.getElementById('parts').style.display = "none";
}

function relicsFocus(focus,obj){
	document.getElementById('relics').style.display = focus ? "block" : "none";
	if(obj && obj.value=='') document.getElementById('relics').style.display="none"
}

function toggleShowParts(){
	partsFocus(true)
	showParts=!showParts;
	document.getElementById("stock").src = "https://i.imgur.com/" + (showParts ? "vNDFczG" : "N54k436") + ".png";
	document.getElementById("stock").title = (showParts ? "Hide Parts" : "Show Parts");
	searchPart(document.getElementById("searchPartsBar"));
}

function toggleVaulted(bar){
	if(bar=='relic'){
		relicsFocus(true)
		showVaultedRelics=!showVaultedRelics;
		document.getElementById("vaultRelic").src = "https://i.imgur.com/" + (showVaultedRelics ? "RbCgY36" : "klU7igo") + ".png";
		document.getElementById("vaultRelic").title = (showVaultedRelics ? "Hide Vaulted Relics" : "Show Vaulted Relics");
		searchRelic(document.getElementById("searchRelicsBar"));
	}else{
		partsFocus(true)
		showVaultedParts=!showVaultedParts;
		document.getElementById("vaultPart").src = "https://i.imgur.com/" + (showVaultedParts ? "RbCgY36" : "klU7igo") + ".png";
		document.getElementById("vaultPart").title = (showVaultedParts ? "Hide Vaulted Items" : "Show Vaulted Items");
		searchPart(document.getElementById("searchPartsBar"));
	}
}

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

	if(!imgObject)console.log(object,part);
	return img;
}

function sortRelics(){
	var t0 = performance.now();
	sortedObjects = {},sortedRelics = {};

	data.relics.forEach(relic => {
		isRelicVaulted = getRelicName(relic).matches(data.vaultedRelics);
		//Fix Rarity Labels
		if(!(getRelicName(relic) in sortedRelics))
			sortedRelics[getRelicName(relic)]=Object.assign(relic,{"vaulted":isRelicVaulted,"fixed":false})

		if(!("fixed" in sortedRelics[getRelicName(relic)] && sortedRelics[getRelicName(relic)].fixed)){
			console.log(sortedRelics[getRelicName(relic)].fixed);
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

		//Sort Relics in Objects/Parts
		relic.rewards.forEach((item,i) => {
			if(!sortedObjects.hasOwnProperty(item.itemName))sortedObjects[item.itemName]={};
			if(!sortedObjects[item.itemName].hasOwnProperty("relics"))sortedObjects[item.itemName].relics={};

			sortedObjects[item.itemName].vaulted=false;
			part = item.itemName.trim().split(/\s+/)[0];
			if(part.toLowerCase() in data.frames)sortedObjects[item.itemName].vaulted=(data.frames[part.toLowerCase()].state=='v')
			if(part.toLowerCase() in data.weapons)sortedObjects[item.itemName].vaulted=(data.weapons[part.toLowerCase()].state=='v')

			if(!sortedObjects[item.itemName].relics.hasOwnProperty(getRelicName(relic))) sortedObjects[item.itemName].relics[getRelicName(relic)]={};
			
			sortedObjects[item.itemName].relics[getRelicName(relic)] = Object.assign(sortedObjects[item.itemName].relics[getRelicName(relic)],{
				"tier":relic.tier,"name":relic.relicName,"rarity":sortedRelics[getRelicName(relic)].rewards[i].rarity,"vaulted":isRelicVaulted});
			sortedObjects[item.itemName].relics[getRelicName(relic)][relic.state]=item.chance;
		});
	});

	console.log(sortedObjects);
	console.log(sortedRelics);

	//output(syntaxHighlight(data.relics));
	//output(syntaxHighlight(sortedObjects));

	objects = sortedObjects, relics = sortedRelics;
	objectKeys = Object.keys(objects).sort(), relicKeys = Object.keys(relics).sort();

	var t1 = performance.now();
	console.log("Sort of relics took " + (t1 - t0) + " milliseconds.")
}