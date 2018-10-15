		
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
	//createEnforcementActionTbl()
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
		const innerSectionTitle = createTitle('h5',subItemTitles[i]);
		innerSectionTitle.setAttribute('class','col s12 l'+sectionSize);
		content.appendChild(innerSectionTitle);
	}
	for(let j =0; j<numOfItems;j++){
		const innerSection = createDiv(subItemTitles[j].replace(/\s/g, '')+'Tbl','col s12 l'+sectionSize);
		content.appendChild(innerSection);
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
	document.body.scrollTop = 0;
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
	const inputs = table.getElementsByTagName( 'input' ); 
	let t;
	let cellId = 0;
	for(let i=0; i<rows.length;i++){
		const cells=Array.from(rows[i].cells);
		t=[];
		for(let j=0;j<cells.length;j++){
			const cellContents=(j==0)?cells[j].textContent:inputs[cellId].value;
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
	const inputs = table.querySelectorAll('input'); 
	let t;
	let cellId = 0;
	for(let i=0; i<rows.length;i++){
		const cells=Array.from(rows[i].cells);
		t=[];
		for(let j=0;j<cells.length;j++){
			const cellContents = inputs[cellId].value; 
			t.push(cellContents);
			cellId++;
		}
		tableArray.push(t)
	}
	return tableArray;
}

const considerateConstractorsAverage = location=>{
	const table = tableToArray(document.querySelector('#considerContractorTbl'));
	const rowNum= table.length;
	let scoreTotal=0;
	for(let i=0;i<rowNum;i++){
		scoreTotal+=parseInt(table[i][1]);
	}
	const scoreAverage=(scoreTotal/rowNum).toFixed(0);
	(isNaN(scoreAverage) || scoreAverage<1)?document.querySelector(location).value='':document.querySelector(location).value = scoreAverage;
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
			if(staticFirstField==true&&k==0){
				bodyCell.setAttribute('id',bodyCellId);
				bodyCell.setAttribute('name',bodyCellId);
			}else{
				const bodyCellInput = document.createElement('input');
				bodyCellInput.setAttribute('type','text');
				bodyCellInput.setAttribute('id',bodyCellId);
				bodyCellInput.setAttribute('name',bodyCellId);
				bodyCell.appendChild(bodyCellInput);
			}
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

const numberformatter  = (val, isFinancial)=>{
	 const value = isFinancial==true?setCurrency(formatNum(addCommas(parseFloat(val)))):formatNum(addCommas(parseFloat(val)));
	 return value;
}

const formatNum = (val) => {
    const formattedValue = value < 0 ? '(' + output.replace('-', '') + ')' : output;
    return formattedValue;
}

const setCurrency = val =>{
	const currencyValue = val.chartAt(0)='('?val.substr(0,1)+'£'+val.substr(1,val.length):'£'+val;
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
      const rowOne = rows[i].getElementsByTagName("td")[0].getElementsByTagName("input")[0].value;
      const rowTwo = rows[i +1].getElementsByTagName("td")[0].getElementsByTagName("input")[0].value;
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

const lessThanZero = (figure, location)=>{
	const figureLength = figure.length;
	const numericFigure = (figure.charAt(0)=='£')?figure.substr(2,figureLength):figure;
	const fieldClass = parseInt(numericFigure)>0?'red-text center-align':
					   parseInt(numericFigure)<0?'green-text center-align':
					   'orange-text center-align';
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
	const fieldClass =(parseInt(monthlyKpiFigure)>parseInt(projectKpi))?'red-txt center-align':'green-text center-align'
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
	const considerateConstructorScore = document.querySelector('#considerateConstructorActual').value-document.querySelector('#considerateConstructorTarget').value;
	return isNaN(considerateConstructorScore)?'':considerateConstructorScore;
}

const findPercentage = (value,totalOf)=>{
	return isNaN(value)? '': ((value/totalOf)*100);
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
	createsubConOrderVarTbl();
	createHSMonthlyAuditTbl();
	document.querySelector('#weeksCompleted').value=result.timeValue.WeeksCompleted;
	document.querySelector('#weeksContracted').value=result.timeValue.WeeksContracted;
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
	document.querySelector('#adherencePctTarget').value = result.projectKPIs.AdherenceTgtPct;
	document.querySelector('#adherenceTarget').value = addCommas(result.projectKPIs.AdherenceTarget);
	document.querySelector('#adherenceActual').value = addCommas(result.projectKPIs.AdherenceActual);
	percentageDifference(parseInt(result.projectKPIs.AdherenceActual),parseInt(result.projectKPIs.AdherenceTarget),'#adherencePctActual');
	calculateVariance(document.querySelector('#adherencePctActual').value,result.projectKPIs.AdherenceTgtPct, '#adherencePctVariance');
	calculateVariance(result.projectKPIs.AdherenceActual, result.projectKPIs.AdherenceTarget, '#adherenceVariance' );
	//Monthly Predictability of Cash Flow
	document.querySelector('#monthlyCashflowPctTarget').value = result.projectKPIs.MonthlyCashFlowPredTgtPct;
	document.querySelector('#monthlyCashflowTarget').value = addCommas(result.valueInformation.MonthlyForecastTurnover);//same as forecastMTurnover
	document.querySelector('#monthlyCashflowActual').value = addCommas(result.valueInformation.ValInMonthTurnover);//same as valMTurnover
	calculateVariance(result.valueInformation.ValInMonthTurnover, result.valueInformation.MonthlyForecastTurnover, '#monthlyCashflowVariance' );
	percentageDifference(result.valueInformation.ValInMonthTurnover,result.valueInformation.MonthlyForecastTurnover,'#monthlyCashflowPctActual')
	calculatePercentageVariance(document.querySelector('#monthlyCashflowPctActual').value, result.projectKPIs.MonthlyCashFlowPredTgtPct, '#monthlyCashflowPctVariance' );
	//Quarterly Predictability of Cash Flow
	document.querySelector('#qtrCashflowPctTarget').value = result.projectKPIs.QtrCashFlowPredTgtPct;
	document.querySelector('#qtrCashflowTarget').value = addCommas(result.valueInformation.ForecastForQuarterTurnover);//same as forecastMTurnover
	document.querySelector('#qtrCashflowActual').value = addCommas(result.valueInformation.ValInQuarterTurnover);//same as valMTurnover
	calculateVariance(result.valueInformation.ValInQuarterTurnover, result.valueInformation.ForecastForQuarterTurnover, '#qtrCashflowVariance' );
	percentageDifference(result.valueInformation.ValInQuarterTurnover,result.valueInformation.ForecastForQuarterTurnover,'#qtrCashflowPctActual')
	calculatePercentageVariance(document.querySelector('#qtrCashflowPctActual').value, result.projectKPIs.QtrCashFlowPredTgtPct, '#qtrCashflowPctVariance' );
	//Non-Recoverable Works
	document.querySelector('#nonRecWorksPctTarget').value = result.projectKPIs.NonRecWorksTgtPct;
	document.querySelector('#nonRecWorksPctActual').value = ((result.projectKPIs.NonRecWorksActPct)*100).toFixed(0);
	document.querySelector('#nonRecWorksTarget').value = '£0';
	document.querySelector('#nonRecWorksActual').value = addCommas(result.projectKPIs.NonRecoverableWorks);
	calculateVariance(result.projectKPIs.NonRecoverableWorks, document.querySelector('#nonRecWorksTarget').value, '#nonRecWorksVariance');
	calculatePercentageVariance(document.querySelector('#nonRecWorksPctActual').value, result.projectKPIs.NonRecWorksTgtPct, '#nonRecWorksPctVariance' );
	//Predicability of Programme
	document.querySelector('#predOfProgramTarget').value = 100;
	document.querySelector('#predOfProgramActual').value = addCommas(result.projectKPIs.PredOfProgrammeAct);
	calculatePercentageVariance(result.projectKPIs.PredOfProgrammeAct,document.querySelector('#predOfProgramTarget').value,  '#predOfProgramVariance' );
	//HS Audit Score
	document.querySelector('#HSAuditPctTarget').value = result.projectKPIs.HAuditScoreTgtPct;
	HSMonthlyAuditAvgPct();
	calculatePercentageVariance(document.querySelector('#HSAuditPctActual').value,document.querySelector('#HSAuditPctTarget').value,'#HSAuditPctVariance');

	//Considerate Constructor
	document.querySelector('#considerateConstructorTarget').value=35;
	//considerateConstractorsAverage('_1_1_224_7_229_1');
	document.querySelector('#considerateConstructorPctTarget').value = findPercentage(parseFloat(document.querySelector('#considerateConstructorTarget').value),50);
	document.querySelector('#considerateConstructorPctActual').value = findPercentage(parseFloat(document.querySelector('#considerateConstructorActual').value),50);
	calculatePercentageVariance(document.querySelector('#considerateConstructorPctActual').value, document.querySelector('#considerateConstructorPctTarget').value, '#considerateConstructorPctVariance' );
	document.querySelector('#considerateConstructorVariance').value=findConsiderateConstructorVariance();
	//HS Accident Incident Rate
	document.querySelector('#HSAccidentRatePctTarget').value = result.projectKPIs.HSAccidentIncidentRateTgtPct;
	document.querySelector('#HSAccidentRatePctActual').value = result.projectKPIs.HSAccidentIncidentRateActPct;
	calculatePercentageVariance(document.querySelector('#HSAccidentRatePctActual').value, document.querySelector('#HSAccidentRatePctTarget').value, '#HSAccidentRatePctVariance');
	//Percentage Recycled
	document.querySelector('#pctRecycledPctTarget').value = result.projectKPIs.PctRecycledWasteTgt;
	document.querySelector('#pctRecycledPctActual').value = result.projectKPIs.PctRecycledWasteAct;
	calculatePercentageVariance(result.projectKPIs.PctRecycledWasteAct,result.projectKPIs.PctRecycledWasteTgt, '#pctRecycledPctVariance')

	//Waste per £100k
	document.querySelector('#waste100kTarget').value=15;
	document.querySelector('#waste100kActual').value = result.monthlyKPI[result.monthlyKPI.length-1].Wstper100kM3
	//Water m3 per £100k
	document.querySelector('#water100kActual').value = result.monthlyKPI[result.monthlyKPI.length-1].waterM3Per100k
	//Energy Kg CO2 per £100k
	document.querySelector('#energy100kActual').value = result.monthlyKPI[result.monthlyKPI.length-1].emitFromEnergyKgCo2Per100k

	//document.constructDate('#energy100kAct').innerHTML = document.constructDate('#emitFromEnergyKgCo2Per100k_'+projectMonths.length).innerHTML;
}

const populateSummaryKpiTable = ()=>{
	//Adherence to Prelim Budget
	document.querySelector('#adherence_Tgt').innerHTML = document.querySelector('#adherencePctTarget').value;
	document.querySelector('#adherence_Act').innerHTML = document.querySelector('#adherencePctActual').value;
	document.querySelector('#adherence_Var').innerHTML = document.querySelector('#adherencePctVariance').value
	moreThanZero('#adherence_Var');
	//document.querySelector().innerHTML = ;
	//Monthly Predictability of Cash Flow
	document.querySelector('#monthlyCashflow_Tgt').innerHTML = document.querySelector('#monthlyCashflowPctTarget').value; 
	document.querySelector('#monthlyCashflow_Act').innerHTML = document.querySelector('#monthlyCashflowPctActual').value;
	document.querySelector('#monthlyCashflow_Var').innerHTML = document.querySelector('#monthlyCashflowPctVariance').value;
	moreThanZero('#monthlyCashflow_Var');
	//Quarterly Predictability of Cash Flow
	document.querySelector('#qtrCashflow_Tgt').innerHTML = document.querySelector('#qtrCashflowPctTarget').value;
	document.querySelector('#qtrCashflow_Act').innerHTML = document.querySelector('#qtrCashflowPctActual' ).value;
	document.querySelector('#qtrCashflow_Var').innerHTML = document.querySelector('#qtrCashflowPctVariance').value
	moreThanZero('#qtrCashflow_Var');
	//Non-Recoverable Works
	document.querySelector('#nonRecWorks_Tgt').innerHTML = document.querySelector('#nonRecWorksPctTarget').value;
	document.querySelector('#nonRecWorks_Act').innerHTML = document.querySelector('#nonRecWorksPctActual').value;
	document.querySelector('#nonRecWorks_Var').innerHTML = document.querySelector('#nonRecWorksPctVariance').value,
	moreThanZero('#nonRecWorks_Var');
	//Predicability of Programme
	document.querySelector('#predOfProgram_Tgt').innerHTML = document.querySelector('#predOfProgramTarget').value;
	document.querySelector('#predOfProgram_Act').innerHTML = document.querySelector('#predOfProgramActual').value;
	document.querySelector('#predOfProgram_Var').innerHTML = document.querySelector('#predOfProgramVariance').value,
	moreThanZero('#predOfProgram_Var');
	//HS Audit Score
	document.querySelector('#HSAudit_Tgt').innerHTML = document.querySelector('#HSAuditPctTarget').value;
	document.querySelector('#HSAudit_Act').innerHTML = document.querySelector('#HSAuditPctActual').value;
	document.querySelector('#HSAudit_Var').innerHTML = document.querySelector('#HSAuditPctVariance').value;
	moreThanZero('#HSAudit_Var');
	//Considerate Constructor
	document.querySelector('#considerateConstructor_Tgt').innerHTML = document.querySelector('#considerateConstructorTarget').value;
	document.querySelector('#considerateConstructor_Act').innerHTML = document.querySelector('#considerateConstructorActual').value;
	document.querySelector('#considerateConstructor_Var').innerHTML = document.querySelector('#considerateConstructorPctVariance').value;
	moreThanZero('#considerateConstructor_Var')
	//HS Accident Incident Rate
	document.querySelector('#HSAccidentRate_Tgt').innerHTML = document.querySelector('#HSAccidentRatePctTarget').value;
	document.querySelector('#HSAccidentRate_Act').innerHTML = document.querySelector('#HSAccidentRatePctActual').value;
	document.querySelector('#HSAccidentRate_Var').innerHTML = document.querySelector('#HSAccidentRatePctVariance').value;
	moreThanZero('#HSAccidentRate_Var');
	//Monthly Usage Water
	document.querySelector('#water100k_Tgt').innerHTML = document.querySelector('#pctRecycledPctTarget').value;
	document.querySelector('#water100k_Act').innerHTML = document.querySelector('#pctRecycledPctActual').value;
	document.querySelector('#water100k_Var').innerHTML = document.querySelector('#pctRecycledPctVariance').value;
	moreThanZero('#water100k_Var')
	//Monthly Usage Energy
	document.querySelector('#energy100k_Tgt').innerHTML = document.querySelector('#energy100kTarget').value;
	document.querySelector('#energy100k_Act').innerHTML = document.querySelector('#energy100kActual').value;
	moreThanZero('#energy100k_Var')
	//Monthly Waste Skip
	document.querySelector('#pctSkipWaste_Tgt').innerHTML = document.querySelector('#pctRecycledPctTarget').value;
	document.querySelector('#pctSkipWaste_Act').innerHTML = document.querySelector('#pctRecycledPctActual').value;
	document.querySelector('#pctSkipWaste_Var').innerHTML = document.querySelector('#pctRecycledPctVariance').value;
	moreThanZero('#pctSkipWaste_Var');
	//Monthly Waste per 100k
	document.querySelector('#waste100k_Tgt').innerHTML = document.querySelector('#waste100kTarget').value;
	document.querySelector('#waste100k_Act').innerHTML = document.querySelector('#waste100kActual').value;
	document.querySelector('#waste100k_Var').innerHTML = document.querySelector('#waste100kVariance').value;
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
				document.querySelector(fieldID).value = fieldValue;
				if(i==1){moreThanZero(fieldID)};
			}
			index++;
		}
	}
}


//calculation functions
const calculateVariance = (fig1, fig2, targetField)=>{
	const difference = (parseFloat(fig1.replace(/,/g, '')) - parseFloat(fig2.replace(/,/g, ''))).toFixed(0);
	const numericVariance =formatNum(difference,true);
	document.querySelector(targetField).value = numericVariance
	moreThanZero(targetField);
}

const calculatePercentageVariance = (fig1, fig2, targetField)=>{
	const actualPercentage  = parseFloat(fig1);
	const targetPercentage = parseFloat(fig2);
	if(isNaN(actualPercentage)||actualPercentage==''||isNaN(targetPercentage)||targetPercentage==''){
		document.querySelector(targetField).value='';
	}else{
		const difference = actualPercentage - targetPercentage;
		const variance = ((difference/targetPercentage)*100).toFixed(1);
		const numericVariance = parseFloat(variance);
		document.querySelector(targetField).value = numericVariance;
		moreThanZero(targetField);
	}
}

const percentageDifference = (actualFig, targetFig, percentageField)=>{
	const actualDifference = ((Number(actualFig)/Number(targetFig))*100).toFixed(0);
	document.querySelector(percentageField).value=addCommas(parseInt(actualDifference))+'%'; 
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
					const bodyCellInput = document.createElement('input');
					const fieldID=(j==1)?valInfoRowIds[i]+'Turnover':valInfoRowIds[i]+'Margin';
					bodyCellInput.setAttribute('class','center-align');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id',fieldID); 
					bodyCellInput.setAttribute('name',fieldID);
					bodyCell.appendChild(bodyCellInput);
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
					const bodyRowInput = document.createElement('input');
					const fieldID=(k==1)?tblRows[i].toLowerCase()+'Gross':tblRows[i].toLowerCase()+'Movement';
					bodyRowInput.setAttribute('class','center-align');
					bodyRowInput.setAttribute('type','text');
					bodyRowInput.setAttribute('id',fieldID);
					bodyRowInput.setAttribute('name',fieldID);
					tblBodyRowCell.appendChild(bodyRowInput);
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
	const projectKpiTblRows=["Adherence to Prelim Budget", "Predictability to Cash Flow (month)", "Predictability to Cash Flow (Qtr)", "Non Recoverable Works", "Predictability of Programme", "H&S Audit Score", "H&S Accident Incident Rate", "Considerate Constructor Score", "Monthly Usage", "Energy kgCO2 per 100k", "Monthly Waste", "Waste per £100k Turnover"];
	
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
						projectKpiCellBody.innerHTML = projectKpiTblRows[m];
						break;
					case 1:
						if(m==8 && projectKpiCellNum==1){
							projectKpiCellBody.innerHTML = "Water m3 per £100k";
						}else if(m==10 && projectKpiCellNum==1){
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
				const bodyCellInput = document.createElement('input');
				bodyCellInput.setAttribute('class','center-align');
				bodyCellInput.setAttribute('id',rowID);
				bodyCellInput.setAttribute('name', rowID);
				bodyCell.appendChild(bodyCellInput);
			}
			bodyRow.appendChild(bodyCell)
		}
		tableBody.appendChild(bodyRow);
	}
	completionDateTbl.appendChild(tableBody);
	tableLocation.appendChild(completionDateTbl);
	document.querySelector('#contractualEndDate').value = result.timeValue.ConCompDate;
	document.querySelector('#estimateEndDate').value = result.timeValue.EstCompDate;
}

