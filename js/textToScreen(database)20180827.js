
const X = XLSX;
let result = {};
let con;
let weeksCompleted;
let projectMonths;
window.setfmt = setfmt;
const xlf = document.getElementById('xlf');
let global_wb;

if(xlf.addEventListener) xlf.addEventListener('change', handleFile, false);

//Excel Import Functions - DO NOT CHANGE!
const fixdata = data=> {
	let o = "", l = 0, w = 10240;
	for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
	o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
	return o;
}

const to_json = workbook=> {
	workbook.SheetNames.forEach(function(sheetName) {
		const roa = X.utils.sheet_to_json(workbook.Sheets[sheetName]);
		let startPoint;
		if(roa.length >= 0){
			if (sheetName=="considerateConstructors" ||sheetName=="SubConFinData" || sheetName=="HSData" || sheetName=="monthlyKPI"|| sheetName=="NewRecordOfLabour"|| sheetName=="financialData"|| sheetName=="TradeAccidents"|| sheetName=="AccidentReport" || sheetName=="MaterialOrdersCategories" || sheetName=="MaterialOrdersType"|| sheetName=="CCS"|| sheetName=="CWDsTotal"|| sheetName=="CWDsMonthly" ){
				let subConData=[];
				const totalSubConData=roa;
				for(let j=0;j<totalSubConData.length;j++){
					const arrayConNumber =totalSubConData[j].ContractNumber; 
					if(arrayConNumber===con){
						subConData.push(totalSubConData[j]);
					}
					else{
						continue;
					}
				}
				if(sheetName=="HSData"){
					for(var key in subConData){
						for(var header in subConData[key]){
							if(header!="ContractNumber"&&subConData[key][header]!='0')
							{	
								startPoint = header;
								break;
							}
							else{
								delete subConData[key][header];
							}
						}
					}
				}
				result[sheetName]=subConData;
			}
			else{
				for(let i=0;i<roa.length;i++){
					if(roa[i].ContractNumber===con)
						{
							result[sheetName] = roa[i];
							break;
						}
				}
			}
		}
	});
	hideInput();
	getProjectMonths();
	setZoom();
	createDataStructures();
	createGraphsStructures();	
	//getmonthlyCWDTotals();
	getCWDTotals();
	populateTables();
	createGraphsContent();
	//createGraphs();
	//createEnforcementActionTbl()();
	hideSections('summary-page');
	return result;
}

const createDataStructures = ()=>{
	createSummarySections();
	createProjectKpiSection();
	createProgressSection('#progress');
	createSubContractorSection('#subContractorData');
	createFinancialDataSection();
	createHSDataSection('#hsData');
}

const createGraphsStructures = ()=>{
	createProgressGraphs();
	createFinancialGraphs();
	createCcsGraphs();
	createSubConFinGraphs('#subcontractorGraphs');
	createHSGraphSection();
}

const createGraphsContent = ()=>{
	//Summary
	progressGraph('summaryProgressGraph');
	HSMonthlyAuditGraph('hsGraphGraph');
	createTimeChart('timeGraphGraph');
	createValueChart('valueGraphGraph');
	//Progress Graphs
	progressGraph('monthProgressSectionGraph');
	currentWeekRecordOfLabourGraph('weeklyRecOfLbrGraphSectionGraph');
	recordOfLabourTotalsGraph('recOfLbrGraphSectionGraph');
	//financial Graphs
	createTurnoverGraph('predictabilitySectionGraph');
	costflowGraph('costflowGraphSectionGraph');
	totalCwdToDate('cwdGraphSectionGraph');
	monthlyCwdToDate('monthlyCwdGraphSectionGraph');
	//Sub-Contractor Finance Graphs
	subContractorOrderVariations('subConFinGraphSectionGraph');
	//CCS & Costs Graphs
	considerateContractorsGraph('consConstructorsGraphSectionGraph');
	materialsOrderedChart('matsSummaryGraphSectionGraph');
	materialsReasonChart('matsReplacementGraphSectionGraph');
	//HS Graphs
	HSMonthlyAuditGraph('monthlyAuditGraphSectionGraph');
	daysLostGraph('accidentsGraphGraphSectionGraph');
	tradeAccidentGraph('accidentByTradeGraphSectionGraph');
	typeAccidentGraph('accidentByTypeGraphSectionGraph');
}

const createSummaryContents =()=>{
	createProjectKPITbl();
}

const process_wb=wb=> {
	global_wb = wb;
	let output = "";
	output = JSON.stringify(to_json(wb), 2, 2);
}

var setfmt=()=> {if(global_wb) process_wb(global_wb); }


function handleFile(e) {
	const files = e.target.files;
	const f = files[0];
	{
		const reader = new FileReader();
		reader.onload = function(e) {
			const data = e.target.result;
			let wb;
			const arr = fixdata(data);
			wb = X.read(btoa(arr), {type: 'base64'});
			process_wb(wb);
		};
		reader.readAsArrayBuffer(f);
	}
}

//Lookup functions
const getmonthlyCWDTotals = ()=>{
}

const getCWDTotals = ()=>{
}

const getRecordOfLabourDay = i=>{
	let dayOfWeek;
	switch(i){
		case 1:
			dayOfWeek = 'Monday';
			break;
		case 2:
			dayOfWeek = 'Tuesday';
			break;
		case 3:
			dayOfWeek = 'Wednesday';
			break;
		case 4:
			dayOfWeek = 'Thursday';
			break;
		case 5:
			dayOfWeek = 'Friday';
			break;
		case 6:
			dayOfWeek = 'Saturday';
			break;
		case 7:
			dayOfWeek = 'Sunday';
			break;
	}
	return dayOfWeek;
}

const getTradeFigures = ()=>{
	
}

const getTypeFigures = ()=>{
	
}

const getCurrentYear = ()=>{
	const d = new Date();
	const thisYear = d.getFullYear();
	return thisYear;
}

const getCurrenMonth = ()=>{
	const d = new Date();
	const monthNum = d.getMonth()+1;
	return monthNum;
}

const getContractNumber = ()=>{
	const conNumber = con.substring(1,5);
	return conNumber
}

const getAccidentReport = ()=>{	
}

const constructDate = (fieldContents, fieldID)=> {
    const str = fieldContents;
    const seperator = str.indexOf(",");
    const year = str.substring((seperator+2), (seperator+6));
    const day = getDay(str);
    const month = getMonth(str, seperator);
    const date = "D/"+year+"/"+month+"/"+day+":0:0:0";
    document.getElementById(fieldID).value = date;
}

const getMonth = (str, comma)=>{
	const Str = str
	const endOfMonth = comma
	const writtenMonth=(Str.charAt(1)==" ")?Str.substring(2,endOfMonth):Str.substring(3,endOfMonth);
	const monthNumber = getMonthNumber(writtenMonth);
	return monthNumber;
}

const getMonthNumber = writtenMonth=>{
	let monthNum;
	switch(writtenMonth){
		case "January":
			monthNum = 1;
			return monthNum;
		case "February":
			monthNum = 2;
			return monthNum;
		case "March":
			monthNum = 3;
			return monthNum;
		case "April":
			monthNum = 4;
			return monthNum;
		case "May":
			monthNum = 5;
			return monthNum;
		case "June":
			monthNum = 6;
			return monthNum;
		case "July":
			monthNum = 7;
			return monthNum;
		case "August":
			monthNum = 8;
			return monthNum;
		case "September":
			monthNum = 9;
			return monthNum;
		case "October":
			monthNum = 10;
			return monthNum;
		case "November":
			monthNum = 11;
			return monthNum;
		case "December":
			monthNum = 12;
			return monthNum;
	}
}

const getMonthName = monthNumber=>{
	let writtenMonth;
	switch(monthNumber){
		case "01":
			writtenMonth = "Jan";
			break;
		case "02":
			writtenMonth = "Feb";
			break;
		case "03":
			writtenMonth = "Mar";
			break;
		case "04":
			writtenMonth = "Apr";
			break;
		case "05":
			writtenMonth = "May";
			break;
		case "06":
			writtenMonth = "Jun";
			break;
		case "07":
			writtenMonth = "Jul";
			break;
		case "08":
			writtenMonth = "Aug";
			break;
		case "09":
			writtenMonth = "Sep";
			break;
		case "10":
			writtenMonth = "Oct";
			break;
		case "11":
			writtenMonth = "Nov";
			break;
		case "11":
			writtenMonth = "Dec";
			break;
	}
	return writtenMonth;
}

const getDay = givenDate=>{
	const definedDate = givenDate;
	var day = (definedDate.charAt(1)==" ")? definedDate.charAt(0):definedDate.substring(0,2);
	return day;
}

const getTypeCategory = type=>{
	let typeCategory;
	let userType=type.toLowerCase();
	const typeSplit = userType.indexOf('/');
	if(typeSplit!==-1){
		userType = userType.substr(0,typeSplit);
	}
	let typesCategories={
		'abdomen':function(){typeCategory='Abdomen';},
		'ankle':function(){typeCategory='Legs';},
		'arm':function(){typeCategory='Arms';},
		'arms':function(){typeCategory='Arms';},
		'back':function(){typeCategory='Back';},
		'bum':function(){typeCategory='Bum';},
		'burn':function(){typeCategory='Burns';},
		'burns':function(){typeCategory='Burns';},
		'chest':function(){typeCategory='Chest';},
		'eye':function(){typeCategory='Eyes';},
		'eyes':function(){typeCategory='Eyes';},
		'face':function(){typeCategory='Face';},
		'feet':function(){typeCategory='Feet';},
		'finger':function(){typeCategory='Hands';},
		'fingers':function(){typeCategory='Hands';},
		'foot':function(){typeCategory='Feet';},
		'hand':function(){typeCategory='Hands';},
		'hands':function(){typeCategory='Hands';},
		'head':function(){typeCategory='Head';},
		'jaw':function(){typeCategory='Jaw';},
		'knee':function(){typeCategory='Legs';},
		'knees':function(){typeCategory='Legs';},
		'knuckle':function(){typeCategory='Hands';},
		'knuckles':function(){typeCategory='Hands';},
		'leg':function(){typeCategory='Legs';},
		'legs':function(){typeCategory='Legs';},
		'mouth':function(){typeCategory='Jaw';},
		'muscle':function(){typeCategory='Muscular';},
		'muscles':function(){typeCategory='Muscular';},
		'muscular':function(){typeCategory='Muscular';},
		'neck':function(){typeCategory='Neck';},
		'nose':function(){typeCategory='Face';},
		'pelvis':function(){typeCategory='Pelvis';},
		'penis':function(){typeCategory='Penis';},
		'rib':function(){typeCategory='Abdomen';},
		'ribs':function(){typeCategory='Abdomen';},
		'shoulder':function(){typeCategory='Shoulder';},
		'shoulders':function(){typeCategory='Shoulder';},
		'skeletal':function(){typeCategory='Skeletal';},
		'teeth':function(){typeCategory='Jaw';},
		'toe':function(){typeCategory='Feet';},
		'tooth':function(){typeCategory='Jaw';},
		'toes':function(){typeCategory='Feet';},
		'wrist':function(){typeCategory='Arms';},
		'wrists':function(){typeCategory='Arms';}
	};
	(typesCategories[userType])();
	return typeCategory;
}

const getTradeCategory = trade=>{
	const tradeName = trade.toLowerCase();
	let tradeCategory;
	let tradeFieldIdLookup={
		'asbestosremoval':function(){tradeCategory='AsbestosRemoval';},
		'brickwork':function(){tradeCategory='Brickwork';},
		'carpenter':function(){tradeCategory='Carpentry';},
		'carpentry':function(){tradeCategory='Carpentry';},
		'cladding':function(){tradeCategory='Cladding';},
		'cleaning':function(){tradeCategory='Cleaning';},
		'decorator':function(){tradeCategory='PaintingAndDecoration';},
		'demolition':function(){tradeCategory='Demolition';},
		'electrical':function(){tradeCategory='Electrical';},
		'electrician':function(){tradeCategory='Electrical';},
		'fencing':function(){tradeCategory='Fencing';},
		'flooring':function(){tradeCategory='Flooring';},
		'forklift':function(){tradeCategory='Forklift';},
		'frame':function(){tradeCategory='Frame';},
		'glazing':function(){tradeCategory='Glazing';},
		'groundworker':function(){tradeCategory='Groundwork';},
		'groundwork':function(){tradeCategory='Groundwork';},
		'insulation':function(){tradeCategory='Insulation';},
		'labour':function(){tradeCategory='Labourer';},
		'labourer':function(){tradeCategory='Labourer';},
		'landscaper':function(){tradeCategory='Landscaping';},
		'landscaping':function(){tradeCategory='Landscaping';},
		'lifts':function(){tradeCategory+='Lifts';},
		'lightningProtection':function(){tradeCategory='LightningProtection';},
		'management':function(){tradeCategory='Management';},
		'manager':function(){tradeCategory='Management';},
		'mastic':function(){tradeCategory='Mastic';},
		'mechanic':function(){tradeCategory='Mechanical';},
		'mechanical':function(){tradeCategory='Mechanical';},
		'metalwork':function(){tradeCategory='Metalwork';},
		'paintinganddecoration':function(){tradeCategory='PaintingAndDecoration';},
		'painter':function(){tradeCategory='PaintingAndDecoration';},
		'projdir':function(){tradeCategory='Management';},
		'pestcontrol':function(){tradeCategory='PestControl';},
		'piling':function(){tradeCategory='Piling';},
		'plasterer':function(){tradeCategory='Plastering';},
		'plastering':function(){tradeCategory='Plastering';},
		'plumber':function(){tradeCategory='Plumbing';},
		'plumbing':function(){tradeCategory='Plumbing';},
		'render':function(){tradeCategory='Render';},
		'roofer':function(){tradeCategory='Roofing';},
		'roofing':function(){tradeCategory='Roofing';},
		'scaffolder':function(){tradeCategory='Scaffolding';},
		'scaffolding':function(){tradeCategory='Scaffolding';},
		'steelworker':function(){tradeCategory='Steelwork';},
		'steelwork':function(){tradeCategory='Steelwork';},
		'tiler':function(){tradeCategory='Tiling';},
		'tiling':function(){tradeCategory='Tiling';},
		'treeSurgeon':function(){tradeCategory='TreeSurgery';},
		'treeSurgery':function(){tradeCategory='TreeSurgery';},
		'waterProofing':function(){tradeCategory='WaterProofing';},
		'windows':function(){tradeCategory='Windows';}
	};
	(tradeFieldIdLookup[tradeName])();
	return tradeCategory;
}

const getTradeFieldID = trade=>{
	const tradeName =trade.toLowerCase(); 
	let fieldID;
	const tradeFieldIdLookup={
		'asbestosremoval':function(){fieldID='AsbestosRemovalValue';},
		'brickwork':function(){fieldID='brickworkValue';},
		'carpentry':function(){fieldID='carpentryValue';},
		'cladding':function(){fieldID='claddingValue';},
		'cleaning':function(){fieldID='cleaningValue';},
		'demolition':function(){fieldID='demolitionValue';},
		'electrical':function(){fieldID='electricalValue';},
		'fencing':function(){fieldID='fencingValue';},
		'flooring':function(){fieldID='flooringValue';},
		'forklift':function(){fieldID='forkliftValue';},
		'frame':function(){fieldID='frameValue';},
		'glazing':function(){fieldID='glazingValue';},
		'groundwork':function(){fieldID='groundworkValue';},
		'insulation':function(){fieldID='insulationValue';},
		'labourer':function(){fieldID='labourerValue';},
		'landscaping':function(){fieldID='landscapingValue';},
		'lifts':function(){fieldID='liftsValue';},
		'lightningprotection':function(){fieldID='lightningProtectionValue';},
		'management':function(){fieldID='managmentValue';},
		'mastic':function(){fieldID='masticValue';},
		'mechanical':function(){fieldID='mechanicalValue';},
		'metalwork':function(){fieldID='metalworkValue';},
		'paintinganddecoration':function(){fieldID='PaintingAndDecorationValue';},
		'pestcontrol':function(){fieldID='pestControlValue';},
		'piling':function(){fieldID='pilingValue';},
		'plastering':function(){fieldID='plasteringValue';},
		'plumbing':function(){fieldID='plumbingValue';},
		'render':function(){fieldID='renderValue';},
		'roofing':function(){fieldID='roofingValue';},
		'scaffolding':function(){fieldID='scaffoldingValue';},
		'steelwork':function(){fieldID='steelworkValue';},
		'tiling':function(){fieldID='tilingValue';},
		'treesurgery':function(){fieldID='treeSurgeryValue';},
		'waterproofing':function(){fieldID='waterProofingValue';},
		'windows':function(){fieldID='windowsValue';}
	};
	(tradeFieldIdLookup[tradeName])();
	return fieldID;
}

const getTypeFieldID = type=>{
	const typeName =getTypeCategory(type); 
	let fieldID;
	const typeFieldIdLookup={
		'Abdomen':function(){fieldID='abdomenValue';},
		'Arms':function(){fieldID='armsValue';},
		'Back':function(){fieldID='backValue';},
		'Burns':function(){fieldID='burnsValue';},
		'Chest':function(){fieldID='chestValue';},
		'Eyes':function(){fieldID='eyesValue';},
		'Face':function(){fieldID='faceValue';},
		'Feet':function(){fieldID='feetValue';},
		'Hands':function(){fieldID='handsValue';},
		'Head':function(){fieldID='handValue';},
		'Jaw':function(){fieldID='jawValue';},
		'Legs':function(){fieldID='legsValue';},
		'Muscular':function(){fieldID='muscularValue';},
		'Neck':function(){fieldID='neckValue';},
		'Pelvis':function(){fieldID='pelvisValue';},
		'Penis':function(){fieldID='penisValue';},
		'Shoulder':function(){fieldID='shoulderValue';},
		'Skeletal':function(){fieldID='skeletalValue';}
	};
	(typeFieldIdLookup[typeName])();
	return fieldID;
}