//summary section - fill tables
const populateValuationInfoTbl = ()=>{
	document.querySelector('#valTurnover').value = formatNum(result.valueInformation.ValtoDateTurnover,true);
	document.querySelector('#valMargin').value = formatNum(result.valueInformation.ValtoDateMargin,true);
	document.querySelector('#monthlyValTurnover').value = formatNum(result.valueInformation.ValInMonthTurnover,true);
	document.querySelector('#monthlyValMargin').value = formatNum(result.valueInformation.ValInMonthMargin,true);
	document.querySelector('#monthlyForecastTurnover').value = formatNum(result.valueInformation.MonthlyForecastTurnover,true);
	document.querySelector('#monthlyForecastMargin').value = formatNum(result.valueInformation.MonthlyForecastMargin,true);
	calculateVariance(result.valueInformation.ValInMonthTurnover, result.valueInformation.MonthlyForecastTurnover , '#monthlyVarianceTurnover');
	calculateVariance(result.valueInformation.ValInMonthMargin, result.valueInformation.MonthlyForecastMargin, '#monthlyVarianceMargin');
	document.querySelector('#qtrValueTurnover').value = formatNum(result.valueInformation.ValInQuarterTurnover,true);
	document.querySelector('#qtrValueMargin').value = formatNum(result.valueInformation.ValInQuarterMargin,true);
	document.querySelector('#qtrForecastTurnover').value = formatNum(result.valueInformation.ForecastForQuarterTurnover,true);
	document.querySelector('#qtrForecastMargin').value = formatNum(result.valueInformation.ForecastForQuarterMargin,true);
	calculateVariance(result.valueInformation.ValInQuarterTurnover, result.valueInformation.ForecastForQuarterTurnover, '#qtrVarianceTurnover');
	calculateVariance(result.valueInformation.ValInQuarterMargin, result.valueInformation.ForecastForQuarterMargin, '#qtrVarianceMargin');
	document.querySelector('#weeksCompleted').value = weeksCompleted;
	document.querySelector('#weeksContracted').value = result.timeValue.WeeksContracted;
	document.querySelector('#timeCompleted').value = result.timeValue.TimeCompleted;
	document.querySelector('#timeRemaining').value = result.timeValue.TimeRemaining;
	document.querySelector('#valueCompleted').value = result.timeValue.ValueCompleted;
	document.querySelector('#valueRemaining').value = result.timeValue.ValueRemaining;
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
				document.querySelector(fieldID).value = formatNum(overheadData[dataRef],true);
				moreThanZero(fieldID);
			}else{
				document.querySelector(fieldID).value= formatNum(overheadData[dataRef],true);
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
			recordOfLabourFigures.push(document.querySelector('#week'+(rowNums)+weekDay).value);
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
			recordOfLabourTotals.push(parseInt(document.querySelector(fieldID).value));
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
		let costFlowDate = getProgressDate(costFlowData[a][0]);
		costFlowGraphData.push({x:costFlowDate,val1:costFlowData[a][1],val2:costFlowData[a][2],val3:costFlowData[a][3]});
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
	const considerateContractorsData = CwdTableToArray(document.querySelector('#considerContractorTbl'));
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
	    {label: 'Part Site', value: document.querySelector('#partSiteValue').value},
	    {label: 'Whole Site', value: document.querySelector('#wholeSiteValue').value},
	    {label: 'Replacement', value: document.querySelector('#replacementValue').value}
	  ],
	  resize:true,
	  colors:['#B20000','#57C61C','#FFC300']
	});
}