//create card functions
const createDataCard = (containerClass, containerID, cardContentID, Title)=>{
	const container = createDiv(containerID+'Section', containerClass);
	const card = createDiv(containerID+'Card','card');
	const title = createTitle('h5',Title);
	const content = createDiv(cardContentID, 'card-content');
	content.appendChild(title);
	card.appendChild(content);
	container.appendChild(card);
	return container;
}

const createMultiDataCard = (containerClass, id, numOfItems, Title, subItemTitles)=>{
	const container = createDiv(id+'Section', containerClass);
	const card = createDiv(id+'Card','card');
	const sectionSize = 12/numOfItems;
	const title = createTitle('h5',Title);
	const content = createDiv(id+'Content', 'card-content row');
	if(title ==""){content.appendChild(title)};
	for(let i = 0;i<numOfItems;i++){
		const innerSectionDiv = createDiv(subItemTitles[i]+	'section','col s12 l6')
		const innerSectionTitle = createTitle('h5',subItemTitles[i]);
		innerSectionDiv.appendChild(innerSectionTitle);
		const innerSection = createDiv(subItemTitles[i].replace(/\s/g, '')+'Tbl');
		innerSectionDiv.appendChild(innerSection);
		content.appendChild(innerSectionDiv);
	}
	card.appendChild(content);
	container.appendChild(card);
	return container;
}

const createGraphCard = (containerClass, containerID, cardContentID, Title)=>{
	const container = createDiv(containerID+'Section', containerClass);
	const card = createDiv(containerID+'Card','card');
	const title = createTitle('h5',Title);
	const content = createDiv(cardContentID, 'card-content');
	const graphDiv = createDiv(containerID+'Graph');
	content.appendChild(title);
	content.appendChild(graphDiv);
	card.appendChild(content);
	container.appendChild(card);
	return container;
}

const createMultiGraphCard = (containerClass, id, numOfItems, graphIds, subItemTitles)=>{
	const container = createDiv(id+'Section', containerClass);
	const card = createDiv(id+'Card','card');
	const sectionSize = 12/numOfItems;
	const content = createDiv(id+'Content', 'card-content row');
	for (let i=0;i<numOfItems;i++){
		const graphDiv = createDiv(graphIds[i]+'Graph');
		graphDiv.setAttribute('class','col s12 l'+sectionSize);
		if(subItemTitles[i]!=""){
			const graphTitle = createTitle('h5',subItemTitles[i]);
			graphDiv.appendChild(graphTitle);
		}
		content.appendChild(graphDiv);
	}
	card.appendChild(content);
	container.appendChild(card);
	return container;
}

//General Functions

const hideSections = sectionName=>{
	const section = ['inputData','summary-page', 'progressGraphs','financialGraph','subcontractorGraphs','hsGraphs','progress', 'ccsCosts','subContractorData','financialData','hsData','projectKPIs','timeValueGraphs'];
	for (let i=0;i<section.length;i++){
		(sectionName!=section[i])? document.querySelector('#'+section[i]).style.display = "none":document.querySelector('#'+section[i]).style.display = "block";
	}
	document.body.scrollTop = 200;
}

const hideInput = ()=>{
	const inputFields = document.querySelector("#inputData");
	inputFields.style.display="none";
}

const setZoom = ()=>{
	const devicePixelRatio = window.devicePixelRatio || 1;
	dpi_x = document.getElementById('testdiv').offsetWidth * devicePixelRatio;
	if(dpi_x>96){
		document.querySelector('body').setAttribute('class','dashboardZoom');
	}
}

const conNum = ()=>{con=document.querySelector("#contractNumber").value;}


const addCommas = intNum=>{return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');}
const removeCommas = intNum=>{return (intNum + '').replace(/,/g, '');}

const asciiToChar = textToConvert=>{
	let name = textToConvert;
	name = name.replace(/%20/g,' ');
	name = name.replace(/%26/g,'&');
	name = name.replace(/%27/g,'\'');
	name = name.replace(/%28/g,'(');
	name = name.replace(/%29/g,')');
	name = name.replace(/%2B/g,'+');
	name = name.replace(/%2C/g,',');
	name = name.replace(/%2D/g,'-');
	name = name.replace(/%2E/g,'.');
	name = name.replace(/%2F/g,'/');
	return name
}

const tableToArray = table=>{
	let tableArray=[];
	let rows = Array.from(table.rows);
	rows.shift();
	let t;
	let cellId = 0;
	for(let i=0; i<rows.length;i++){
		const cells=Array.from(rows[i].cells);
		t=[];
		for(let j=0;j<cells.length;j++){
			const cellContents=cells[j].textContent;
			t.push(cellContents);
			if(j!=0){cellId++;}
		}
		tableArray.push(t)
	}
	return tableArray;
}

const CwdTableToArray = table=>{
	let tableArray=[];
	let rows = Array.from(table.rows);
	rows.shift();
	let t;
	let cellId = 0;
	for(let i=0; i<rows.length;i++){
		const cells=Array.from(rows[i].cells);
		t=[];
		for(let j=0;j<cells.length;j++){
			const cellContents = cells[j].innerHTML; 
			t.push(cellContents);
			cellId++;
		}
		tableArray.push(t)
	}
	return tableArray;
}

const considerateConstractorsAverage = location=>{
	const table = Object.keys(result.CCS).map(n => result.CCS[n].Score);
	const rowNum= table.length;
	let scoreTotal=0;
	for(let i=0;i<rowNum;i++){
		scoreTotal+=parseInt(table[i]);
	}
	const scoreAverage=(scoreTotal/rowNum).toFixed(0);
	(isNaN(scoreAverage) || scoreAverage<1)?document.querySelector(location).innerHTML='-':document.querySelector(location).innerHTML = scoreAverage;
}

const createTitle = (titleSize, titleText)=>{
	const titleElement = document.createElement(titleSize);
	const titleElementText = document.createTextNode(titleText);
	titleElement.appendChild(titleElementText);
	return titleElement;
}

const createDiv = (divId,divClass)=>{
	const divElement = document.createElement('div');
	divElement.setAttribute('id',divId);
	if(divClass!= undefined){
		divElement.setAttribute('class',divClass);
	}
	return divElement;
}

const createTwoColBody = (tblSize,fieldIds,constFieldName, colTitle, staticFirstField)=>{
	const twoColTable = document.createElement('table');
	const tableHeader=document.createElement('thead');
	const headerRow = document.createElement('tr');
	for(let i=0;i<2;i++){
		const rowCell = document.createElement('th');
		const cellText = (i==0)?document.createTextNode(colTitle[i]):document.createTextNode(colTitle[i]);
		rowCell.appendChild(cellText);
		rowCell.setAttribute('class','center-align')
		headerRow.appendChild(rowCell);
	}
	tableHeader.appendChild(headerRow);
	twoColTable.appendChild(tableHeader);
	const tableBody = document.createElement('tbody');
	const tableSize= tblSize;
	for(let i=0;i<tableSize;i++){
		const bodyRow=document.createElement('tr');
		for(let k=0; k<2;k++){
			const bodyCell = document.createElement('td');
			const currFieldId = (typeof(fieldIds)=="string")?fieldIds:fieldIds[i];
			const fieldId = (constFieldName==true)?currFieldId+(i+1):currFieldId;
			const bodyCellId = (k==0)?fieldId:fieldId+'Value';
			bodyCell.setAttribute('id',bodyCellId);
			bodyCell.setAttribute('name',bodyCellId);
			bodyCell.setAttribute('class','center-align');
			bodyRow.appendChild(bodyCell);
		}
		tableBody.appendChild(bodyRow);
	}
	twoColTable.appendChild(tableBody);
	return twoColTable;
}

const formatDate = (datetag, rowName)=>{
	const dateFields = document.getElementsByClassName(rowName);
	const dateTime = datetag;
	const dateDay= dateTime.split("/")[1];
	const dateMonth= dateTime.split("/")[0];
	const dateYear = dateTime.split("/")[2];
	for(let i=0; i<dateFields.length; i++){
			dateFields[i].innerHTML= dateDay+"/"+ dateMonth +"/"+ dateYear;
	}
}

const numberformatter  = (val, type)=>{
	 const value = type=='financial'?setCurrency(formatNum(addCommas(parseFloat(val)))):
	 				type=='percentage'?setPercentage(formatNum(addCommas(parseFloat(val)))):
	 				formatNum(addCommas(parseFloat(val)));
	 return value;
}

const numberUnformatter = (val,type)=>{
	const value = type=='financial'?removeCurrency(unformatNum(removeCommas(val))):
	 				type=='percentage'?setPercentage(unformatNum((removeCommas(val)))):
	 				unformattedValue(addCommas(parseFloat(val)));
	 return value;
}

const formatNum = (val) => {
    const formattedValue = val < '0' ? '(' + val.replace('-', '') + ')' : val;
    return formattedValue;
}

const unformatNum = val =>{
	const unformattedValue = val.charAt(0)=='(' ? '-' + val.substr(1, val.length-1): val;
    return unformattedValue;
}

const setPercentage = val =>{
	const valSize = val.length;	
	const currencyValue = val.charAt(valSize-1)==')'?val.substr(0,valSize-1)+'%'+val.substr(valSize-1,valSize):val+'%';
	return currencyValue;
}

const removePercentage = val =>{
	const valSize = val.length;	
	const currencyValue = val.charAt(valSize-1)==')'?val.substr(0,valSize-1)+'%'+val.substr(valSize-1,valSize):val+'%';
	return currencyValue;
}


const setCurrency = val =>{
	const currencyValue = val.charAt(0)=='('?val.substr(0,1)+'£'+val.substr(1,val.length):'£'+val;
	return currencyValue;
}

const removeCurrency = val =>{
	const nonCurrencyValue = val.charAt(0)=='('?'-'+val.substr(1,val.length-2):val.substr(1,val.length-1)
	return nonCurrencyValue;
}

const sortTwoColTable = (tableId)=>{ 
  const table = document.querySelector(tableId);
  let shouldSwitch, i;
  let switching = true;
  while (switching) {
    switching = false;
    const rows = table.rows;
    for(i = 1; i < (rows.length - 1); i++) {
      shouldSwitch = false;
      const rowOne = rows[i].getElementsByTagName("td")[0].innerHTML;
      const rowTwo = rows[i +1].getElementsByTagName("td")[0].innerHTML;
      if (rowOne.toLowerCase() > rowTwo.toLowerCase()) {
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}

//traffic light filters
const moreThanZero = location=>{
	const figure=(document.querySelector(location).value==undefined)?document.querySelector(location).innerHTML:document.querySelector(location).value;
	const figureLength = figure.length;
	const fieldClass = (String(figure).charAt(0)=='(')?'red-text center-align':
					   (String(figure).charAt(1)=='0')?'orange-text center-align':
					   'green-text center-align';
	document.querySelector(location).setAttribute('class',fieldClass);
}

const lessThanZero = location=>{
	const figure=(document.querySelector(location).value==undefined)?document.querySelector(location).innerHTML:document.querySelector(location).value;
	const figureLength = figure.length;
	const numericFigure = (figure.charAt(0)=='£')?figure.substr(2,figureLength):figure;
	const fieldClass = (String(figure).charAt(0)=='(')?'green-text center-align':
					   (String(figure).charAt(1)=='0')?'orange-text center-align':
					   'red-text center-align';
	document.querySelector(location).setAttribute('class',fieldClass);
}

const lessThanZero2Colours = (figure, location)=>{
	const figureLength = figure.length;
	const numericFigure = (figure.charAt(0)=='£')?figure.substr(2,figureLength):figure;
	const fieldClass=parseInt(numericFigure)>0?'red-text center-align':'green-text center-align'
	document.querySelector(location).setAttribute('class',fieldClass);
}

const moreThanOnePct = (figure, location)=>{
	const figureLength = figure.length;
	const numericFigure = (figure.charAt(0)=='£')?figure.substr(2,figureLength):figure;
	const fieldClass =(parseInt(numericFigure)>0.99)?'red-txt center-align':'green-text center-align'
	document.querySelector(location).setAttribute('class',fieldClass);
}

const targetComparison = (projectKpiFigure, monthlyKpiFigure, location)=>{
	let projectKpi = projectKpiFigure
	if(projectKpi==''){projectKpi='0'};
	const fieldClass =(parseInt(monthlyKpiFigure)>parseInt(projectKpi))?'red-text center-align':'green-text center-align';
	document.querySelector(location).setAttribute('class',fieldClass);
}

const progressTrafficLight = (figure, location)=>{
	const progressFigure= parseInt(figure);
	const fieldClass = parseInt(numericFigure)<-2?'green-text center-align':
					   parseInt(numericFigure)>=0?'red-text center-align':
					   'orange-text center-align';
	document.querySelector(location).setAttribute('class',fieldClass);
}

//Populating tables
const findConsiderateConstructorVariance = ()=>{
	const considerateConstructorScore = document.querySelector('#considerateConstructorActual').innerHTML-document.querySelector('#considerateConstructorTarget').innerHTML;
	return isNaN(considerateConstructorScore)?'-':considerateConstructorScore;
}

const findPercentage = (value,totalOf)=>{
	return isNaN(value)? '': numberformatter((value/totalOf)*100,'percentage');
}

const getLastMonthlyKpiItem = ()=>{
	const monthlyKPIdata = result.monthlyKPI;
	const indexOfLastItem = result.monthlyKPI.length;
	return indexOfLastItem;
}

const getLastTurnoverItem = ()=>{
	turnoverData = result.Turnover
}

const populateTables = ()=>{
	const weeksCompleted = parseInt(result.timeValue.WeeksCompleted);
	tblAccidentType('#ByTypeTbl');
	tblAccidentTrade('#ByTradeTbl');
	//Import CWD and Record Of Labour Information
	createTimeTable();
	//createValueTable();
	createConsiderateConstructorsTable('#considerateContractorsTbl');
	createRecordOfLabourTable();
	createValuationInfoTbl();
	createOverheardContributionTbl();
	populateValuationInfoTbl();
	populateOverheadContributionTbl();
	//createCompletionDatesTbl();
	createProgressTbl();
	createCwdToDateTbl();
	createMonthlyCwdTbl();
	createPredTurnoverTbl();
	createCostflowTbl();
	createMonthlyKPITbl();
	createKpiCatTbl();
	createMatsByCats();
	createMatsByReason();
	populateMonthlyKpiTbl();
	populateKpiTable();
	setFieldTextColour();
	createsubConOrderVarTbl();
	createHSMonthlyAuditTbl();
	document.querySelector('#weeksCompleted').innerHTML=result.timeValue.WeeksCompleted;
	document.querySelector('#weeksContracted').innerHTML=result.timeValue.WeeksContracted;
	HSMonthlyAuditAvg();
	HSMonthlyAuditAvgPct();
	//Summary Section
	
	//progress
	populateProgressTbl();
	fillCwdTbl(result.CWDsTotal,'#totalCwdSubbie');
	fillCwdTbl(result.CWDsMonthly,'#monthlyCwdSubbie');
	sortTwoColTable('#monthlyCwdTbl');
	//ProjectKPIs
	populateRecordOfLabourTbl();
	createDaysLostTbl();
	createAccidentReportTbl();
	populateAccidentReportTbl();
	createSummaryContents();
	populateSummaryKpiTable();
	//HS
	createEnforcementActionTbl();
	createComplainceAuditTbl();
}

const populateKpiTable = ()=>{
	//Adherence to Prelim Budget
	document.querySelector('#adherencePctTarget').innerHTML = result.projectKPIs.AdherenceTgtPct!=undefined?numberformatter(result.projectKPIs.AdherenceTgtPct,'percentage'):'-';
	document.querySelector('#adherencePctActual').innerHTML = (result.projectKPIs.AdherenceActual!=undefined||result.projectKPIs.AdherenceTarget!=undefined)?
															percentageDifference(parseInt(result.projectKPIs.AdherenceActual),parseInt(result.projectKPIs.AdherenceTarget)):'-';
	calculatePercentageVariance(document.querySelector('#adherencePctActual').innerHTML,result.projectKPIs.AdherenceTgtPct, '#adherencePctVariance','negative');
	document.querySelector('#adherenceTarget').innerHTML = result.projectKPIs.AdherenceTarget!=undefined?numberformatter(result.projectKPIs.AdherenceTarget,'financial'):'-';
	document.querySelector('#adherenceActual').innerHTML = result.projectKPIs.AdherenceActual!=undefined?numberformatter(result.projectKPIs.AdherenceActual):'-';
	calculateVariance(result.projectKPIs.AdherenceActual, result.projectKPIs.AdherenceTarget, '#adherenceVariance','positive' );
	//Monthly Predictability of Cash Flow
	document.querySelector('#monthlyCashflowPctTarget').innerHTML = result.projectKPIs.MonthlyCashFlowPredTgtPct!=undefined?numberformatter(result.projectKPIs.MonthlyCashFlowPredTgtPct,'percentage'):'-';
	document.querySelector('#monthlyCashflowPctActual').innerHTML = (result.valueInformation.ValInMonthTurnover!=undefined||result.valueInformation.MonthlyForecastTurnover!=undefined)?
																percentageDifference(result.valueInformation.ValInMonthTurnover,result.valueInformation.MonthlyForecastTurnover):'-';
	calculatePercentageVariance(document.querySelector('#monthlyCashflowPctActual').innerHTML, result.projectKPIs.MonthlyCashFlowPredTgtPct, '#monthlyCashflowPctVariance','positive');															
	
	document.querySelector('#monthlyCashflowTarget').innerHTML = result.valueInformation.MonthlyForecastTurnover!=undefined?numberformatter(result.valueInformation.MonthlyForecastTurnover,'financial'):'-';//same as forecastMTurnover
	document.querySelector('#monthlyCashflowActual').innerHTML = result.valueInformation.ValInMonthTurnover!=undefined?numberformatter(result.valueInformation.ValInMonthTurnover,'financial'):'-';//same as valMTurnover
	calculateVariance(result.valueInformation.ValInMonthTurnover, result.valueInformation.MonthlyForecastTurnover, '#monthlyCashflowVariance','positive');
	//Quarterly Predictability of Cash Flow
	document.querySelector('#qtrCashflowPctTarget').innerHTML = result.projectKPIs.QtrCashFlowPredTgtPct!=undefined?numberformatter(result.projectKPIs.QtrCashFlowPredTgtPct,'percentage'):'-';
	document.querySelector('#qtrCashflowPctActual').innerHTML = (result.valueInformation.ValInQuarterTurnover!=undefined||result.valueInformation.ForecastForQuarterTurnover!=undefined)?
															percentageDifference(result.valueInformation.ValInQuarterTurnover,result.valueInformation.ForecastForQuarterTurnover):'-';
	calculatePercentageVariance(document.querySelector('#qtrCashflowPctActual').innerHTML, result.projectKPIs.QtrCashFlowPredTgtPct, '#qtrCashflowPctVariance','positive');														
	document.querySelector('#qtrCashflowTarget').innerHTML = result.valueInformation.ForecastForQuarterTurnover!=undefined?numberformatter(result.valueInformation.ForecastForQuarterTurnover,'financial'):'-';//same as forecastMTurnover
	document.querySelector('#qtrCashflowActual').innerHTML = result.valueInformation.ValInQuarterTurnover!=undefined?numberformatter(result.valueInformation.ValInQuarterTurnover,'financial'):'-';//same as valMTurnover
	calculateVariance(result.valueInformation.ValInQuarterTurnover, result.valueInformation.ForecastForQuarterTurnover, '#qtrCashflowVariance' ,'positive' );
	//Non-Recoverable Works
	document.querySelector('#nonRecWorksPctTarget').innerHTML = result.projectKPIs.NonRecWorksTgtPct!=undefined?numberformatter(result.projectKPIs.NonRecWorksTgtPct,'percentage'):'-';
	document.querySelector('#nonRecWorksPctActual').innerHTML = result.projectKPIs.NonRecWorksActPct!=undefined?numberformatter(((result.projectKPIs.NonRecWorksActPct)*100).toFixed(1),'percentage'):'-';
	calculatePercentageVariance(document.querySelector('#nonRecWorksPctActual').innerHTML, result.projectKPIs.NonRecWorksTgtPct, '#nonRecWorksPctVariance','negative');
	document.querySelector('#nonRecWorksTarget').innerHTML = numberformatter('0','financial');
	document.querySelector('#nonRecWorksActual').innerHTML = result.projectKPIs.NonRecoverableWorks!=undefined?numberformatter(result.projectKPIs.NonRecoverableWorks,'financial'):'-';
	calculateVariance(result.projectKPIs.NonRecoverableWorks, document.querySelector('#nonRecWorksTarget').innerHTML, '#nonRecWorksVariance','negative');
	
	//Predicability of Programme
	document.querySelector('#predOfProgramPctTarget').innerHTML=result.projectKPIs.predOfProgrammePctTgt!=undefined?result.projectKPIs.predOfProgrammePctTgt:'-';
	document.querySelector('#predOfProgramPctActual').innerHTML=result.projectKPIs.predOfProgrammeActTgt!=undefined?result.projectKPIs.predOfProgrammeActTgt:'-';
	document.querySelector('#predOfProgramPctVariance').innerHTML=result.projectKPIs.predOfProgrammeActTgt!=undefined?result.projectKPIs.predOfProgrammeActTgt:'-';
	document.querySelector('#predOfProgramTarget').innerHTML = numberformatter(100,'percentage');
	document.querySelector('#predOfProgramActual').innerHTML = result.projectKPIs.PredOfProgrammeAct!=undefined?numberformatter(result.projectKPIs.PredOfProgrammeAct,'percentage'):'-';
	calculatePercentageVariance(result.projectKPIs.PredOfProgrammeAct,document.querySelector('#predOfProgramTarget').innerHTML,  '#predOfProgramVariance','positive' );
	//HS Audit Score
	document.querySelector('#HSAuditPctTarget').innerHTML = result.projectKPIs.HAuditScoreTgtPct!=undefined?numberformatter(result.projectKPIs.HAuditScoreTgtPct,'percentage'):'-';
	HSMonthlyAuditAvgPct();
	calculatePercentageVariance(document.querySelector('#HSAuditPctActual').innerHTML,document.querySelector('#HSAuditPctTarget').innerHTML,'#HSAuditPctVariance','positive');
	document.querySelector('#HSAuditTarget').innerHTML =result.projectKPIs.HAuditScoreTgt!=undefined?result.projectKPIs.HAuditScoreTgt:'-';
	document.querySelector('#HSAuditActual').innerHTML =result.projectKPIs.HAuditScoreAct==undefined?result.projectKPIs.HAuditScoreAct:'-'; 
	(result.projectKPIs.HAuditScoreTgt!='-' && result.projectKPIs.HAuditScoreAct!='-')?calculatePercentageVariance(result.projectKPIs.HAuditScoreAct,result.projectKPIs.HAuditScoreTgt,'#HSAuditVariance','positive'):'-';
	//Considerate Constructor
	document.querySelector('#considerateConstructorTarget').innerHTML=35;
	considerateConstractorsAverage('#considerateConstructorActual');
	document.querySelector('#considerateConstructorPctTarget').innerHTML = findPercentage(parseFloat(document.querySelector('#considerateConstructorTarget').innerHTML),50);
	document.querySelector('#considerateConstructorPctActual').innerHTML = document.querySelector('#considerateConstructorActual').innerHTML!='-'?findPercentage(parseFloat(document.querySelector('#considerateConstructorActual').innerHTML),50):'-';
	calculatePercentageVariance(document.querySelector('#considerateConstructorPctActual').innerHTML, document.querySelector('#considerateConstructorPctTarget').innerHTML, '#considerateConstructorPctVariance','positive');
	document.querySelector('#considerateConstructorVariance').innerHTML=findConsiderateConstructorVariance();
	document.querySelector('#considerateConstructorVariance').innerHTML>"0"?document.querySelector('#considerateConstructorVariance').setAttribute('class','green-text center-align'):document.querySelector('#considerateConstructorVariance').setAttribute('class','red-text center-align')
	//HS Accident Incident Rate
	document.querySelector('#HSAccidentRatePctTarget').innerHTML = result.projectKPIs.HSAccidentIncidentRateTgtPct!=undefined?result.projectKPIs.HSAccidentIncidentRateTgtPct:'-';
	document.querySelector('#HSAccidentRatePctActual').innerHTML = result.projectKPIs.HSAccidentIncidentRateActPct!=undefined?result.projectKPIs.HSAccidentIncidentRateActPct:'-';
	document.querySelector('#HSAccidentRateTarget').innerHTML = result.projectKPIs.HSAccidentIncidentRateTgt!=undefined?result.projectKPIs.HSAccidentIncidentRateTgt:'-';
	document.querySelector('#HSAccidentRateActual').innerHTML = result.projectKPIs.HSAccidentIncidentRateAct!=undefined?result.projectKPIs.HSAccidentIncidentRateAct:'-';
	calculatePercentageVariance(document.querySelector('#HSAccidentRatePctActual').innerHTML, document.querySelector('#HSAccidentRatePctTarget').innerHTML, '#HSAccidentRatePctVariance','negative');
	(result.projectKPIs.HSAccidentIncidentRateTgt!='-' && result.projectKPIs.HSAccidentIncidentRateAct!='-')?calculatePercentageVariance(result.projectKPIs.HSAccidentIncidentRateAct,result.projectKPIs.HSAccidentIncidentRateTgt,'#HSAccidentRateVariance','positive'):'-';
	//Percentage Recycled
	document.querySelector('#pctRecycledPctTarget').innerHTML = result.projectKPIs.PctRecycledWasteTgt!=undefined?numberformatter(result.projectKPIs.PctRecycledWasteTgt,'percentage'):'-';
	document.querySelector('#pctRecycledPctActual').innerHTML = result.projectKPIs.PctRecycledWasteAct!=undefined?numberformatter(result.projectKPIs.PctRecycledWasteAct,'percentage'):'-';
	calculatePercentageVariance(result.projectKPIs.PctRecycledWasteAct,result.projectKPIs.PctRecycledWasteTgt, '#pctRecycledPctVariance','positive')
	document.querySelector('#pctRecycledTarget').innerHTML = result.projectKPIs.RecycledWasteTgt!=undefined?numberformatter(result.projectKPIs.RecycledWasteTgt,'percentage'):'-';
	document.querySelector('#pctRecycledActual').innerHTML = result.projectKPIs.RecycledWasteAct!=undefined?numberformatter(result.projectKPIs.RecycledWasteAct,'percentage'):'-';
	(result.projectKPIs.RecycledWasteTgt!='-' && result.projectKPIs.RecycledWasteAct!='-')?calculatePercentageVariance(result.projectKPIs.RecycledWasteAct,result.projectKPIs.RecycledWasteTgt,'#pctRecycledVariance','positive'):'-';

	//Waste per £100k
	document.querySelector('#waste100kPctTarget').innerHTML=result.projectKPIs.waste100kPctTgt!=undefined?result.projectKPIs.waste100kPctTgt:'-';
	document.querySelector('#waste100kPctActual').innerHTML=result.projectKPIs.waste100kPctAct!=undefined?result.projectKPIs.waste100kPctAct:'-';
	document.querySelector('#waste100kTarget').innerHTML = result.monthlyKPI[result.monthlyKPI.length-1].wst100KTgt!=undefined?result.monthlyKPI[result.monthlyKPI.length-1].wst100KTgt:'-';
	document.querySelector('#waste100kActual').innerHTML = result.monthlyKPI[result.monthlyKPI.length-1].Wstper100kM3!=undefined?result.monthlyKPI[result.monthlyKPI.length-1].Wstper100kM3:'-';
	calculatePercentageVariance(document.querySelector('#waste100kActual').innerHTML,document.querySelector('#waste100kTarget').innerHTML, '#waste100kVariance','negative');
	(document.querySelector('#waste100kPctTarget').innerHTML!='-' && document.querySelector('#waste100kPctActual').innerHTML!='-')?calculatePercentageVariance(document.querySelector('#waste100kPctActual').innerHTML,document.querySelector('#waste100kPctTarget').innerHTML,'#waste100kPctVariance','negative'):document.querySelector('#waste100kPctVariance').innerHTML='-';
	//Water m3 per £100k
	document.querySelector('#water100kPctTarget').innerHTML=result.projectKPIs.water100kPctTarget!=undefined?result.projectKPIs.water100kPctTarget:'-';
	document.querySelector('#water100kPctActual').innerHTML=result.projectKPIs.water100kPctActual!=undefined?result.projectKPIs.water100kPctActual:'-';
	(document.querySelector('#water100kPctTarget').innerHTML!='-' && document.querySelector('#water100kPctActual').innerHTML!='-')?calculatePercentageVariance(document.querySelector('#water100kPctActual').innerHTML,document.querySelector('#water100kPctTarget').innerHTML,'#water100kPctVariance','negative'):document.querySelector('#water100kPctVariance').innerHTML='-';
	document.querySelector('#water100kTarget').innerHTML = result.projectKPIs.water100kTgt!=undefined?result.projectKPIs.water100kTgt:'-';
	document.querySelector('#water100kActual').innerHTML = result.monthlyKPI[result.monthlyKPI.length-1].waterM3Per100k!=undefined?result.monthlyKPI[result.monthlyKPI.length-1].waterM3Per100k:'-';
	(document.querySelector('#water100kTarget').innerHTML!='-' && document.querySelector('#water100kActual').innerHTML!='-')?calculatePercentageVariance(document.querySelector('#water100kActual').innerHTML,document.querySelector('#water100kTarget').innerHTML,'#water100kVariance','negative'):document.querySelector('#water100kVariance').innerHTML='-';

	//Energy Kg CO2 per £100k
	document.querySelector('#energy100kPctTarget').innerHTML = result.projectKPIs.energy100kPctTarget!=undefined?result.projectKPIs.energy100kPctTarget:'-';
	document.querySelector('#energy100kTarget').innerHTML = result.projectKPIs.energy100kTarget!=undefined?result.projectKPIs.energy100kTarget:'-';
	document.querySelector('#energy100kActual').innerHTML = result.monthlyKPI[result.monthlyKPI.length-1].emitFromEnergyKgCo2Per100k!=undefined?result.monthlyKPI[result.monthlyKPI.length-1].emitFromEnergyKgCo2Per100k:'-';
	document.querySelector('#energy100kPctActual').innerHTML = (document.querySelector('#energy100kTarget').innerHTML!='-'&&document.querySelector('#energy100kActual').innerHTML!='-')?
															percentageDifference(document.querySelector('#energy100kActual').innerHTML,document.querySelector('#energy100kTarget').innerHTML):'-';
	(document.querySelector('#energy100kPctVariance').innerHTML!='-' && document.querySelector('#energy100kPctActual').innerHTML!='-')?calculatePercentageVariance(document.querySelector('#energy100kPctActual').innerHTML,document.querySelector('#energy100kPctTarget').innerHTML,'#energy100kPctVariance','negative'):document.querySelector('#energy100kPctVariance').innerHTML='-';
	(document.querySelector('#energy100kVariance').innerHTML!='-' && document.querySelector('#energy100kActual').innerHTML!='-')?calculatePercentageVariance(document.querySelector('#energy100kActual').innerHTML,document.querySelector('#energy100kTarget').innerHTML,'#energy100kVariance','negative'):document.querySelector('#energy100kVariance').innerHTML='-';
}

const populateSummaryKpiTable = ()=>{
	//Adherence to Prelim Budget
	document.querySelector('#adherence_Tgt').innerHTML = document.querySelector('#adherencePctTarget').innerHTML;
	document.querySelector('#adherence_Act').innerHTML = document.querySelector('#adherencePctActual').innerHTML;
	document.querySelector('#adherence_Var').innerHTML = document.querySelector('#adherencePctVariance').innerHTML
	lessThanZero('#adherence_Var');
	//document.querySelector().innerHTML = ;
	//Monthly Predictability of Cash Flow
	document.querySelector('#monthlyCashflow_Tgt').innerHTML = document.querySelector('#monthlyCashflowPctTarget').innerHTML; 
	document.querySelector('#monthlyCashflow_Act').innerHTML = document.querySelector('#monthlyCashflowPctActual').innerHTML;
	document.querySelector('#monthlyCashflow_Var').innerHTML = document.querySelector('#monthlyCashflowPctVariance').innerHTML;
	moreThanZero('#monthlyCashflow_Var');
	//Quarterly Predictability of Cash Flow
	document.querySelector('#qtrCashflow_Tgt').innerHTML = document.querySelector('#qtrCashflowPctTarget').innerHTML;
	document.querySelector('#qtrCashflow_Act').innerHTML = document.querySelector('#qtrCashflowPctActual' ).innerHTML;
	document.querySelector('#qtrCashflow_Var').innerHTML = document.querySelector('#qtrCashflowPctVariance').innerHTML
	moreThanZero('#qtrCashflow_Var');
	//Non-Recoverable Works
	document.querySelector('#nonRecWorks_Tgt').innerHTML = document.querySelector('#nonRecWorksPctTarget').innerHTML;
	document.querySelector('#nonRecWorks_Act').innerHTML = document.querySelector('#nonRecWorksPctActual').innerHTML;
	document.querySelector('#nonRecWorks_Var').innerHTML = document.querySelector('#nonRecWorksPctVariance').innerHTML,
	lessThanZero('#nonRecWorks_Var');
	//Predicability of Programme
	document.querySelector('#predOfProgram_Tgt').innerHTML = document.querySelector('#predOfProgramTarget').innerHTML;
	document.querySelector('#predOfProgram_Act').innerHTML = document.querySelector('#predOfProgramActual').innerHTML;
	document.querySelector('#predOfProgram_Var').innerHTML = document.querySelector('#predOfProgramVariance').innerHTML,
	moreThanZero('#predOfProgram_Var');
	//HS Audit Score
	document.querySelector('#HSAudit_Tgt').innerHTML = document.querySelector('#HSAuditPctTarget').innerHTML;
	document.querySelector('#HSAudit_Act').innerHTML = document.querySelector('#HSAuditPctActual').innerHTML;
	document.querySelector('#HSAudit_Var').innerHTML = document.querySelector('#HSAuditPctVariance').innerHTML;
	moreThanZero('#HSAudit_Var');
	//Considerate Constructor
	document.querySelector('#considerateConstructor_Tgt').innerHTML = document.querySelector('#considerateConstructorTarget').innerHTML;
	document.querySelector('#considerateConstructor_Act').innerHTML = document.querySelector('#considerateConstructorActual').innerHTML;
	document.querySelector('#considerateConstructor_Var').innerHTML = document.querySelector('#considerateConstructorPctVariance').innerHTML;
	moreThanZero('#considerateConstructor_Var')
	//HS Accident Incident Rate
	document.querySelector('#HSAccidentRate_Tgt').innerHTML = document.querySelector('#HSAccidentRatePctTarget').innerHTML;
	document.querySelector('#HSAccidentRate_Act').innerHTML = document.querySelector('#HSAccidentRatePctActual').innerHTML;
	document.querySelector('#HSAccidentRate_Var').innerHTML = document.querySelector('#HSAccidentRatePctVariance').innerHTML;
	lessThanZero('#HSAccidentRate_Var');
	//Monthly Usage Water
	document.querySelector('#water100k_Tgt').innerHTML = document.querySelector('#pctRecycledPctTarget').innerHTML;
	document.querySelector('#water100k_Act').innerHTML = document.querySelector('#pctRecycledPctActual').innerHTML;
	document.querySelector('#water100k_Var').innerHTML = document.querySelector('#pctRecycledPctVariance').innerHTML;
	moreThanZero('#water100k_Var')
	//Monthly Usage Energy
	document.querySelector('#energy100k_Tgt').innerHTML = document.querySelector('#energy100kTarget').innerHTML;
	document.querySelector('#energy100k_Act').innerHTML = document.querySelector('#energy100kActual').innerHTML;
	moreThanZero('#energy100k_Var')
	//Monthly Waste Skip
	document.querySelector('#pctSkipWaste_Tgt').innerHTML = document.querySelector('#pctRecycledPctTarget').innerHTML;
	document.querySelector('#pctSkipWaste_Act').innerHTML = document.querySelector('#pctRecycledPctActual').innerHTML;
	document.querySelector('#pctSkipWaste_Var').innerHTML = document.querySelector('#pctRecycledPctVariance').innerHTML;
	moreThanZero('#pctSkipWaste_Var');
	//Monthly Waste per 100k
	document.querySelector('#waste100k_Tgt').innerHTML = document.querySelector('#waste100kTarget').innerHTML;
	document.querySelector('#waste100k_Act').innerHTML = document.querySelector('#waste100kActual').innerHTML;
	document.querySelector('#waste100k_Var').innerHTML = document.querySelector('#waste100kVariance').innerHTML;
	moreThanZero('#waste100k_Var');
}

const populateProgressTbl = ()=>{
	const progressInfo = result.progress;
	let index=1;
	for(var key in progressInfo){
		if(key!='ContractNumber'){
			for(let i=0;i<2;i++){
				const fieldID=(i==0)?'#'+key:'#'+key+'Value';
				const fieldValue = (i==0)?key:result.progress[key];
				document.querySelector(fieldID).innerHTML = fieldValue;
				if(i==1){moreThanZero(fieldID)};
			}
			index++;
		}
	}
}


//calculation functions
const calculateVariance = (fig1, fig2, targetField,targetResult)=>{
	const difference = (parseFloat(fig1.replace(/[,£]/g,'')) - parseFloat(fig2.replace(/[,£]/g,''))).toFixed(0);
	const numericVariance =numberformatter(difference,'financial');
	document.querySelector(targetField).innerHTML = numericVariance
	targetResult=='positive'?moreThanZero(targetField):lessThanZero(targetField);
}

const calculatePercentageVariance = (fig1, fig2, targetField, targetResult)=>{
	const actualPercentage  = parseFloat(fig1);
	const targetPercentage = parseFloat(fig2);
	if(isNaN(actualPercentage)||isNaN(targetPercentage)){
		document.querySelector(targetField).innerHTML='-';
	}else{
		const difference = actualPercentage-targetPercentage;
		const variance = ((difference/targetPercentage)*100).toFixed(1);
		const numericVariance = numberformatter(variance,'percentage');
		document.querySelector(targetField).innerHTML = numericVariance;
		targetResult=='positive'?moreThanZero(targetField):lessThanZero(targetField);
	}
}

const percentageDifference = (actualFig, targetFig)=>{
	const actualDifference = numberformatter(((Number(actualFig)/Number(targetFig))*100).toFixed(0),'percentage');
	return actualDifference; 
}

//summary section - structure

const createSummarySections = ()=>{
	createTopSummaryRow('#summary-page');
	createMiddleSummaryRow('#summary-page');
	createBottomSummaryRow('#summary-page');
}

const createTopSummaryRow = location=>{
	const rowLocation = document.querySelector(location);
	const rowContents = createDiv('topRow', 'row');
	const summaryProgress = createGraphCard('col s12 l6', 'summaryProgress', 'summaryProgressContnet', 'Progress');
	rowContents.appendChild(summaryProgress);
	const leftDiv= createMultiDataCard('col s12 l6', 'financial', 2, 'Financial', ['Value Information','Summary of Overhead Contribution']);
	rowContents.appendChild(leftDiv);

	rowLocation.appendChild(rowContents);
}

const createMiddleSummaryRow = location=>{
	const rowLocation = document.querySelector(location);
	const rowContents = createDiv('middleRow','row');
	const hsGraph = createGraphCard('col s12 l6', 'hsGraph', 'hsGraphSection', 'Health and Safety');
	rowContents.appendChild(hsGraph);
	const projectKpiTable = createDataCard('col s12 l6', 'summaryProjectKpi', 'summaryProjectKpi', 'Project KPIs');
	rowContents.appendChild(projectKpiTable);
	rowLocation.appendChild(rowContents);
}

const createBottomSummaryRow = location=>{
	const rowLocation = document.querySelector(location);
	const rowContents = createDiv('bottomRow','row');
	const timeValueData = createDataCard('col s12 l6', 'completionDate', 'completionTable', 'CompletionDates');
	rowContents.appendChild(timeValueData);
	const timeGraph = createGraphCard('col s6', 'timeGraph', 'timeGraphSection', 'Time');
	rowContents.appendChild(timeGraph);
	const valueGraph = createGraphCard('col s6', 'valueGraph', 'valueeGraphSection', 'Value');
	rowContents.appendChild(valueGraph);
	rowLocation.appendChild(rowContents);
}

//summary section - create tables

const createValuationInfoTbl = ()=>{
	const tableLocation = document.querySelector('#ValueInformationTbl')
	const valInfoTable = document.createElement('table');
	valInfoTable.setAttribute('class','striped')

	const tableHeader = document.createElement('thead');
	const HeaderRow = document.createElement('tr');
	for(let i=0;i<3;i++){
		const rowCell = document.createElement('th');
		rowCell.setAttribute('class','center-align');
		const rowCellText=(i==1)?document.createTextNode('Turnover'):document.createTextNode('Margin');
		if(i>0){
			rowCell.appendChild(rowCellText);
		}
		HeaderRow.appendChild(rowCell);
	}
	tableHeader.appendChild(HeaderRow);
	valInfoTable.appendChild(tableHeader);
	const valInfoRowIds=['val','monthlyVal','monthlyForecast','monthlyVariance','qtrValue','qtrForecast','qtrVariance'];
	const valInfoRows=['Valuation to Date','Value in Month', 'Forecast for Month', 'Variance','Value in Quarter','Forecast for Quarter','Variance'];
	const tableBody = document.createElement('tbody');
	for(let i=0; i<valInfoRows.length;i++){
		const bodyRow = document.createElement('tr');
		for(let j=0;j<3;j++){
			const bodyCell=(j==0)?document.createElement('th'):document.createElement('td');
			switch(j){
				case 0:
					const bodyCellText = document.createTextNode(valInfoRows[i]);
					bodyCell.appendChild(bodyCellText);
					break;
				case 1:
				case 2:
					const fieldID=(j==1)?valInfoRowIds[i]+'Turnover':valInfoRowIds[i]+'Margin';
					bodyCell.setAttribute('class','center-align');
					bodyCell.setAttribute('type','text');
					bodyCell.setAttribute('id',fieldID); 
					bodyCell.setAttribute('name',fieldID);
					break;
			}
			bodyRow.appendChild(bodyCell);
		}
		tableBody.appendChild(bodyRow)
	}
	valInfoTable.appendChild(tableBody);
	tableLocation.appendChild(valInfoTable);
}

const createOverheardContributionTbl = ()=>{
	const overheadContributionTblLoc = document.querySelector('#SummaryofOverheadContributionTbl');
	const overheadContributionTbl = document.createElement('table');
	overheadContributionTbl.setAttribute('class','striped responsive');
	const tblHeader = document.createElement('thead');
	const tblHeaderRow = document.createElement('tr');
	const tblRows=["SubContractors", "Materials", "Consultants", "Stats", "Preliminaries", "Others", "OHP", "Total"];
	for(let i = 0;i<3;i++){
		const tblHeaderRowCell = document.createElement('th');
		tblHeaderRowCell.setAttribute('class','center-align');
		const tblHeaderRowCellText=(i==1)?document.createTextNode('Gross'):document.createTextNode('Movement');
		if(i>0){tblHeaderRowCell.appendChild(tblHeaderRowCellText)};
		tblHeaderRow.appendChild(tblHeaderRowCell);
	}
	tblHeader.appendChild(tblHeaderRow)
	overheadContributionTbl.appendChild(tblHeader);
	const tblBody = document.createElement('tbody');
	const rowNum = tblRows.length;
	for (let i=0; i<rowNum; i++){
		const tblBodyRow = document.createElement('tr');
		for(let k=0; k<rowNum; k++){
			const tblBodyRowCell =(k==0)?document.createElement('th'):document.createElement('td');
			switch(k){
				case 0:
					const tblBodyRowCellText = document.createTextNode(tblRows[i]);
					tblBodyRowCell.appendChild(tblBodyRowCellText);
					tblBodyRow.appendChild(tblBodyRowCell);
					break;
				case 1:
				case 2:
					const fieldID=(k==1)?tblRows[i].toLowerCase()+'Gross':tblRows[i].toLowerCase()+'Movement';
					tblBodyRowCell.setAttribute('class','center-align');
					tblBodyRowCell.setAttribute('id',fieldID);
					tblBodyRowCell.setAttribute('name',fieldID);
					tblBodyRow.appendChild(tblBodyRowCell);
					break;
			}
		}
		tblBody.appendChild(tblBodyRow);
	}	
	overheadContributionTbl.appendChild(tblBody);
	overheadContributionTblLoc.appendChild(overheadContributionTbl);
}

const createProjectKPITbl = ()=>{
	const projectKpiTblLoc = document.querySelector('#summaryProjectKpi');
	const projectKpiTbl = document.createElement('table');
	projectKpiTbl.setAttribute('class','striped');
	const projectKpiHeader = document.createElement('thead');
	const projectKpiHeaderNames = ["","","Target","Acutal","Variance",];
	const kpiHeaderRow = document.createElement('tr');
	for(let i=0;i<5;i++){
		const projectKpiHeaderCell = document.createElement("th");
		if(i>0){
			const projectKpiHeaderText = document.createTextNode(projectKpiHeaderNames[i]);
			projectKpiHeaderCell.appendChild(projectKpiHeaderText);
		}
		kpiHeaderRow.appendChild(projectKpiHeaderCell);
		projectKpiHeader.appendChild(kpiHeaderRow);
	}
	projectKpiTbl.appendChild(projectKpiHeader);
	const projectKpiBody = document.createElement('tbody')
	const projectKpiTblRows=["Adherence to Prelim Budget", "Predictability to Cash Flow (month)", "Predictability to Cash Flow (Qtr)", "Non Recoverable Works", "Predictability of Programme", "H&S Audit Score", "H&S Accident Incident Rate", "Considerate Constructor Score", "Monthly Usage",  "Energy kgCO2 per 100k", "Monthly Waste", "Waste per £100k Turnover"];
	
	const projectKpiTblRowId=["adherence","monthlyCashflow","qtrCashflow","nonRecWorks","predOfProgram","HSAudit","HSAccidentRate","considerateConstructor",	"water100k","energy100k","pctSkipWaste","waste100k"];
	for (let j=0; j<projectKpiTblRows.length; j++){
		let fieldId;
		const projectKpiBodyRow = document.createElement("tr");
		const cellCount=(j==8 ||j==10)?5:4;
		if(cellCount==4){
			for(let k=0; k<cellCount;k++){
				const projectKpiCellBody = document.createElement("td")
				fieldId = (k==0)?projectKpiTblRowId[j]+'_Ttl':
						(k==1)?projectKpiTblRowId[j]+'_Tgt':
						(k==2)?projectKpiTblRowId[j]+'_Act':
						projectKpiTblRowId[j]+'_Var';
				projectKpiCellBody.setAttribute('id', fieldId);
				if(k==0){
					if(j<=7){projectKpiCellBody.setAttribute('colspan','2')};
					projectKpiCellBody.innerHTML = projectKpiTblRows[j];
				}

				projectKpiBodyRow.appendChild(projectKpiCellBody);
			}
		}else{
			for(let m=0; m<cellCount;m++){
				const projectKpiCellBody = document.createElement("td")
				fieldId = (m==2)?projectKpiTblRowId[j]+'_Tgt':
						(m==3)?projectKpiTblRowId[j]+'_Act':
						projectKpiTblRowId[j]+'_Var';
				switch(m){
					case 0:
						projectKpiCellBody.setAttribute('rowspan','2');
						projectKpiCellBody.innerHTML = projectKpiTblRows[j];
						break;
					case 1:
						if(j==8 && m==1){
							projectKpiCellBody.innerHTML = "Water m3 per £100k";
						}else if(j==10 && m==1){
							projectKpiCellBody.innerHTML = "Percentage Skip Waste Recycled";
						}
						break;
					case 2:
					case 3:
					case 4:
						projectKpiCellBody.setAttribute('id', fieldId);
						break;
				}
				projectKpiBodyRow.appendChild(projectKpiCellBody);
			}
		}
		projectKpiBody.appendChild(projectKpiBodyRow);
	}
	projectKpiTbl.appendChild(projectKpiBody);
	projectKpiTblLoc.appendChild(projectKpiTbl);
}

const createCompletionDatesTbl = ()=>{
	const tableLocation = document.querySelector('#completionTable');
	const completionDateTbl = document.createElement('table');
	completionDateTbl.setAttribute('class','striped');
	const tableBody = document.createElement('tbody');
	for(let i=0; j<2; j++){
		const bodyRow = document.createElement('tr');
		const row= (i==0)?'Contractual End Date':'Estimate End Date';
		const rowID = row.charAt(0).toLowerCase() + row.substr(1).replace(/\s/g, '');
		for(let j=0;j<2;j++){
			let bodyCell;
			if(j==0){
				bodyCell = document.createElement('td');
				const bodyCellText = document.createTextNode(row);
				bodyCell.appendChild(bodyCellText);
			}else{
				bodyCell = document.createElement('td');
				bodyCell.setAttribute('class','center-align');
				bodyCell.setAttribute('id',rowID);
				bodyCell.setAttribute('name', rowID);
			}
			bodyRow.appendChild(bodyCell)
		}
		tableBody.appendChild(bodyRow);
	}
	completionDateTbl.appendChild(tableBody);
	tableLocation.appendChild(completionDateTbl);
	document.querySelector('#contractualEndDate').innerHTML = result.timeValue.ConCompDate;
	document.querySelector('#estimateEndDate').innerHTML = result.timeValue.EstCompDate;
}

//summary section - fill tables
const populateValuationInfoTbl = ()=>{
	document.querySelector('#valTurnover').innerHTML = numberformatter(result.valueInformation.ValtoDateTurnover,'financial');
	document.querySelector('#valMargin').innerHTML = numberformatter(result.valueInformation.ValtoDateMargin,'financial');
	document.querySelector('#monthlyValTurnover').innerHTML = numberformatter(result.valueInformation.ValInMonthTurnover,'financial');
	document.querySelector('#monthlyValMargin').innerHTML = numberformatter(result.valueInformation.ValInMonthMargin,'financial');
	document.querySelector('#monthlyForecastTurnover').innerHTML = numberformatter(result.valueInformation.MonthlyForecastTurnover,'financial');
	document.querySelector('#monthlyForecastMargin').innerHTML = numberformatter(result.valueInformation.MonthlyForecastMargin,'financial');
	calculateVariance(result.valueInformation.ValInMonthTurnover, result.valueInformation.MonthlyForecastTurnover , '#monthlyVarianceTurnover','positive');
	calculateVariance(result.valueInformation.ValInMonthMargin, result.valueInformation.MonthlyForecastMargin, '#monthlyVarianceMargin','positive');
	document.querySelector('#qtrValueTurnover').innerHTML = numberformatter(result.valueInformation.ValInQuarterTurnover,'financial');
	document.querySelector('#qtrValueMargin').innerHTML = numberformatter(result.valueInformation.ValInQuarterMargin,'financial');
	document.querySelector('#qtrForecastTurnover').innerHTML = numberformatter(result.valueInformation.ForecastForQuarterTurnover,'financial');
	document.querySelector('#qtrForecastMargin').innerHTML = numberformatter(result.valueInformation.ForecastForQuarterMargin,'financial');
	calculateVariance(result.valueInformation.ValInQuarterTurnover, result.valueInformation.ForecastForQuarterTurnover, '#qtrVarianceTurnover','positive');
	calculateVariance(result.valueInformation.ValInQuarterMargin, result.valueInformation.ForecastForQuarterMargin, '#qtrVarianceMargin','positive');
	document.querySelector('#weeksCompleted').innerHTML = weeksCompleted;
	document.querySelector('#weeksContracted').innerHTML = result.timeValue.WeeksContracted;
	document.querySelector('#timeCompleted').innerHTML = result.timeValue.TimeCompleted;
	document.querySelector('#timeRemaining').innerHTML = result.timeValue.TimeRemaining;
	document.querySelector('#valueCompleted').innerHTML = result.timeValue.ValueCompleted;
	document.querySelector('#valueRemaining').innerHTML = result.timeValue.ValueRemaining;
}

const populateOverheadContributionTbl = ()=>{
	const tblRows=['SubContractors', 'Materials', 'Consultants', 'Stats', 'Preliminaries', 'Others', 'OHP', 'Total'];
	const rowNum = tblRows.length;
	const overheadData = result.overheadContribution;
	for(let i=0; i<8; i++){
		for(let j=0;j<2;j++){
			const dataRef=(j==0)?'Gross'+ tblRows[i]:'Movement'+ tblRows[i];
			const fieldID=(j==0)?'#'+tblRows[i].toLowerCase()+'Gross':'#'+tblRows[i].toLowerCase()+'Movement';
			if(dataRef.includes('Total')){
				document.querySelector(fieldID).innerHTML = numberformatter(overheadData[dataRef],'financial');
				moreThanZero(fieldID);
			}else{
				document.querySelector(fieldID).innerHTML= numberformatter(overheadData[dataRef],'financial');
			}
		}
	}
}

//Progress Graphs Section - Structure
const createProgressGraphs = ()=>{
	createProgressGraphTop('#progressGraphs');
	createProgressGraphBottom('#progressGraphs')
}

const createProgressGraphTop = location=>{
	const sectionLocation = document.querySelector(location);
	const ProgressGraphSection = createDiv('progressGraphRow','row');
	const monthlyProgress = createGraphCard('col s12', 'monthProgressSection', 'monthProgressContent', 'Monthly Progress');
	ProgressGraphSection.appendChild(monthlyProgress);
	sectionLocation.appendChild(ProgressGraphSection);
}

const createProgressGraphBottom = location=>{
	const sectionLocation = document.querySelector(location);
	const ProgressGraphSection = createDiv('progressGraphRow','row');
	const weekRecOfLbrGraph = createGraphCard('col s12 l6', 'weeklyRecOfLbrGraphSection', 'weeklyRecOfLbrGraphContent', 'Record Of Labour for Most Recent Week');
	ProgressGraphSection.appendChild(weekRecOfLbrGraph);
	const recOfLbrGraph = createGraphCard('col s12 l6', 'recOfLbrGraphSection', 'recOfLbrGraphContent', 'Record Of Labour Throughout Contract');
	ProgressGraphSection.appendChild(recOfLbrGraph);
	sectionLocation.appendChild(ProgressGraphSection);
}


//Progress Graphs Section
const progressGraph = chartLocation=>{
	const progressData = result.progress;
	delete progressData.ContractNumber;
	let graphData=[];
	for(var prop in progressData){
		const progressDate = getProgressDate(prop);
		graphData.push({y:progressDate, a:progressData[prop]});
	}
	Morris.Area({
		element: chartLocation,
		data: graphData,
		xkey: 'y',
		xLabelAngle: 45,
		ykeys: ['a'],
		labels: ['Weeks Ahead/Behind'],
		fillOpacity: 0.5,
		resize:true
	});
}

const getProgressDate = progressDate=>{
	const progressMonth = progressDate.slice(0,3);
	let progressMonthNumber; 
	switch(progressMonth){
		case 'Jan':
			progressMonthNumber='01'
			break;
		case 'Feb':
			progressMonthNumber='02'
			break;
		case 'Mar':
			progressMonthNumber='03'
			break;
		case 'Apr':
			progressMonthNumber='04'
			break;
		case 'May':
			progressMonthNumber='05'
			break;
		case 'Jun':
			progressMonthNumber='06'
			break;
		case 'Jul':
			progressMonthNumber='07'
			break;
		case 'Aug':
			progressMonthNumber='08'
			break;
		case 'Sep':
			progressMonthNumber='09'
			break;
		case 'Oct':
			progressMonthNumber='10'
			break;
		case 'Nov':
			progressMonthNumber='11'
			break;
		case 'Dec':
			progressMonthNumber='12'
			break;
	}
	const formattedDate = '20'+progressDate.slice(3,5)+'-'+progressMonthNumber;
	return formattedDate;
}

const getRecordOfLbrFigures = ()=>{
	const recOfLbrTbl = document.querySelector("#recOfLbr");
	const rowNums = document.querySelector("#recOfLbr").rows.length-2;
	const cellNum = recOfLbrTbl.rows[rowNums].cells.length;
	let recordOfLabourFigures = [];
	for(let i=0;i<cellNum;i++){
		if(i!=0&&i!=8){
			const weekDay = getRecordOfLabourDay(i);
			console.log('#week'+(rowNums)+weekDay);
			recordOfLabourFigures.push(document.querySelector('#week'+(rowNums)+weekDay).innerHTML);
		}
	}
	return recordOfLabourFigures;
}

const getRecordOfLbrTotals = ()=>{
	const recOfLbrTbl = document.querySelector("#recOfLbr");
	const rowNums = document.querySelector("#recOfLbr").rows.length-1;
	const cellNum = recOfLbrTbl.rows[rowNums].cells.length;
	let recordOfLabourTotals = [];
	for(let i=0;i<rowNums;i++){
		if(i>1){
			const fieldID = '#week'+result.NewRecordOfLabour[i].WeekNum+'Total';
			recordOfLabourTotals.push(parseInt(document.querySelector(fieldID).innerHTML));
		}
	}
	return recordOfLabourTotals;
}

const recordOfLabourTotalsGraph = location=>{
	const overallRecordOfLabourData = getRecordOfLbrTotals();
	let recOfLbrTtlGraphData =[]
	let weekNumber = result.NewRecordOfLabour[0].WeekNum;
	for(var prop in overallRecordOfLabourData){
		console.log('Week '+weekNumber+ ', y:'+ overallRecordOfLabourData[prop]);
		recOfLbrTtlGraphData.push({x: 'Week '+weekNumber, y: overallRecordOfLabourData[prop]});
		weekNumber++;
	}
	Morris.Area({
		element: location,
		data: recOfLbrTtlGraphData,
		xkey: 'x',
		ykeys: ['y'],
		labels: ['Number of People On Site'],
		xLabelAngle: 45,
		fillOpacity: 0.5,
		behaveLikeLine:true,
		parseTime: false,
		resize:true
	});
}

const currentWeekRecordOfLabourGraph = location=>{
	const recordOfLabourData = getRecordOfLbrFigures();
	const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
	let recOfLbrGraphData =[]
	let dayIndex = 0;
	for(var prop in recordOfLabourData){
		recOfLbrGraphData.push({x: days[dayIndex], y: recordOfLabourData[prop]});
		dayIndex++;
	}
	Morris.Area({
		element: location,
		data: recOfLbrGraphData,
		xkey: 'x',
		ykeys: ['y'],
		labels: ['Number of People On Site'],
		fillOpacity: 0.5,
		behaveLikeLine:true,
		parseTime: false,
		resize:true
	});
}

//Financial Graph Section -structure
const createFinancialGraphs = ()=>{
	createFinancialGraphTop('#financialGraph');
	createFinancialGraphBottom('#financialGraph')
}

const createFinancialGraphTop = location=>{
	const sectionLocation = document.querySelector(location);
	const topFinGraphs = createDiv('finGraphsTop','row');
	const predictabilityGraph= createGraphCard('col s12 l6', 'predictabilitySection', 'predictabilityContent', 'Predictability (Turnover)');
	topFinGraphs.appendChild(predictabilityGraph);
	const cwdGraph = createGraphCard('col s12 l6', 'cwdGraphSection', 'cwdGraphContent', 'Contractors Written Direction Total To Date');
	topFinGraphs.appendChild(cwdGraph);
	sectionLocation.appendChild(topFinGraphs);
}

const createFinancialGraphBottom = location=>{
	const sectionLocation = document.querySelector(location);
	const bottomFinGraphs = createDiv('finGraphBottom','row');
	const costflowGraph = createGraphCard('col s12 l6', 'costflowGraphSection', 'costflowGraphContent', 'Costflow');
	bottomFinGraphs.appendChild(costflowGraph);
	const monthlyCwds = createGraphCard('col s12 l6', 'monthlyCwdGraphSection', 'monthlyCwdGraphContent', 'Contractors Written Direction in Month');
	bottomFinGraphs.appendChild(monthlyCwds);
	sectionLocation.appendChild(bottomFinGraphs);
}

//Financial Graph Section - Graphs
const createTurnoverGraph = location=>{
	const turnoverData = result.financialData;
	let turnoverGraphData=[];
	let lengthValue = 0;
	let propertyKeys=[];
	for(var i=0;i<turnoverData.length;i++){
		delete turnoverData[i].ContractNumber;
		delete turnoverData[i].Column;
	}
	for(var prop in turnoverData){
		const tempValue = Object.keys(turnoverData[prop]).length;
		if(parseInt(prop)>0){
			if(tempValue<lengthValue){
				lengthValue=tempValue;
				propertyKeys=Object.keys(turnoverData[prop]);
			};
		}else{
			lengthValue=tempValue;
		}
	}
	for(let j=0;j<lengthValue;j++){
		turnoverGraphData.push({x:getProgressDate(propertyKeys[j]),val1:turnoverData[0][propertyKeys[j]],val2:turnoverData[1][propertyKeys[j]],val3:turnoverData[2][propertyKeys[j]]});
	}
	Morris.Area({
		element: location,
		data: turnoverGraphData,
		xkey: 'x',
		xLabelAngle: 45,
		ykeys: ['val1','val2','val3'],
		labels: ['Current Cum T.O','ActualCum T.O','Original Cum T.O'],
		fillOpacity: 0.0,
		behaveLikeLine: true,
		resize:true
	});
	return turnoverData;
}

const costflowGraph = location=>{
	const costFlowData = tableToArray(document.querySelector('#costflowTbl'));
	const lengthValue = 0;
	let costFlowGraphData=[];
	let propertyKeys=[];
	for(var a in costFlowData){
		const costFlowDate = getProgressDate(costFlowData[a][0]);
		const cumCertified = numberUnformatter(costFlowData[a][1],'financial');
		const currentCum = numberUnformatter(costFlowData[a][2],'financial');
		const actualCum = numberUnformatter(costFlowData[a][3],'financial');
		costFlowGraphData.push({x:costFlowDate,val1:cumCertified,val2:currentCum,val3:actualCum});
	}
	Morris.Area({
		element: location,
		data: costFlowGraphData,
		xkey: 'x',
		xLabelAngle: 45,
		ykeys: ['val1','val2','val3'],
		labels: ['Cum Certified Cash','Current Cum T.O','Actual Cum T.O'],
		fillOpacity: 0.0,
		behaveLikeLine: true
	});

	return lengthValue;
}

const totalCwdToDate = location=>{
	const totalCwdData = CwdTableToArray(document.querySelector('#totalCwdTbl'));
	let totalCwdGraphData = [];
	for(var subbie in totalCwdData){
		totalCwdGraphData.push({subContractor:totalCwdData[subbie][0],number:totalCwdData[subbie][1]});
	}

	Morris.Bar({
		element: location,
		data: totalCwdGraphData,
		xkey: 'subContractor',
		ykeys: ['number'],
		labels: ['Number of Issued CWDs'],
		xLabelAngle:35,
		resize:true
	});
	return totalCwdData;
}

const monthlyCwdToDate = location=>{
	const monthlyCwdData = CwdTableToArray(document.querySelector('#monthlyCwdTbl'));
	let monthlyCwdGraphData = [];
	for(var subbie in monthlyCwdData){
		monthlyCwdGraphData.push({value:monthlyCwdData[subbie][1], label:monthlyCwdData[subbie][0]});
	}
	Morris.Donut({
	  element: location,
	  data: monthlyCwdGraphData,
	  resize:true
	});
}

//CCS & Costs Graph Section - Structure
const createCcsGraphs = ()=>{
	createCcsGraphTop('#ccsCosts');
	createCssGraphBottom('#ccsCosts')
}

const createCcsGraphTop = location=>{
	const sectionLocation = document.querySelector(location);
	const ccsTopGraphSection = createDiv('ccsTopRow','row');
	const considerateConstructorsGraph = createGraphCard('col s12', 'consConstructorsGraphSection', 'consConstructorsGraphContent', 'Considerate Constructors');
	ccsTopGraphSection.appendChild(considerateConstructorsGraph);
	sectionLocation.appendChild(ccsTopGraphSection);
}

const createCssGraphBottom = location=>{
	const sectionLocation = document.querySelector(location);
	const ccsBottomGraphSection = createDiv('progressGraphRow','row');
	const matsSummaryGraph = createGraphCard('col s12 l6', 'matsSummaryGraphSection', 'matsSummaryGraphContent', 'Summary Of Materials Ordered');
	ccsBottomGraphSection.appendChild(matsSummaryGraph);
	const matsReplacementGraph = createGraphCard('col s12 l6', 'matsReplacementGraphSection', 'matsReplacementContent', 'Reasons for Replacement');
	ccsBottomGraphSection.appendChild(matsReplacementGraph);
	sectionLocation.appendChild(ccsBottomGraphSection);
}

//CCS & Costs Graphs Section - Graphs
const copyConsiderateContractorTbl =()=>{
	const considerateContractorTbl = document.querySelector("#considerContractorTbl");
	const clone = considerateContractorTbl.cloneNode(true);
	clone.id="ccsContractorTbl"
	document.querySelector("#consConstructorsGraphSectionGraph").appendChild(clone);
}

const considerateContractorsGraph = location=>{
	const considerateContractorsData = tableToArray(document.querySelector('#considerContractorTbl'));
	let contractorGraphData=[]
	for(var prop in considerateContractorsData){
		contractorGraphData.push({x:considerateContractorsData[prop][0], y:considerateContractorsData[prop][1],z:35})
	}
	Morris.Area({
		element: location,
		data: contractorGraphData,
		xkey: 'x',
		ykeys: ['y','z'],
		labels: ['Score','Benchmark'],
		fillOpacity: 0.5,
		behaveLikeLine:true,
		parseTime: false,
		resize:true
	});
}

const materialsOrderedChart = location=>{
	Morris.Donut({
	  element: location,
	  data: [
	    {label: 'Part Site', value: document.querySelector('#partSiteValue').innerHTML},
	    {label: 'Whole Site', value: document.querySelector('#wholeSiteValue').innerHTML},
	    {label: 'Replacement', value: document.querySelector('#replacementValue').innerHTML}
	  ],
	  resize:true,
	  colors:['#B20000','#57C61C','#FFC300']
	});
}

const materialsReasonChart = location=>{
	Morris.Donut({
	  element: location,
	  data: [
	    {label: 'Client Change', value: document.querySelector('#clientChangeValue').innerHTML},
	    {label: 'Theft', value: document.querySelector('#theftValue').innerHTML},
	    {label: 'Waste', value: document.querySelector('#wasteValue').innerHTML},
	    {label: 'Damage', value: document.querySelector('#damageValue').innerHTML}
	  ],
	  resize:true,
	  colors:['#B20000','#57C61C','#3232ad','#FFC300']
	});
}

//Sub-Contractor Finance Graph Section - Structure
const createSubConFinGraphs = location=>{
	const sectionLocation = document.querySelector(location);
	const subConFinGraphSection = createDiv('subConFinRow','row');
	const subConFinGraph = createGraphCard('col s12', 'subConFinGraphSection', 'subConFinGraphContent', 'Subcontractors Orders and Variations');
	subConFinGraphSection.appendChild(subConFinGraph);
	sectionLocation.appendChild(subConFinGraphSection);
}

//Sub-Contractor Finance Graph Section - Graphs
const subContractorOrderVariations = location=>{
	const subbieData = result.SubConFinData.length;
	let subbieGraphData=[];
	for(let i=0;i<subbieData;i++){
		subbieGraphData.push({subContractor:result.SubConFinData[i].SubContractorName,NettOrderValue: result.SubConFinData[i].SubContractNettOrderValue,recoverableVar: result.SubConFinData[i].RecoverableVariations,site: result.SubConFinData[i].Site,package: result.SubConFinData[i].Package,designDevelopment:result.SubConFinData[i].DesignDevelopment});
	}
	Morris.Bar({
		element: location,
		data: subbieGraphData,
		xkey: 'subContractor',
		ykeys: ['NettOrderValue','recoverableVar','site','package','designDevelopment'],
		labels: ['Sub-Contract Nett Order Value', 'Recoverable Variations','Site','Package','Design Development'],
		xLabelAngle:35,
		stacked:true,
		resize:true
	});
}

//HS Graph Section - Structure
const createHSGraphSection = ()=>{
	createHSGraphTopSection('#hsGraphs');
	createHSGraphBottomSection('#hsGraphs');
}

const createHSGraphTopSection = location=>{
	const sectionLocation = document.querySelector(location);
	const HSTopGraphSection = createDiv('HSGraphTopRow','row');
	const monthlyAuditGraph = createGraphCard('col s12 l6', 'monthlyAuditGraphSection', 'monthlyAuditGraphContent', 'Health and Safety');
	HSTopGraphSection.appendChild(monthlyAuditGraph);
	const accidentsGraph = createGraphCard('col s12 l6', 'accidentsGraphGraphSection', 'accidentsGraphContent', 'Number Of Days Lost Due To Accidents');
	HSTopGraphSection.appendChild(accidentsGraph);
	sectionLocation.appendChild(HSTopGraphSection);
}

const createHSGraphBottomSection = location=>{
	const sectionLocation = document.querySelector(location);
	const HSBottomGraphSection = createDiv('HSGraphBottomRow','row');
	const hsDataTables = createDiv('hsComplianceTables','col s12 l4');
	const enforcementActionsCard = createDiv('enforcementActions','card col s6 l12');
	const enforcementActionsContent = createDiv('enforcementActionsTbl','card-content');
	const enforcementActionsTitle = createTitle('h5','Enforcement Actions Notices');
	enforcementActionsContent.appendChild(enforcementActionsTitle);
	enforcementActionsCard.appendChild(enforcementActionsContent);
	hsDataTables.appendChild(enforcementActionsCard);
	const complianceAuditCard = createDiv('complianceAudit','card col s6 l12');
	const complianceAuditContent = createDiv('complianceAuditTbl','card-content');
	const complianceAuditTitle = createTitle('h5','Monthly Compliance Audit Scores');
	complianceAuditContent.appendChild(complianceAuditTitle);
	complianceAuditCard.appendChild(complianceAuditContent);
	hsDataTables.appendChild(complianceAuditCard);
	HSBottomGraphSection.appendChild(hsDataTables);
	const accidentByTradeGraph = createGraphCard('col s12 l4', 'accidentByTradeGraphSection', 'accidentByTradeGraphContent', 'By Trade');
	HSBottomGraphSection.appendChild(accidentByTradeGraph);
	const accidentByTypeGraph = createGraphCard('col s12 l4', 'accidentByTypeGraphSection', 'accidentByTypeGraphContent', 'By Type');
	HSBottomGraphSection.appendChild(accidentByTypeGraph);
	sectionLocation.appendChild(HSBottomGraphSection);
}

//HS Graph Section
const createEnforcementActionTbl = function(){
	const tableLocation = document.querySelector('#enforcementActionsTbl');
	const fieldLabels = ['hseEnforcementAction','companyEnforcementAction']
	const enforcementTbl = createTwoColBody(2,fieldLabels,false, ['','Number']);
	enforcementTbl.setAttribute('class','striped');
	tableLocation.appendChild(enforcementTbl)
}

const createComplainceAuditTbl = function(){
	const tableLocation = document.querySelector('#complianceAuditTbl');
	const fieldLabels = ['major','minor','pctComplance'];
	const complianceTbl = createTwoColBody(3,fieldLabels,false, ['','Number']);
	complianceTbl.setAttribute('class','striped');
	tableLocation.appendChild(complianceTbl)
}
//HS Graph Section
const tradeAccidentGraph = location=>{
	const accidentTradeData = tableToArray(document.querySelector('#accidentsTrade'));
	let accidentTradeGraphData=[];
	let count = 0;
	for(var trade in accidentTradeData){
		if(accidentTradeData[trade][1]>0){
			accidentTradeGraphData.push({value:accidentTradeData[trade][1], label:accidentTradeData[trade][0]});
			count += parseInt(accidentTradeData[trade][1]);
		}
		
	}
	Morris.Donut({
	  element: location,
	  data: accidentTradeGraphData,
	  resize:true,
	  formatter: function (value, data) { return (parseFloat(value)/count *100).toFixed(2) + '%';}
	});
}

const typeAccidentGraph = location=>{
	const accidentTypeData = tableToArray(document.querySelector('#accidentsType'));
	let accidentTypeGraphData=[];
	let count = 0;
	for(var type in accidentTypeData){
		if(accidentTypeData[type][1]>0){
			accidentTypeGraphData.push({value:accidentTypeData[type][1], label:accidentTypeData[type][0]});
			count += parseInt(accidentTypeData[type][1]);
		}
	}
	Morris.Donut({
	  element: location,
	  data: accidentTypeGraphData,
	  resize:true,
	  formatter: function (value, data) { return (parseFloat(value)/count *100).toFixed(0) + '%';}
	});
}

const HSMonthlyAuditGraph = location=>{
	const auditData = tableToArray(document.querySelector('#monthlyAuditTbl'));
	let auditGraphData=[]
	for(var prop in auditData){
		if(auditData[prop][1]!='undefined'){
			auditGraphData.push({x:auditData[prop][0], a:auditData[prop][1], b:80});
		}	
	}
	Morris.Area({
		element: location,
		data: auditGraphData,
		xkey: 'x',
		ykeys: ['a','b'],
		labels: ['Score', 'Target Score'],
		fillOpacity: 0.0,
		behaveLikeLine:true,
		parseTime: false,
		resize:true
	});
}

const daysLostGraph = location=>{
	const daysLostData = tableToArray(document.querySelector('#daysLostTbl'));
	let daysLostGraphData=[];
	for(var prop in daysLostData){
		daysLostGraphData.push({dateYear:daysLostData[prop][0],riddor7days: daysLostData[prop][1],nonRiddorLostTime06Days: daysLostData[prop][2]});
	}
	Morris.Bar({
		element: location,
		data: daysLostGraphData,
		xkey: 'dateYear',
		ykeys: ['riddor7days','nonRiddorLostTime06Days'],
		labels: ['dateYear','Riddor(7 Days+)', 'Non-Riddor Lost time 0-6 Days'],
		xLabelAngle:35,
		stacked:true,
		resize:true
	});
}

//TimeValue - structure
const createTimeStats = location=>{
	const sectionLocation = document.querySelector(location);
	const timeStatsSection = createDiv('timeStats','row');
	const timeTableContainer = createDataCard('col s12 l6', 'timeTable', 'timeTable', 'Time');
	timeStatsSection.appendChild(timeTableContainer);
	const timeChartContainer = createGraphCard('col s12 l6', 'timeChart', 'timeChartContent', 'Time');
	timeStatsSection.appendChild(timeChartContainer);
	sectionLocation.appendChild(timeStatsSection);
}

const createValueStats = location=>{
	const sectionLocation = document.querySelector(location);
	const valueStatsSection = createDiv('valueStats','row');
	const valueTableContainer = createDataCard('col s12 l6', 'valueTable', 'valueTable', 'Value')
	valueStatsSection.appendChild(valueTableContainer);
	const valueChartContainer = createGraphCard('col s12 l6', 'valueChart', 'valueChartContent', 'Value')
	valueStatsSection.appendChild(valueChartContainer);
	sectionLocation.appendChild(valueStatsSection);
}

//timeValue - create tables
const createTimeTable = ()=>{
	const tableLocation = document.querySelector('#completionTable');
	const timeTable = document.createElement('table');
	timeTable.setAttribute('class','striped');
	const tableHeader = document.createElement('thead');
	const headerRow = document.createElement('th');
	headerRow.setAttribute('colspan','2');
	const headerTxt = document.createElement('br');
	headerRow.appendChild(headerTxt);
	tableHeader.appendChild(headerRow)
	timeTable.appendChild(tableHeader);
	const tableBody = document.createElement('tbody');
	for(let i=0; i<8;i++){
		const tableRow = document.createElement('tr');
		const rowHeader = document.createElement('td');
		const rowContent= document.createElement('td');
		const rowHeaderText = (i==0)?document.createTextNode('Weeks Completed'):
							(i==1)?document.createTextNode('Weeks Contracted'):
							(i==2)?document.createTextNode('Time Completed %'):
							(i==3)?document.createTextNode('Time Remaining %'):
							(i==4)?document.createTextNode('Value Completed'):
							(i==5)?document.createTextNode('Value Remaining'):
							(i==6)?document.createTextNode('Contractual End Date'):
							document.createTextNode('Estimated End Date');
		const rowCellId = (i==0)?'weeksCompleted':
						(i==1)?'weeksContracted':
						(i==2)?'timeCompleted':
						(i==3)?'timeRemaining':
						(i==4)?'valueCompleted':
						(i==5)?'valueRemaining':
						(i==6)?'contractualEndDate':
						'estimatedEndDate';
		rowContent.setAttribute('id',rowCellId);
		rowContent.setAttribute('name',rowCellId);
		if(i==6){rowContent.innerHTML = result.timeValue.ConCompDate};
		if(i==7){rowContent.innerHTML = result.timeValue.EstCompDate};
		rowHeader.appendChild(rowHeaderText);
		tableRow.appendChild(rowHeader);
		tableRow.appendChild(rowContent);
		tableBody.appendChild(tableRow);
	}
	timeTable.appendChild(tableBody);
	tableLocation.appendChild(timeTable);
}

const createValueTable = ()=>{
	const tableLocation = document.querySelector('#completionTable');
	const valueTable = document.createElement('table');
	valueTable.setAttribute('class','striped');
	const tableHeader = document.createElement('thead');
	const tableBody = document.createElement('tbody');
	for(let i=0; i<2;i++){
		const tableRow = document.createElement('tr');
		const rowHeader = document.createElement('td');
		const rowContent= document.createElement('td');
		const rowInput = document.createElement('input');
		rowInput.setAttribute('type','text');
		const rowHeaderText=(i==0)?document.createTextNode('Value Completed'):document.createTextNode('Value Remaining');
		const fieldId = (i==0)?'valueCompleted':'valueRemaining';
		rowInput.setAttribute('id',fieldId);
		rowInput.setAttribute('name',fieldId);
		rowContent.appendChild(rowInput);
		rowHeader.appendChild(rowHeaderText);
		tableRow.appendChild(rowHeader);
		tableRow.appendChild(rowContent);
		tableBody.appendChild(tableRow);

	}
	valueTable.appendChild(tableBody);
	tableLocation.appendChild(valueTable);
}

//timeValue - create graphs

const createTimeChart = chartLocation=>{
	const completedTime = document.querySelector('#timeCompleted').innerHTML;
	const timeRemaining = document.querySelector('#timeRemaining').innerHTML;
	Morris.Donut({
	  element: chartLocation,
	  data: [
	    {label: "Time Completed", value: completedTime},
	    {label: "Time Remaining", value: timeRemaining}
	  ],
	  resize:true,
	  colors:["#B20000","#3232ad"]
	});
}

const createValueChart = chartLocation=>{
	const completedValueData = document.querySelector('#valueCompleted').innerHTML;
	const remainingValueData = document.querySelector('#valueRemaining').innerHTML;
	
	const valueGraph = Morris.Donut({
	  element: chartLocation,
	  data: [
	    {label: "Value Completed", value: completedValueData},
	    {label: "Value Remaining", value: remainingValueData}
	  ],
	  resize:true,
	  colors:["#B20000","#3232ad"]
	});
}
//Project KPI - Structure

const createProjectKpiSection = ()=>{
	const rowLocation = document.querySelector('#projectKPIs');
	const projectKpiRow = createDiv('projectKPIsRow','row');
	const projectKPIcontainer =createDataCard('col s12 l5', 'projectKPI', 'KpiTable', 'Project KPI\'s')
	projectKpiRow.appendChild(projectKPIcontainer);
	const monthlyKPIcontainer = createDataCard('col s12 l7', 'monthlyKPI', 'monthlyKpiTable', 'Monthly KPI\'s records');
	projectKpiRow.appendChild(monthlyKPIcontainer);
	rowLocation.appendChild(projectKpiRow);
}

//Project KPI - create tables
const createKpiCatTbl = ()=>{
	const tblLocation = document.querySelector("#KpiTable");
	const kpiHTMLtable = document.createElement('table');
	kpiHTMLtable.setAttribute('class','striped');
	kpiHTMLtable.setAttribute('id','projectKpiTbl');
	kpiHTMLtable.setAttribute('name','projectKpiTbl');
	const kpiHeader = document.createElement('thead');
	const kpiHeaderNames = ["","Target","Actual","Variance",]
	const headerRow = document.createElement("tr");
	for(let i=0;i<2;i++){
		for(let j=0;j<kpiHeaderNames.length;j++){
			const kpiHeaderCell = document.createElement("th");
			const kpiHeaderText = document.createTextNode(kpiHeaderNames[j]);
			kpiHeaderCell.setAttribute('class','center-align');
			kpiHeaderCell.appendChild(kpiHeaderText);
			headerRow.appendChild(kpiHeaderCell);
		}
	}
	kpiHeader.appendChild(headerRow)
	kpiHTMLtable.appendChild(kpiHeader);
	const kpiBody = document.createElement('tbody');
	const tblRows=['Adherence to Prelim Budget', 'Predictability to Cash Flow (month)', 'Predictability to Cash Flow (Qtr)', 'Non Recoverable Works', 'Predictability of Programme', 'H&S Audit Score', 'H&S Accident Incident Rate', 'Considerate Constructor Score', 'Waste', 'Percentage Recycled', 'Waste per £100k', 'Water m3 per £100k', 'Energy KG CO2 per £100k'];
	const tblRowId=['adherence','monthlyCashflow','qtrCashflow','nonRecWorks','predOfProgram','HSAudit','HSAccidentRate','considerateConstructor','','pctRecycled','waste100k','water100k','energy100k'];
	for (let i=0; i<tblRows.length; i++){
		const bodyRow = document.createElement('tr');
		if(tblRows[i]=='Waste'){
			const bodyCell = document.createElement('td');
			bodyCell.setAttribute('colspan','8');
			bodyCell.innerHTML = 'Waste';
			bodyRow.appendChild(bodyCell);
		}else{
			for(let j=0; j<8;j++){
				const cellRef = (j==1)?tblRowId[i]+'PctTarget':
								(j==2)?tblRowId[i]+'PctActual':
								(j==3)?tblRowId[i]+'PctVariance':
								(j==5)?tblRowId[i]+'Target':
								(j==6)?tblRowId[i]+'Actual':
								tblRowId[i]+'Variance';
				const bodyCell = document.createElement('td');
				if(j>0){
					if(j!=4){
						bodyCell.setAttribute('id',cellRef);
						bodyCell.setAttribute('name',cellRef);
						bodyCell.setAttribute('class','center-align');
					}
				}else{
					bodyCell.innerHTML = tblRows[i];
				}
				bodyRow.appendChild(bodyCell);
			}
		}
		kpiBody.appendChild(bodyRow);
	}
	kpiHTMLtable.appendChild(kpiBody);
	tblLocation.appendChild(kpiHTMLtable);	
}

const createMonthlyKPITbl = ()=>{
	const monthlyKpiTblLoc = document.querySelector('#monthlyKpiTable');
	const monthlyKpiTbl = document.createElement('table');
	monthlyKpiTbl.setAttribute('class','striped responsive');
	monthlyKpiTbl.setAttribute('id','tblMonthlyKpi');
	monthlyKpiTbl.setAttribute('name','tblMonthlyKpi');
	const tblHeaders=['Date','Total Skip waste m3','Total Cart Away Waste m3','% All Skip Waste Recycled','Water m3','Emissions from Diesel KG CO2','Emissions from Electricity KG CO2','Total Emissions KG CO2','Waste per £100k m3','Emissions from Energy KG CO2 per 100KG','Water m3 per £100k','Actual T.O'];
	const headerLength = tblHeaders.length;
	const tblHeader = document.createElement('thead');
	const tblHeaderRow = document.createElement('tr');
	for(let i = 0;i<headerLength;i++){
		let tblHeaderRowCellText;
		const tblHeaderRowCell = document.createElement('th');
		tblHeaderRowCellText = document.createTextNode(tblHeaders[i]);
		tblHeaderRowCell.setAttribute('class','center-align');
		tblHeaderRowCell.appendChild(tblHeaderRowCellText);
		tblHeaderRow.appendChild(tblHeaderRowCell);
	}
	tblHeader.appendChild(tblHeaderRow)
	monthlyKpiTbl.appendChild(tblHeader);
	const lastItem = getLastMonthlyKpiItem(); 
	const tblBody = document.createElement('tbody');
	const tblColIds=['date','TtlSkipWasteM3','totalCartAwayWastem3','pctAllSkipWasteCycled','waterm3','emitFromDieselKgCo2','EmitFromElectrictyKgCo2','TotalEmitKgCo2','Wasteper100kM3','emitfromEnergyKgCo2per100kg','waterm3Per100k','actualTo'];
	for(let j=0; j<lastItem;j++){
		const tblBodyRow = document.createElement('tr');
		for(let k=0; k<headerLength; k++){
			let tblBodyRowCellText;
			const fieldID=tblColIds[k]+(j+1);
			const tblBodyRowCell = document.createElement('td');
			if (k==0){
				tblBodyRowCellText = document.createTextNode(result.monthlyKPI[j].Date);
				tblBodyRowCell.appendChild(tblBodyRowCellText);
				tblBodyRowCell.setAttribute('id',fieldID);
				tblBodyRow.appendChild(tblBodyRowCell);
			}else{
				tblBodyRowCell.setAttribute('id',fieldID);
				tblBodyRowCell.setAttribute('name',fieldID);
				tblBodyRowCell.setAttribute('class','center-align');
				tblBodyRow.appendChild(tblBodyRowCell);
			}
			tblBody.appendChild(tblBodyRow);
		}
	}	
	monthlyKpiTbl.appendChild(tblBody);
	monthlyKpiTblLoc.appendChild(monthlyKpiTbl);
}

//Project KPI - fill tables

const populateMonthlyKpiTbl = ()=>{
	const tblColIds=['date','TtlSkipWasteM3','totalCartAwayWastem3','pctAllSkipWasteCycled','waterm3','emitFromDieselKgCo2','EmitFromElectrictyKgCo2','TotalEmitKgCo2','Wasteper100kM3','emitfromEnergyKgCo2per100kg','waterm3Per100k','actualTo'];
	const rowLength = tblColIds.length;
	const kpiData=result.monthlyKPI;
	const rowNum = kpiData.length;	
	for(var Prop in kpiData){
		let tblRowIndex = 0;
		for(var innerProp in kpiData[Prop]){
			const fieldID='#'+tblColIds[tblRowIndex]+(parseInt(Prop)+1);
			if(innerProp!='ContractNumber'){
				innerProp=='ActualTO'?document.querySelector(fieldID).innerHTML = numberformatter(kpiData[Prop][innerProp],'financial'):
				innerProp=='Date'?document.querySelector(fieldID).innerHTML = kpiData[Prop][innerProp]:document.querySelector(fieldID).innerHTML = numberformatter(kpiData[Prop][innerProp]);
				tblRowIndex++;
			}
		}
	}
}

const setFieldTextColour = ()=>{
	const tblLength = document.querySelector('#tblMonthlyKpi').rows.length
	for(var i=1;i<tblLength;i++){
		for(var j =0;j<3;j++){
			j==0?targetComparison(document.querySelector('#waste100kTarget').value,document.querySelector('#Wasteper100kM3'+i).value,'#Wasteper100kM3'+i):
			j==1?targetComparison(document.querySelector('#energy100kTarget').value,document.querySelector('#emitfromEnergyKgCo2per100kg'+i).value,'#emitfromEnergyKgCo2per100kg'+i):
			targetComparison(document.querySelector('#water100kTarget').value,document.querySelector('#waterm3Per100k'+i).value,'#waterm3Per100k'+i)
		}
	}
}

//Progress Data Section - Structure
const createProgressSection = location=>{
	const sectionLocation = document.querySelector(location);
	const section = createDiv('progressSection','row');
	const leftColumn = createDataCard('col s12 l3', 'progressTbl', 'progressTblContent', 'Progress')
	section.appendChild(leftColumn);
	const midColumn = createDiv('midColumn','col s12 l3');
	const midLeftFirstCard = createDiv('considerateConsContainer','card col s6 l12');
	const midLeftFirstContent = createDiv('considerateContractorsTbl','card-content');
	const midLeftFirstTitle = createTitle('h5','Considerate Constructors');
	const breakelement = document.createElement('br')
	midLeftFirstContent.appendChild(midLeftFirstTitle);
	midLeftFirstCard.appendChild(midLeftFirstContent);
	midColumn.appendChild(midLeftFirstCard);
	const midSecondCard = createDiv('materials','card col s6 l12');
	const midSecondContent = createDiv('materialsTables','card-content');
	const midSecondMainTitle = createTitle('h5','Material Controls');
	const midSecondSubTitleA = document.createTextNode('Summary of Materials Ordered By Category:');
	const midSecondSubTitleB = document.createTextNode('Summary of Replacement Ordered by Reason:');
	const matsByCatsDiv = createDiv('matsByCats');
	const matsByReasonDiv = createDiv('matsbyReason');
	midSecondContent.appendChild(midSecondMainTitle);
	midSecondContent.appendChild(breakelement);
	midSecondContent.appendChild(midSecondSubTitleA);
	midSecondContent.appendChild(matsByCatsDiv);
	midSecondContent.appendChild(breakelement);
	midSecondContent.appendChild(midSecondSubTitleB);
	midSecondContent.appendChild(matsByReasonDiv);
	midSecondCard.appendChild(midSecondContent);
	midColumn.appendChild(midSecondCard);
	section.appendChild(midColumn);
	const rightColumn = createDataCard('col s12 l6', 'recordOfLabour', 'recordOfLabourContent', 'Record Of Labour');
	section.appendChild(rightColumn);
	sectionLocation.appendChild(section);
}

//Progress Data Section - Create Tables
const createProgressTbl = ()=>{
	const tableLocation = document.querySelector('#progressTblContent');
	const tableLength = projectMonths.length;
	const progressTable = createTwoColBody(tableLength,projectMonths,false, ['Month','Progress'])
	progressTable.setAttribute('class','striped');
	tableLocation.appendChild(progressTable);
}

const createConsiderateConstructorsTable = location=>{
	const tableLocation = document.querySelector(location)
	const considerateConsTable = document.createElement('table');
	considerateConsTable.setAttribute('id','considerContractorTbl')
	considerateConsTable.setAttribute('class','striped')
	const tableHeader = document.createElement('thead');
	const headerRow = document.createElement('tr');
	for(let i=0;i<2;i++){
		const column = document.createElement('th');
		const colTitle = (i==0)? document.createTextNode('Date'):document.createTextNode('Score');
		column.appendChild(colTitle);
		headerRow.appendChild(column);
	}
	tableHeader.appendChild(headerRow);
	considerateConsTable.appendChild(tableHeader);
	const tableLength = result.CCS.length;
	const tableBody = document.createElement('tbody');
	for(let j=0;j<tableLength;j++){
		const bodyRow = document.createElement('tr');
		for(let k=0;k<2;k++){
			const bodyCell = document.createElement('td');
			if(k==0){
				const fieldID = 'CCS';
				const fieldContentSting = result.CCS[j].Date;
				const fieldContentDate = fieldContentSting.split('/')[1]+'/'+fieldContentSting.split('/')[0]+'/'+ fieldContentSting.split('/')[2];
				bodyCell.setAttribute('class','datepicker');
				bodyCell.setAttribute('id','_datepicker_'+fieldID);
				bodyCell.setAttribute('onChange','constructDate(fieldContentSting,fieldID)');
				bodyCell.innerHTML = fieldContentDate;
			}else{
				
				bodyCell.setAttribute('id','considerateConstructorsScore'+j);
				bodyCell.setAttribute('name','considerateConstructorsScore'+j);
				bodyCell.innerHTML = result.CCS[j].Score;
			}
			bodyRow.appendChild(bodyCell);
		}
		tableBody.appendChild(bodyRow);
	}
	considerateConsTable.appendChild(tableBody);
	tableLocation.appendChild(considerateConsTable);
}

const createMatsByCats = ()=>{
	 const tblLocation = document.querySelector('#matsByCats');
	 const tblLength = Object.keys(result.MaterialOrdersCategories[0]).length-1;
	 const fieldLabels = ['partSite','wholeSite','replacement']
	 const matsByCatsTbl = createTwoColBody(tblLength,fieldLabels,false, ['Category','Number'], true);
	 matsByCatsTbl.setAttribute('class','striped');
	 matsByCatsTbl.setAttribute('id','materialsByCat');
	 tblLocation.appendChild(matsByCatsTbl);
	 fillCwdTbl2(result.MaterialOrdersCategories)
}

const createMatsByReason = ()=>{
	 const tblLocation = document.querySelector('#matsbyReason');
	 const tblLength = Object.keys(result.MaterialOrdersType[0]).length-1;
	 const fieldLabels = ['clientChange','theft','waste','damage'];
	 const matsByReasonTbl = createTwoColBody(tblLength,fieldLabels,false, ['Reason','Number'],true);
	 matsByReasonTbl.setAttribute('class','striped');
	 matsByReasonTbl.setAttribute('id','replacementsByReason');
	 tblLocation.appendChild(matsByReasonTbl);
	 fillCwdTbl2(result.MaterialOrdersType);
}

const createRecordOfLabourTable = ()=>{
	const labourTable = document.createElement('table'); 
	labourTable.setAttribute('id','recOfLbr');
	labourTable.setAttribute('class','striped');
	const tableHeader = document.createElement('thead');
	const headerRow = document.createElement('tr');
	for(let i = 0;i<9;i++){
		const headerCell = document.createElement('th');
		headerCell.setAttribute('class','center-align');
		let headerCellText;
		switch(i){
			case 0:
				headerCellText = document.createTextNode('Week');
				break;
			case 1:
				headerCellText = document.createTextNode('Mon');
				break;
			case 2:
				headerCellText = document.createTextNode('Tues');
				break;
			case 3:
				headerCellText = document.createTextNode('Wed');
				break;
			case 4:
				headerCellText = document.createTextNode('Thurs');
				break;
			case 5:
				headerCellText = document.createTextNode('Fri');
				break;
			case 6:
				headerCellText = document.createTextNode('Sat');
				break;
			case 7:
				headerCellText = document.createTextNode('Sun');
				break;
			case 8:
				headerCellText = document.createTextNode('Total');
				break;
		}
		headerCell.appendChild(headerCellText);
		headerRow.appendChild(headerCell);
	}
	tableHeader.appendChild(headerRow);
	labourTable.appendChild(tableHeader);

	const tableBody = document.createElement('tbody');
	const numberOfRows =result.NewRecordOfLabour.length;
	for(let i=0;i<numberOfRows; i++){
		const bodyRow = recordOfLabourRows(i);
		tableBody.appendChild(bodyRow);
	}
	labourTable.appendChild(tableBody);
	document.querySelector("#recordOfLabourContent").appendChild(labourTable);
}

const recordOfLabourRows = weekNumber=>{
	const rowOfFields=document.createElement('tr');
	const currentWeekNumber = result.NewRecordOfLabour[weekNumber].WeekNum;
	for(let i=0;i<9;i++){
		const singleField = document.createElement('td');
		const cellId = recordOfLabourCell(i)
		const fieldID = 'week'+currentWeekNumber	+cellId;
		singleField.setAttribute('id',fieldID);
		singleField.setAttribute('name',fieldID);
		singleField.setAttribute('class','center-align');
		rowOfFields.appendChild(singleField);
	}
	return rowOfFields;
}

const recordOfLabourCell = cellNumber=>{
	let cellId;
	switch(cellNumber){
		case 0:
			cellId='WeekNum';
			break;
		case 1:
			cellId='Monday';
			break;
		case 2:
			cellId='Tuesday';
			break;
		case 3:
			cellId='Wednesday';
			break;
		case 4:
			cellId='Thursday';
			break;
		case 5:
			cellId='Friday';
			break;
		case 6:
			cellId='Saturday';
			break;
		case 7:
			cellId='Sunday';
			break;
		case 8:
			cellId='Total';
			break;
	}
	return cellId
}

const populateRecordOfLabourTbl = ()=>{
	const numberOfRows = result.NewRecordOfLabour.length;
	for(let i=0;i<numberOfRows;i++){
		console.log(i)
		setRecordOfLabourRows(i);
	}	
}

const setRecordOfLabourRows = weekNumber=>{
	let totalLabour =0;
	let fieldId;
	let weekNum;
	for(var prop in result.NewRecordOfLabour[weekNumber]){
		weekNum = result.NewRecordOfLabour[weekNumber].WeekNum;
		fieldId = '#week'+(weekNum)+prop;
		if(prop != 'ContractNumber'){
			if(prop != 'WeekNum'){
				totalLabour =  totalLabour + parseInt(result.NewRecordOfLabour[weekNumber][prop]);
			}
			document.querySelector(fieldId).innerHTML = result.NewRecordOfLabour[weekNumber][prop];
		}
	}
	fieldId = '#week'+weekNum+'Total';
	document.querySelector(fieldId).innerHTML =totalLabour;
}

//Financial Data Section - Structure
const createfinancialData = ()=>{
	const location = document.querySelector('#finacialData');
	const row = createDiv('financialDataRow','row');
	const monthlyCWD = createDataCard('col s12 l2', 'totalCWD', 'totalCWDCardContent', 'CWD To Date');
	const totalCWD = createDataCard('col s12 l2', 'monthlyCWD', 'monthlyCWDCardContent', 'CWD In Month');
	const turnover = createDataCard('col s12 l4', 'turnover', 'turnoverCardContent', 'Predicatability (Turnover)');
	const costflow = createDataCard('col s12 l4', 'costflow', 'costflowCardContent', 'Costflow');
	row.appendChild(monthlyCWD);
	row.appendChild(totalCWD);
	row.appendChild(turnover);
	row.appendChild(costflow);
	location.appendChild(row);
}

//Financial Data Section - create tables
const createFinancialDataSection = ()=>{
	const sectionLocation = document.querySelector('#financialData');
	const sectionRow = createDiv('financialRow','row');
	const CwdToDate = createDataCard('col s12 l2', 'totalCWD', 'totalCwdContent', 'CWD To Date');
	const monthlyCwds = createDataCard('col s12 l2', 'monthlyCWD', 'monthlyCwdContent', 'CWD In Month');
	const turnover = createDataCard('col s12 l4', 'turnover', 'turnoverContent', 'Predictability (Turnover)');
	const costflow = createDataCard('col s12 l4', 'costflow', 'costflowContent', 'Costflow');
	sectionRow.appendChild(CwdToDate);
	sectionRow.appendChild(monthlyCwds);
	sectionRow.appendChild(turnover);
	sectionRow.appendChild(costflow);
	sectionLocation.appendChild(sectionRow);
}

//Financial Data Section - create and fill tables
const createCwdToDateTbl = ()=>{
	const tblLocation = document.querySelector('#totalCwdContent');
	const tableSize= result.CWDsTotal.length;
	const totalCWDTbl = createTwoColBody(tableSize,'totalCwdSubbie',true,['Sub-Contractor','Number']);
	totalCWDTbl.setAttribute('id','totalCwdTbl');
	totalCWDTbl.setAttribute('class','striped');
	tblLocation.appendChild(totalCWDTbl);
}

const fillCwdTbl=(tblData, cell)=>{
	const tableSize= tblData.length;
	for(let i=0;i<tableSize;i++){
		for(let j=0;j<2;j++){
			const cellId = (j==0)?cell+(i+1):cell+(i+1)+'Value';
			const cellValue = (j==0)?tblData[i].SubContractor:tblData[i].Total;
			document.querySelector(cellId).innerHTML=cellValue;
		}
	}
}

const fillCwdTbl2= tblData =>{
	for(var prop in tblData){
		for(var innerProp in tblData[prop]){
			if(innerProp!='ContractNumber'){
				for(let i=0;i<2;i++){
					const cellId = (i==0)?'#'+innerProp:'#'+innerProp+'Value';
					const cellValue = (i==0)?innerProp:tblData[prop][innerProp];
					(i==0)?fillStaticField(cellId,cellValue):document.querySelector(cellId).innerHTML = cellValue;
				}
			}
		}
	}
}

const createMonthlyCwdTbl = ()=>{
	const tblLocation = document.querySelector('#monthlyCwdContent');
	const tableSize= result.CWDsMonthly.length;
	const monthlyCWDTbl = createTwoColBody(tableSize,'monthlyCwdSubbie',true,['Sub-Contractor','Number']);
	monthlyCWDTbl.setAttribute('id','monthlyCwdTbl');
	monthlyCWDTbl.setAttribute('class','striped');
	tblLocation.appendChild(monthlyCWDTbl);
}

const createPredTurnoverTbl = ()=>{
	const predTurnoverTbl = document.createElement('table');
	predTurnoverTbl.setAttribute('id','predTurnoverTbl');
	predTurnoverTbl.setAttribute('class','striped');
	const tableHeader = document.createElement('thead');
	const headerRow = document.createElement('tr');
	for(let i=0;i<4;i++){
		const rowCell = document.createElement('th');
		const cellText = (i==0)?document.createTextNode('Month'):
							(i==1)?document.createTextNode('Original Cum T.O'):
							(i==2)?document.createTextNode('Current Cum T.O'):
							document.createTextNode('Actual Cum T.O');
		rowCell.setAttribute('class','center-align');
		rowCell.appendChild(cellText);
		headerRow.appendChild(rowCell);
	}
	tableHeader.appendChild(headerRow);
	predTurnoverTbl.appendChild(tableHeader)
	const tableBody = document.createElement('tbody');
	const listOfMonths = projectMonths.length;
	for(let j=0;j<listOfMonths;j++){
		const bodyRow=document.createElement('tr');
		for(let k=0; k<4;k++){
			const bodyCell = document.createElement('td');
			if(k==0){
				bodyCell.innerHTML = projectMonths[j];
			}else{
				const bodyCellId = (k==1)?projectMonths[j]+'OriginalCum':
									(k==2)?projectMonths[j]+'CurrentCum':
									projectMonths[j]+'ActualCum';
				const bodyCellValue = (k==1)?numberformatter(result.financialData[2][projectMonths[j]],'financial'):
									(k==2)?numberformatter(result.financialData[0][projectMonths[j]],'financial'):
									numberformatter(result.financialData[1][projectMonths[j]],'financial');
				bodyCell.setAttribute('id',projectMonths[j]+bodyCellId);
				bodyCell.setAttribute('name',projectMonths[j]+bodyCellId);
				bodyCell.setAttribute('class','center-align');
				bodyCell.innerHTML = bodyCellValue;
			}
			bodyRow.appendChild(bodyCell);
		}
		tableBody.appendChild(bodyRow);
	}
	predTurnoverTbl.appendChild(tableBody);
	document.querySelector('#turnoverContent').appendChild(predTurnoverTbl);
}

const createCostflowTbl = ()=>{
	const costflowTbl = document.createElement('table');
	costflowTbl.setAttribute('id','costflowTbl');
	costflowTbl.setAttribute('class','striped');
	const tableHeader = document.createElement('thead');
	const headerRow = document.createElement('tr');
	for(let i=0;i<4;i++){
		const rowCell = document.createElement('th');
		const cellText = (i==0)?document.createTextNode('Month'):
							(i==1)?document.createTextNode('Cum Certified T.O'):
							(i==2)?document.createTextNode('Current Cum T.O'):
							document.createTextNode('Actual Cum T.O');
		rowCell.setAttribute('class','center-align');
		rowCell.appendChild(cellText);
		headerRow.appendChild(rowCell);
	}
	tableHeader.appendChild(headerRow);
	costflowTbl.appendChild(tableHeader)
	const listOfMonths = projectMonths.length;
	const tableBody = document.createElement('tbody');
	for(let j=0;j<listOfMonths;j++){
		const bodyRow=document.createElement('tr');
		for(let k=0; k<4;k++){
			const cumTgtCostflow=(result.financialData[0][projectMonths[j]]*(1-0.1)).toFixed(0);
			const bodyCell = document.createElement('td');
			let bodyCellInput;
			if(k==0){
				bodyCell.innerHTML = projectMonths[j];
			}else{
				const bodyCellId = (k==1)?projectMonths[j]+'CumCertifiedCash':
									(k==2)?projectMonths[j]+'CurrentCum':
									projectMonths[j]+'ActualCum';
				const bodyCellValue = (k==1)?numberformatter(result.financialData[0][projectMonths[j]],'financial'):
										(k==2)?numberformatter(cumTgtCostflow,'financial'):
										numberformatter(result.financialData[3][projectMonths[j]],'financial');
				bodyCell.setAttribute('id','costFlow'+projectMonths[j]+'CumCertifiedCash');
				bodyCell.setAttribute('name','costFlow'+projectMonths[j]+'CumCertifiedCash');
				bodyCell.setAttribute('class','center-align');
				bodyCell.innerHTML =bodyCellValue; 
			}
			bodyRow.appendChild(bodyCell);
		}
		tableBody.appendChild(bodyRow);
	}
	costflowTbl.appendChild(tableBody);
	document.querySelector('#costflowContent').appendChild(costflowTbl);
}

//Subcontractor Financial Data Section
const createSubContractorSection = location=>{
	const sectionLocation = document.querySelector(location);
	const section= createDiv('subContractorContainer','row');
	const subContractorDiv = createDataCard('col s12 l12', 'subContractor', 'subConOrderVariations', 'Subcontractor Orders and Variations');
	section.appendChild(subContractorDiv);
	sectionLocation.appendChild(section);
}

const createsubConOrderVarTbl = ()=>{
	const tblLength = result.SubConFinData.length;
	if(tblLength>0){
		const tableLocation = document.querySelector('#subConOrderVariations');
		const subConOrderTable = document.createElement('table');
		subConOrderTable.setAttribute('id','subbieOrders');
		subConOrderTable.setAttribute('class','striped');
		const subConHeader = document.createElement('thead');
		const headerRow = document.createElement('tr');
		for(let i=0;i<6;i++){
			const headerCell = document.createElement('th');
			const headerCellText = (i==0)?document.createTextNode('Trade'):
									(i==1)?document.createTextNode('Sub-Contract Nett Order Value'):
									(i==2)?document.createTextNode('Design Development'):
									(i==3)?document.createTextNode('Package'):
									(i==4)?document.createTextNode('Site'):
									document.createTextNode('Recoverable Variations');
			headerCell.setAttribute('class','center-align');
			headerCell.appendChild(headerCellText);
			headerRow.appendChild(headerCell);
		}
		subConHeader.appendChild(headerRow);
		subConOrderTable.appendChild(subConHeader);
		const subConBody = document.createElement('tbody');
		let colsIds=Object.keys(result.SubConFinData[0]);
		colsIds.shift();
		for (let j=0; j<tblLength; j++){
			const bodyRow = document.createElement('tr');
			for(let k=0; k<colsIds.length;k++){
				const bodyCell = document.createElement('td');
				const bodyCellId= colsIds[k]+(j+1);
				bodyCell.setAttribute('id',bodyCellId);
				bodyCell.setAttribute('name',bodyCellId);
				bodyCell.setAttribute('class','center-align');
				bodyRow.appendChild(bodyCell)
			}
			subConBody.appendChild(bodyRow);
		}
		subConOrderTable.appendChild(subConBody)


		tableLocation.appendChild(subConOrderTable);
		populateSubConOrderVarTbl();
	}
	else{
		const alternativeText = document.createTextNode('- No Information to Display - ');
		tableLocation.appendChild(alternativeText);
	}
}

const populateSubConOrderVarTbl = ()=>{
	for(var prop in result.SubConFinData){
		if(result.SubConFinData.hasOwnProperty(prop)){
			for(var innerProp in result.SubConFinData[prop]){
				if(innerProp!='ContractNumber'){
					const fieldID = '#'+innerProp+(parseInt(prop)+1);
					innerProp=='SubContractorName'?document.querySelector(fieldID).innerHTML = result.SubConFinData[prop][innerProp]:
					document.querySelector(fieldID).innerHTML = numberformatter(result.SubConFinData[prop][innerProp],'financial');
				}
			}
		}
	}
}

//HS Data Section Structure
const createHSDataSection = location=>{
	const sectionLocation = document.querySelector(location);
	const HsRow = createDiv('HsRow','row');
	const monthlyAuditCard = createDataCard('col s12 l2','monthlyAudit','HSMonthlyAudit','Monthly Audit');
	const accidentTradeTypeCard = createMultiDataCard('col s12 l4', 'accidentTradeType', 2, '', ['By Type','By Trade'])
	const accidentReportCard = createDataCard('col s12 l3','accidentReport','tblAccidentReport','Accident Report');
	const daysLostCard = createDataCard('col s12 l3', 'daysLost', 'daysLostContent', 'Days Lost');
	HsRow.appendChild(monthlyAuditCard);
	HsRow.appendChild(accidentTradeTypeCard);
	HsRow.appendChild(accidentReportCard);
	HsRow.appendChild(daysLostCard);
	sectionLocation.appendChild(HsRow);
}

const getProjectMonths = ()=>{
	projectMonths = Object.keys(result.progress).slice(1);
}

//HS Data Section Create Table
const createHSMonthlyAuditTbl = ()=>{
	const tableLocation = document.querySelector('#HSMonthlyAudit');
	const HSAuditTable = document.createElement('table');
	const tableHeader = document.createElement('thead');
	const headerRow = document.createElement('tr');
	HSAuditTable.setAttribute('id','monthlyAuditTbl');
	HSAuditTable.setAttribute('class','striped');
	for(let i=0; i<3;i++){
		const headerCell = document.createElement('th');
		const cellText = (i==0)?document.createTextNode('%'):document.createTextNode('Score');
		headerCell.setAttribute('class','center-align');
		headerCell.appendChild(cellText);
		headerRow.appendChild(headerCell);
	}
	tableHeader.appendChild(headerRow);
	HSAuditTable.appendChild(tableHeader);
	const tableBody = document.createElement('tbody');
	const numOfRows = projectMonths.length;
	for(let j=0;j<numOfRows;j++){
		const bodyRow = document.createElement('tr');
		const percentage = (result.HSData[1][projectMonths[j]]==undefined)?0:result.HSData[1][projectMonths[j]];
		const score = (result.HSData[0][projectMonths[j]]==undefined)?0:result.HSData[0][projectMonths[j]];
		for(let k=0; k<3;k++){
			const bodyCell = document.createElement('td');
			if(k==0){
				bodyCell.appendChild(document.createTextNode(projectMonths[j]));
			}
			else{
				const fieldId=(k==1)?projectMonths[j]+'Pct':projectMonths[j]+'Value';
				const fieldValue=(k==1)?percentage:score;
				bodyCell.setAttribute('id',fieldId);
				bodyCell.setAttribute('name',fieldId);
				bodyCell.setAttribute('class','center-align');
				bodyCell.innerHTML = fieldValue;

			}
			bodyRow.appendChild(bodyCell);
		}
		tableBody.appendChild(bodyRow);
	}
	HSAuditTable.appendChild(tableBody);
	tableLocation.appendChild(HSAuditTable);
}

const tblAccidentType = location=>{
	const accidentTypeTblLoc=document.querySelector(location);
	const typeData = ['abdomen','arms','back','burns','chest','eyes','face','feet','hands','head','jaw','legs','muscular','neck','pelvis','penis','shoulder','skeletal'];
	const rowNum = typeData.length;
	const typeTable = createTwoColBody(rowNum,typeData,false,['Type','Frequency'], true);
	typeTable.setAttribute('id','accidentsType');
	typeTable.setAttribute('class','striped');
	accidentTypeTblLoc.appendChild(typeTable);
	fillAccidentTables(typeData);
}

const fillAccidentTables = data =>{
	const tblSize = data.length;
	for(let i=0;i<tblSize;i++){
		for(let j=0;j<2;j++){
			const cellId = (j==0)?'#'+data[i]:'#'+data[i]+'Value';
			const cellValue = (j==0)?data[i]:'0';
			(j==0)? fillStaticField(cellId, cellValue):	document.querySelector(cellId).innerHTML = cellValue;
		}
	}
}

const fillStaticField = (cell,data) =>{
	const cellValue = data.charAt(0).toUpperCase()+data.slice(1).replace(/([A-Z])/g, ' $1'); 
	document.querySelector(cell).innerHTML = cellValue;
}


const tblAccidentTrade = location=>{
	const accidentTradeTblLoc=document.querySelector(location);
	const tradeData = ['asbestosRemoval','brickwork','carpentry','cladding','cleaning','demolition','electrical','fencing','flooring','forklift','frame','glazing','groundwork','insulation','labourer','landscaping','lifts','lightningProtection','management','mastic','mechanical','metalwork','paintingAndDecoration','pestControl','piling','plastering','plumbing','render','roofing','scaffolding','steelwork','tiling','treeSurgery','waterProofing','windows'];
	const rowNum = tradeData.length;
	const tradeTable =  createTwoColBody(rowNum,tradeData,false,['Type','Frequency'],true);
	tradeTable.setAttribute('id','accidentsTrade');
	tradeTable.setAttribute('class','striped');
	accidentTradeTblLoc.appendChild(tradeTable);
	fillAccidentTables(tradeData);
}

const createAccidentReportTbl = ()=>{
	const tableLocation = document.querySelector('#tblAccidentReport');
	const accidentReportTable = document.createElement('table');
	accidentReportTable.setAttribute('class','striped');
	accidentReportTable.setAttribute('id','AccidentReportTbl');
	const tblHead = document.createElement('thead');
	const tblHeadRow = document.createElement('tr');
	for(let i=0;i<5;i++){
		const tblHeadRowCell = document.createElement('th');
		const tblHeadRowCellTxt= (i==0)?document.createTextNode('Date'):
								(i==1)?document.createTextNode('Trade'):
								(i==2)?document.createTextNode('Type'):
								(i==3)?document.createTextNode('Lost Days'):
								document.createTextNode('Riddor');
		tblHeadRowCell.appendChild(tblHeadRowCellTxt);
		tblHeadRowCell.setAttribute('class','center-align');
		tblHeadRow.appendChild(tblHeadRowCell);
	}
	tblHead.appendChild(tblHeadRow);
	accidentReportTable.appendChild(tblHead);
	const tblBody = document.createElement('tbody');
	const tblLength = result.AccidentReport.length;
	for(let j=0;j<tblLength;j++){
		const bodyRow = document.createElement('tr');
		for(let k=0;k<5;k++){
			const rowCell = document.createElement('td');
			const fieldID = (k==0)?'accidentReport'+(parseInt(j)+1):
							(k==1)?'accidentReport'+(parseInt(j)+1)+'Trade':
							(k==2)?'accidentReport'+(parseInt(j)+1)+'Type':
							(k==3)?'accidentReport'+(parseInt(j)+1)+'LostDays':
							'accidentReport'+(parseInt(j)+1)+'Riddor';
			if(k==0){
				rowCell.setAttribute('class','datepicker');
				rowCell.setAttribute('id','_datepicker_'+fieldID);
				rowCell.setAttribute('onChange','constructDate()');
			}else{
				rowCell.setAttribute('id',fieldID);
				rowCell.setAttribute('name',fieldID);
				rowCell.setAttribute('class','center-align');
			}
			bodyRow.appendChild(rowCell);
		}
		tblBody.appendChild(bodyRow);
	}
	accidentReportTable.appendChild(tblBody);
	tableLocation.appendChild(accidentReportTable);
}

const createDaysLostTbl = ()=>{
	const tblLocation = document.querySelector('#daysLostContent');
	const DaysLostTable = document.createElement('table');
	const tableHeader=document.createElement('thead');
	const headerRow = document.createElement('tr');
	DaysLostTable.setAttribute('id','daysLostTbl');
	DaysLostTable.setAttribute('class','striped');
	for(let i=0;i<3;i++){
		const headerRowCell=document.createElement('th');
		const headerRowCellTxt= i==0?document.createTextNode('Month'):
								i==1?document.createTextNode('Riddor (7Days +)'):
								document.createTextNode('Non-Riddor Lost time 0-6 Days');
		headerRowCell.appendChild(headerRowCellTxt);
		headerRowCell.setAttribute('class','center-align');
		headerRow.appendChild(headerRowCell);
	}
	tableHeader.appendChild(headerRow);
	DaysLostTable.appendChild(tableHeader);
	const tableBody = document.createElement('tbody');
	const latestMonth = projectMonths[projectMonths.length-1];
	tableLength=projectMonths.length;
	for(let j=0;j<tableLength;j++){
		const bodyRow = document.createElement('tr');
		for(let k=0;k<3;k++){
			const bodyRowCell = document.createElement('td');
			const fieldId = (k==1)?'riddor'+projectMonths[j]:'nonRiddor'+projectMonths[j];
			bodyRowCell.setAttribute('class','center-align');
			switch(k){
				case 0:
					bodyRowCell.appendChild(document.createTextNode(projectMonths[j]));
					break;
				case 1:
				case 2:
					bodyRowCell.setAttribute('id',fieldId);
					bodyRowCell.setAttribute('name',fieldId);
					bodyRowCell.innerHTML = 0;
					break;
			}
			bodyRow.appendChild(bodyRowCell);
		}
		tableBody.appendChild(bodyRow);
	}
	
	DaysLostTable.appendChild(tableBody);
	tblLocation.appendChild(DaysLostTable);
}

const HSMonthlyAuditAvg = ()=>{
	let HSsum=0;
	let numberOfMonths=0;
	for(let i=0;i<projectMonths.length;i++){
		if(projectMonths[i]!="___rowNum__"){
			const currentMonth = projectMonths[i];
			if(currentMonth.substr(3,5)>=17){
				if(result.HSData[0][currentMonth]!=undefined){
					HSsum+=parseInt(result.HSData[0][currentMonth]);
					numberOfMonths+=1;
				}else{
					HSsum+=0;
				}
			}
		}
	}
	document.querySelector("#HSAuditActual").innerHTML = (HSsum/numberOfMonths).toFixed(0);
}

const HSMonthlyAuditAvgPct = ()=>{
	let HSsum=0;
	let numberOfMonths=0;
	for(let i=0;i<projectMonths.length;i++){
		if(projectMonths[i]!="___rowNum__"){
			const currentMonth = projectMonths[i];
			if(currentMonth.substr(3,5)>=17){
				if(result.HSData[1][currentMonth]!=undefined){
					HSsum+=parseInt(result.HSData[1][currentMonth]);
					numberOfMonths+=1;
				}else{
					HSsum+=0;
				}
			}
		}
	}
	document.querySelector("#HSAuditPctActual").value = numberformatter((HSsum/numberOfMonths).toFixed(0),'percentage');
}

const populateAccidentReportTbl = ()=>{
	let dateMonth;
	let dateYear;
	for(var prop in result.AccidentReport){
		if(result.AccidentReport.hasOwnProperty(prop)){
			for(var innerProp in result.AccidentReport[prop]){
				let fieldID;
				let totalLostDays;
				if(innerProp!='ContractNumber' && typeof(innerProp)!==undefined){
					if(innerProp=='Date'){
						fieldID ='#_datepicker_accidentReport'+(parseInt(prop)+1);
						dateMonth= result.AccidentReport[prop]["Date"].substr(3,2);
						dateYear = result.AccidentReport[prop]["Date"].substr(6,2);

					}else{
						fieldID = '#accidentReport'+(parseInt(prop)+1)+innerProp;
					}
					document.querySelector(fieldID).innerHTML = result.AccidentReport[prop][innerProp];
					switch(innerProp){
						case 'Type':
							const type = result.AccidentReport[prop][innerProp];
							const typeTableID = '#'+getTypeFieldID(type);
							const currentTypeValue = ++(document.querySelector(typeTableID).innerHTML);
							document.querySelector(typeTableID).innerHTML=currentTypeValue;
							break;
						case 'Trade':
							const trade = getTradeCategory(result.AccidentReport[prop][innerProp]);
							const tradeTableID = '#'+getTradeFieldID(trade);
							const currentTradeValue = ++(document.querySelector(tradeTableID).innerHTML);
							document.querySelector(tradeTableID).innerHTML=currentTradeValue;
							break;
						case 'LostDays':
							const newdaysLost =parseInt(result.AccidentReport[prop][innerProp].replace(/[^0-9 ]/g, ""));
							const lostDaysFieldID='#'+findLostDaysID(dateMonth,dateYear,'nonRiddor');
							totalLostDays=parseInt(document.querySelector(lostDaysFieldID).innerHTML);
							if(newdaysLost<7){
								totalLostDays+=newdaysLost;
								document.querySelector(lostDaysFieldID).innerHTML=totalLostDays;
							}
							document.querySelector(lostDaysFieldID).setAttribute('value',totalLostDays);
							break;
						case 'Riddor':
							const riddorFieldID='#'+findLostDaysID(dateMonth,dateYear,'riddor');
							const riddor = parseInt(result.AccidentReport[prop][innerProp]);
							const totalRiddor = parseInt(document.querySelector(riddorFieldID).innerHTML)+riddor;
							document.querySelector(riddorFieldID).innerHTML=totalRiddor;
							document.querySelector(riddorFieldID).setAttribute('value',totalLostDays);
							break;
					};
				}
			}
		}
	}
}

const findLostDaysID = (month, year, fieldType)=>{
	const writtenMonth = getMonthName(month);
	const fieldDate = writtenMonth+year;
	const fieldID = (fieldType=='nonRiddor')?'nonRiddor'+fieldDate:'riddor'+fieldDate;
	return fieldID;
}