const materialsReasonChart = location=>{
	Morris.Donut({
	  element: location,
	  data: [
	    {label: 'Client Change', value: document.querySelector('#clientChangeValue').value},
	    {label: 'Theft', value: document.querySelector('#theftValue').value},
	    {label: 'Waste', value: document.querySelector('#wasteValue').value},
	    {label: 'Damage', value: document.querySelector('#damageValue').value}
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
		const rowInput = document.createElement('input');
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
		rowInput.setAttribute('id',rowCellId);
		rowInput.setAttribute('name',rowCellId);
		if(i>0){rowInput.setAttribute('type','text')};
		if(i==6){rowInput.setAttribute('value',result.timeValue.ConCompDate)};
		if(i==7){rowInput.setAttribute('value',result.timeValue.EstCompDate);}
		rowHeader.appendChild(rowHeaderText);
		rowContent.appendChild(rowInput);
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
	const completedTime = document.querySelector('#timeCompleted').value;
	const timeRemaining = document.querySelector('#timeRemaining').value;
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
	const completedValueData = document.querySelector('#valueCompleted').value;
	const remainingValueData = document.querySelector('#valueRemaining').value;
	
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
				const bodyCellInput = document.createElement('input');
				if(j>0){
					bodyCellInput.setAttribute('type','text');
					if(j!=4){
						bodyCellInput.setAttribute('id',cellRef);
						bodyCellInput.setAttribute('name',cellRef);
						bodyCell.appendChild(bodyCellInput);
					}
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
				const bodyCellInput = document.createElement('input');
				bodyCellInput.setAttribute('type','text');
				bodyCellInput.setAttribute('id',fieldID);
				bodyCellInput.setAttribute('name',fieldID);
				tblBodyRowCell.appendChild(bodyCellInput);
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
				document.querySelector(fieldID).value = kpiData[Prop][innerProp];
				if(innerProp=='Wstper100kM3'||innerProp=='emitFromEnergyKgCo2Per100k'||innerProp=='waterM3Per100k'){
					switch(innerProp){
						case 'Wstper100kM3':
							targetComparison(document.querySelector('#waste100kTarget').value,document.querySelector(fieldID).value =  kpiData[Prop][innerProp], fieldID);
							break;
						case 'emitFromEnergyKgCo2Per100k':
							targetComparison(document.querySelector('#energy100kTarget').value,document.querySelector(fieldID).value =  kpiData[Prop][innerProp], fieldID);
							break;
						case 'waterM3Per100k':
							targetComparison(document.querySelector('#water100kTarget').value,document.querySelector(fieldID).value =  kpiData[Prop][innerProp], fieldID);
							break;
					}
				}
			tblRowIndex++;
			}
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
			const bodyCellInput = document.createElement('input');
			bodyCellInput.setAttribute('type','text');
			if(k==0){
				const fieldID = 'CCS';
				const fieldContentSting = result.CCS[j].Date;
				const fieldContentDate = fieldContentSting.split('/')[1]+'/'+fieldContentSting.split('/')[0]+'/'+ fieldContentSting.split('/')[2];
				bodyCellInput.setAttribute('class','datepicker');
				bodyCellInput.setAttribute('id','_datepicker_'+fieldID);
				bodyCellInput.setAttribute('onChange','constructDate(fieldContentSting,fieldID)');
				bodyCellInput.setAttribute('value',fieldContentDate);
				bodyCell.appendChild(bodyCellInput);
			}else{
				
				bodyCellInput.setAttribute('id','considerateConstructorsScore');
				bodyCellInput.setAttribute('name','considerateConstructorsScore');
				bodyCellInput.setAttribute('value',result.CCS[j].Score);
				bodyCell.appendChild(bodyCellInput);
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
		const fieldInput = document.createElement('input');
		fieldInput.setAttribute('type','text');
		const cellId = recordOfLabourCell(i)
		const fieldID = 'week'+currentWeekNumber	+cellId;
		fieldInput.setAttribute('id',fieldID);
		fieldInput.setAttribute('name',fieldID);
		singleField.appendChild(fieldInput);
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
			document.querySelector(fieldId).value = result.NewRecordOfLabour[weekNumber][prop];
		}
	}
	fieldId = '#week'+weekNum+'Total';
	document.querySelector(fieldId).value =totalLabour;
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
			document.querySelector(cellId).value=cellValue;
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
					(i==0)?fillStaticField(cellId,cellValue):document.querySelector(cellId).value = cellValue;
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
				const bodyCellInput = document.createElement('input');
				const bodyCellId = (k==1)?projectMonths[j]+'OriginalCum':
									(k==2)?projectMonths[j]+'CurrentCum':
									projectMonths[j]+'ActualCum';
				const bodyCellValue = (k==1)?result.financialData[2][projectMonths[j]]:
									(k==2)?result.financialData[0][projectMonths[j]]:
									result.financialData[1][projectMonths[j]]
				bodyCellInput.setAttribute('type','text');
				bodyCellInput.setAttribute('id',projectMonths[j]+bodyCellId);
				bodyCellInput.setAttribute('name',projectMonths[j]+bodyCellId);
				bodyCellInput.value = bodyCellValue;
				bodyCell.appendChild(bodyCellInput);
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
				const bodyCellInput = document.createElement('input');
				const bodyCellId = (k==1)?projectMonths[j]+'CumCertifiedCash':
									(k==2)?projectMonths[j]+'CurrentCum':
									projectMonths[j]+'ActualCum';
				const bodyCellValue = (k==1)?result.financialData[0][projectMonths[j]]:
										(k==2)?cumTgtCostflow:
										result.financialData[3][projectMonths[j]];
				bodyCellInput.setAttribute('type','text');
				bodyCellInput.setAttribute('id','costFlow'+projectMonths[j]+'CumCertifiedCash');
				bodyCellInput.setAttribute('name','costFlow'+projectMonths[j]+'CumCertifiedCash');
				bodyCellInput.value =bodyCellValue; 
				bodyCell.appendChild(bodyCellInput);
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
				const cellInput = document.createElement('input');
				const bodyCellId= colsIds[k]+(j+1);
				cellInput.setAttribute('id',bodyCellId);
				cellInput.setAttribute('name',bodyCellId);
				bodyCell.appendChild(cellInput);
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
					document.querySelector(fieldID).value = result.SubConFinData[prop][innerProp];
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
				const bodyCellInput = document.createElement('input');
				const fieldId=(k==1)?projectMonths[j]+'Pct':projectMonths[j]+'Value';
				const fieldValue=(k==1)?percentage:score;
				bodyCellInput.setAttribute('type','text');
				bodyCellInput.setAttribute('id',fieldId);
				bodyCellInput.setAttribute('name',fieldId);	
				bodyCellInput.value = fieldValue;
				bodyCell.appendChild(bodyCellInput);

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
			(j==0)? fillStaticField(cellId, cellValue):	document.querySelector(cellId).value = cellValue;
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
			const cellInput = document.createElement('input');
			const fieldID = (k==0)?'accidentReport'+(parseInt(j)+1):
							(k==1)?'accidentReport'+(parseInt(j)+1)+'Trade':
							(k==2)?'accidentReport'+(parseInt(j)+1)+'Type':
							(k==3)?'accidentReport'+(parseInt(j)+1)+'LostDays':
							'accidentReport'+(parseInt(j)+1)+'Riddor';
			if(k==0){
				cellInput.setAttribute('class','datepicker');
				cellInput.setAttribute('type','text');
				cellInput.setAttribute('id','_datepicker_'+fieldID);
				cellInput.setAttribute('onChange','constructDate()');
			}else{
				cellInput.setAttribute('type','text');
				cellInput.setAttribute('id',fieldID);
			}
			rowCell.appendChild(cellInput);
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
		const headerRowCellTxt= i=0?document.createTextNode('Month'):
								i=1?document.createTextNode('Riddor (7Days +)'):
								document.createTextNode('Non-Riddor Lost time 0-6 Days');
		headerRowCell.appendChild(headerRowCellTxt);
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
					const bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id',fieldId);
					bodyCellInput.setAttribute('name',fieldId);
					bodyCellInput.setAttribute('value',0);
					bodyRowCell.appendChild(bodyCellInput);
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
	document.querySelector("#HSAuditActual").value = (HSsum/numberOfMonths).toFixed(0);
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
	document.querySelector("#HSAuditPctActual").value = (HSsum/numberOfMonths).toFixed(0);
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
					document.querySelector(fieldID).value = result.AccidentReport[prop][innerProp];
					switch(innerProp){
						case 'Type':
							const type = result.AccidentReport[prop][innerProp];
							const typeTableID = '#'+getTypeFieldID(type);
							const currentTypeValue = ++(document.querySelector(typeTableID).value);
							document.querySelector(typeTableID).value=currentTypeValue;
							break;
						case 'Trade':
							const trade = getTradeCategory(result.AccidentReport[prop][innerProp]);
							const tradeTableID = '#'+getTradeFieldID(trade);
							const currentTradeValue = ++(document.querySelector(tradeTableID).value);
							document.querySelector(tradeTableID).value=currentTradeValue;
							break;
						case 'LostDays':
							const newdaysLost =parseInt(result.AccidentReport[prop][innerProp].replace(/[^0-9 ]/g, ""));
							const lostDaysFieldID='#'+findLostDaysID(dateMonth,dateYear,'nonRiddor');
							totalLostDays=parseInt(document.querySelector(lostDaysFieldID).value);
							if(newdaysLost<7){
								totalLostDays+=newdaysLost;
								document.querySelector(lostDaysFieldID).value=totalLostDays;
							}
							document.querySelector(lostDaysFieldID).setAttribute('value',totalLostDays);
							break;
						case 'Riddor':
							const riddorFieldID='#'+findLostDaysID(dateMonth,dateYear,'riddor');
							const riddor = parseInt(result.AccidentReport[prop][innerProp]);
							const totalRiddor = parseInt(document.querySelector(riddorFieldID).value)+riddor;
							document.querySelector(riddorFieldID).value=totalRiddor;
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