	
var X = XLSX;
var result = {};
var con;
var weeksCompleted;
var projectMonths;
var pageList=[];
window.setfmt = setfmt;
var xlf = document.getElementById('xlf');
var global_wb;

if(xlf.addEventListener) xlf.addEventListener('change', handleFile, false);

//Excel Import Functions - DO NOT CHANGE!
function fixdata(data) {
	var o = "", l = 0, w = 10240;
	for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
	o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
	return o;
}

function to_json(workbook) {
	workbook.SheetNames.forEach(function(sheetName) {
		var roa = X.utils.sheet_to_json(workbook.Sheets[sheetName]);
		var startPoint;
		if(roa.length >= 0){
			if (sheetName=="considerateConstructors" ||sheetName=="SubConFinData" || sheetName=="HSData" || sheetName=="monthlyKPI"|| sheetName=="NewRecordOfLabour"|| sheetName=="financialData"|| sheetName=="TradeAccidents"|| sheetName=="AccidentReport" || sheetName=="MaterialOrdersCategories" || sheetName=="MaterialOrdersType"|| sheetName=="CCS"|| sheetName=="CWDsTotal"|| sheetName=="CWDsMonthly" ){
				var subConData=[];
				var totalSubConData=roa;
				for(var j=0;j<totalSubConData.length;j++){
					var arrayConNumber =totalSubConData[j].ContractNumber; 
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
				for(var i=0;i<roa.length;i++){
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
	createDataStructures();
	createGraphsStructures();	
	//getmonthlyCWDTotals();
	getCWDTotals();
	populateTables();
	createGraphsContent();
	//createGraphs();
	return result;
}

function createDataStructures(){
	createSummarySections();
	createProjectKpiSection();
	createProgressSection('#progress');
	createSubContractorSection('#subContractorData');
	createFinancialDataSection();
	createHSDataSection('#hsData');
}

function createGraphsStructures(){
	createProgressGraphs();
	createFinancialGraphs();
	createCcsGraphs();
	createSubConFinGraphs('#subcontractorGraphs');
	createHSGraphSection();
}

function createGraphsContent(){
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

function createSummaryContents(){
	createProjectKPITbl();
}

function process_wb(wb) {
	global_wb = wb;
	var output = "";
	output = JSON.stringify(to_json(wb), 2, 2);
}

function setfmt() {if(global_wb) process_wb(global_wb); }


function handleFile(e) {
	var files = e.target.files;
	var f = files[0];
	{
		var reader = new FileReader();
		//var name = f.name;
		reader.onload = function(e) {
			var data = e.target.result;
			var wb;
			var arr = fixdata(data);
			wb = X.read(btoa(arr), {type: 'base64'});
			process_wb(wb);
		};
		reader.readAsArrayBuffer(f);
	}
}

//Lookup functions
function getmonthlyCWDTotals(){
}

function getCWDTotals(){
}

function getRecordOfLabourDay(i){
	var dayOfWeek;
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

function getTradeFigures(){
	
}

function getTypeFigures(){
	
}

function getCurrentYear(){
	var d = new Date();
	var thisYear = d.getFullYear();
	return thisYear;
}

function getCurrenMonth(){
	var d = new Date();
	var monthNum = d.getMonth()+1;
	return monthNum;
}

function getContractNumber(){
	var conNumber = con.substring(1,5);
	return conNumber
}

function getAccidentReport(){	
}

function constructDate(fieldContents, fieldID) {
    var str = fieldContents;
    var seperator = str.indexOf(",");
    var year = str.substring((seperator+2), (seperator+6));
    var date = "D/"+year;
   	var month = getMonth(str, seperator);
    date += "/"+month;
    day = getDay(str);
    date += "/"+day+":0:0:0";
    document.getElementById(fieldID).value = date;
}

function getMonth(str, comma){
	var Str = str
	var writtenMonth="";
	var endOfMonth = comma
	if(Str.charAt(1)==" "){
    	writtenMonth=Str.substring(2,endOfMonth);
    	var monthNumber = getMonthNumber(writtenMonth);
    	return monthNumber;
    }
    else{
    	writtenMonth=Str.substring(3,endOfMonth);
    	var monthNumber = getMonthNumber(writtenMonth);
    	return monthNumber;
    }
}

function getMonthNumber(writtenMonth){
	var monthNum;
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

function getMonthName(monthNumber){
	var writtenMonth;
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

function getDay(givenDate){
	var definedDate = givenDate;
	if(definedDate.charAt(1)==" "){
		return definedDate.charAt(0);
	}
	else{
		return definedDate.substring(0,2);
	}
}

function getTypeCategory(type){
	var typeCategory;
	var userType=type.toLowerCase();
	var typeSplit = userType.indexOf('/');
	if(typeSplit!==-1){
		userType = userType.substr(0,typeSplit);
	}
	var typesCategories={
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

function getTradeCategory(trade){
	var tradeName = trade.toLowerCase();
	var tradeCategory;
	var tradeFieldIdLookup={
		'asbestosremoval':function(){tradeCategory='AsbestosRemoval';},
		'brickwork':function(){tradeCategory='Brickwork';},
		'carpenter':function(){tradeCategory='Carpentry';},
		'carpentry':function(){tradeCategory='Carpentry';},
		'cladding':function(){tradeCategory='Cladding';},
		'cleaning':function(){tradeCategory='Cleaning';},
		'decorator':function(){tradeCategory='PaintingandDecoration';},
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
		'paintinganddecoration':function(){tradeCategory='PaintingandDecoration';},
		'painter':function(){tradeCategory='PaintingandDecoration';},
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

function getTradeFieldID(trade){
	var tradeName =trade.toLowerCase(); 
	var fieldID;
	var tradeFieldIdLookup={
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
		'paintinganddecoration':function(){fieldID='PaintingandDecorationValue';},
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

function getTypeFieldID(type){
	var typeName =getTypeCategory(type); 
	var fieldID;
	var typeFieldIdLookup={
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
function createDataCard(containerClass, containerID, cardContentID, Title){
	var container = createDiv(containerID+'Section', containerClass);
	var card = createDiv(containerID+'Card','card');
	var title = createTitle('h5',Title);
	var content = createDiv(cardContentID, 'card-content');
	content.appendChild(title);
	card.appendChild(content);
	container.appendChild(card);
	return container;
}

function createMultiDataCard(containerClass, id, numOfItems, Title, subItemTitles){
	var container = createDiv(id+'Section', containerClass);
	var card = createDiv(id+'Card','card');
	var sectionSize = 12/numOfItems;
	var title = createTitle('h5',Title);
	var content = createDiv(id+'Content', 'card-content row');
	if(title =""){content.appendChild(title)};
	for(var i =0; i<numOfItems;i++){
		var innerSection = createDiv(subItemTitles[i].replace(/\s/g, '')+'Tbl','col s12 l'+sectionSize);
		var innerSectionTitle = createTitle('h5',subItemTitles[i]);
		innerSection.appendChild(innerSectionTitle);
		content.appendChild(innerSection);
	}
	card.appendChild(content);
	container.appendChild(card);
	return container;
}

function createGraphCard(containerClass, containerID, cardContentID, Title){
	var container = createDiv(containerID+'Section', containerClass);
	var card = createDiv(containerID+'Card','card');
	var title = createTitle('h5',Title);
	var content = createDiv(cardContentID, 'card-content');
	var graphDiv = createDiv(containerID+'Graph');
	content.appendChild(title);
	content.appendChild(graphDiv);
	card.appendChild(content);
	container.appendChild(card);
	return container;
}

function createMultiGraphCard(containerClass, id, numOfItems, graphIds, subItemTitles){
	var container = createDiv(id+'Section', containerClass);
	var card = createDiv(id+'Card','card');
	var sectionSize = 12/numOfItems;
	var content = createDiv(id+'Content', 'card-content row');
	for (var i=0;i<numOfItems;i++){
		var graphDiv = createDiv(graphIds[i]+'Graph');
		graphDiv.setAttribute('class','col s12 l'+sectionSize);
		if(subItemTitles[i]!=""){
			var graphTitle = createTitle('h5',subItemTitles[i]);
			graphDiv.appendChild(graphTitle);
		}
		content.appendChild(graphDiv);
	}
	card.appendChild(content);
	container.appendChild(card);
	return container;
}

//General Functions

function hideSections(sectionName){
	var section = ['inputData','summary-page', 'progressGraphs','financialGraph','subcontractorGraphs','hsGraphs','progress', 'ccsCosts','subContractorData','financialData','hsData','projectKPIs','timeValueGraphs'];
	for (var i=0;i<section.length;i++){
		if(sectionName!=section[i]){
			document.querySelector('#'+section[i]).style.display = "none";
		}else{
			document.querySelector('#'+section[i]).style.display = "block";
		}
	}
	document.body.scrollTop = 0;
}

function hideInput(){
	var inputFields = document.querySelector("#inputData");
	inputFields.style.display="none";
}

function conNum(){con=document.querySelector("#contractNumber").value;}


function addCommas(intNum){return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');}

function asciiToChar(textToConvert){
	var name = textToConvert;
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


function tableToArray(table){
	var tableArray=[];
	var rows = Array.from(table.rows);
	rows.shift();
	var inputs = table.getElementsByTagName( 'input' ); 
	var cells;
	var t;
	var cellId = 0;
	for(var i=0; i<rows.length;i++){
		cells=Array.from(rows[i].cells);
		t=[];
		for(var j=0;j<cells.length;j++){
			if(j!=0){
				var cellContents = inputs[cellId].value; 
				t.push(cellContents);
				cellId++;
			}else{
				var cellContents = cells[j].textContent;
				t.push(cellContents);
			}
		}
		tableArray.push(t)
	}
	return tableArray;
}

function CwdTableToArray(table){
	var tableArray=[];
	var rows = Array.from(table.rows);
	rows.shift();
	var inputs = table.querySelectorAll('input'); 
	var cells;
	var t;
	var cellId = 0;
	for(var i=0; i<rows.length;i++){
		cells=Array.from(rows[i].cells);
		t=[];
		for(var j=0;j<cells.length;j++){
			var cellContents = inputs[cellId].value; 
			t.push(cellContents);
			cellId++;
		}
		tableArray.push(t)
	}
	return tableArray;
}

function considerateConstractorsAverage(location){
	var table = tableToArray(document.querySelector('#considerContractorTbl'));
	var rowNum= table.length;
	var scoreTotal=0;
	var scoreAverage;
	for(var i=0;i<rowNum;i++){
		scoreTotal+=parseInt(table[i][1]);
	}
	scoreAverage=(scoreTotal/rowNum).toFixed(0);
	if(isNaN(scoreAverage) || scoreAverage<1){
		document.querySelector(location).value='';
	}else{
		document.querySelector(location).value = scoreAverage;
	}
}

function createTitle(titleSize, titleText){
	var titleElement = document.createElement(titleSize);
	var titleElementText = document.createTextNode(titleText);
	titleElement.appendChild(titleElementText);
	return titleElement;
}

function createDiv(divId,divClass){
	var divElement = document.createElement('div');
	divElement.setAttribute('id',divId);
	if(divClass!= undefined){
		divElement.setAttribute('class',divClass);
	}
	return divElement;
}

function formatDate(datetag, rowName)
{
	var dateFields = document.getElementsByClassName(rowName);
	var dateTime = datetag;
	var dateDay= dateTime.split("/")[1];
	var dateMonth= dateTime.split("/")[0];
	var dateYear = dateTime.split("/")[2];
	for(var i=0; i<dateFields.length; i++){

			dateFields[i].innerHTML= dateDay+"/"+ dateMonth +"/"+ dateYear;
	}
}

function sortTwoColTable(tableId) {
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.querySelector(tableId);
  switching = true;
  while (switching) {
    switching = false;
    rows = table.rows;
    for (i = 1; i < (rows.length - 1); i++) {
      shouldSwitch = false;
      rowOne = rows[i].getElementsByTagName("td")[0].getElementsByTagName("input")[0].value;
      rowTwo = rows[i +1].getElementsByTagName("td")[0].getElementsByTagName("input")[0].value;
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

function moreThanZero(figure, location){
	if(String(figure).charAt(0)=='£'){
		var figureLength = figure.length;
		var numericFigure = figure.substr(2,figureLength);
	}else{
		var numericFigure = figure;
	}
	if(parseInt(numericFigure)>0){
		document.querySelector(location).setAttribute('class','green-text center-align');
	}
	else if(parseInt(numericFigure)<0){
		document.querySelector(location).setAttribute('class','red-text center-align');
	}else{
		document.querySelector(location).setAttribute('class','orange-text center-align');
	}
}

function lessThanZero(figure, location){
	if(figure.charAt(0)=='£'){
		var figureLength = figure.length;
		var numericFigure = figure.substr(2,figureLength);
	}else{
		var numericFigure = figure;
	}
	if(parseInt(numericFigure)>0){
		document.querySelector(location).setAttribute('class','red-text center-align');
	}
	else if(parseInt(numericFigure)<0){
		document.querySelector(location).setAttribute('class','green-text center-align');
	}else{
		document.querySelector(location).setAttribute('class','orange-text center-align');
	}
}

function lessThanZero2Colours(figure, location){
	if(figure.charAt(0)=='£'){
		var figureLength = figure.length;
		var numericFigure = figure.substr(2,figureLength);
	}else{
		var numericFigure = figure;
	}
	if(parseInt(numericFigure)>0){
		document.querySelector(location).setAttribute('class','red-text center-align');
	}else{
		document.querySelector(location).setAttribute('class','green-text center-align');
	}
}

function moreThanOnePct(figure, location){
	if(figure.charAt(0)=='£'){
		var figureLength = figure.length;
		var numericFigure = figure.substr(2,figureLength);
	}else{
		var numericFigure = figure;
	}
	if(parseInt(numericFigure)>0.99){
		document.querySelector(location).setAttribute('class','red-text center-align');
	}
	else{
		document.querySelector(location).setAttribute('class','green-text center-align');
	}
}

function targetComparison(projectKpiFigure, monthlyKpiFigure, location){
	var projectKpi = projectKpiFigure
	if(projectKpi==''){projectKpi='0'};
	if(parseInt(monthlyKpiFigure)>parseInt(projectKpi)){
		document.querySelector(location).setAttribute('class','red-text center-align');
	}else{
		document.querySelector(location).setAttribute('class','green-text center-align');
	}
}

function progressTrafficLight(figure, location){
	var progressFigure= parseInt(figure);
	if(progressFigure < -2){
		document.querySelector(location).setAttribute('class','red-text center-align');
	}else if(progressFigure>=0){
		document.querySelector(location).setAttribute('class','green-text center-align');
	}else{
		document.querySelector(location).setAttribute('class','orange-text center-align');
	}
}

//Populating tables
function findConsiderateConstructorVariance(){
	var considerateConstructorScore = document.querySelector('#considerateConstructorActual').value-document.querySelector('#considerateConstructorTarget').value;
	if(isNaN(considerateConstructorScore)){
		return '';
	}
	else{
		return considerateConstructorScore;
	}
}

function findPercentage(value,totalOf){
	if(isNaN(value)){
		return '';
	}else{
		return ((value/totalOf)*100);
	}
}

function getLastMonthlyKpiItem(){
	monthlyKPIdata = result.monthlyKPI;
	var indexOfLastItem = result.monthlyKPI.length;
	return indexOfLastItem;
}

function getLastTurnoverItem(){
	turnoverData = result.Turnover
}

function populateTables(){
	weeksCompleted = parseInt(result.timeValue.WeeksCompleted);
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
	sortTwoColTable('#monthlyCwdTbl');
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
	//ProjectKPIs
	//populateSummaryProjectKpiTbl();
	populateRecordOfLabourTbl();
	//copyConsiderateContractorTbl();
	//tblAccidentType('ByTypeTbl');
	//tblAccidentTrade('ByTradeTbl');
	createDaysLostTbl();
	createAccidentReportTbl();
	populateAccidentReportTbl();
	createSummaryContents();
	populateSummaryKpiTable();
}

function populateKpiTable(){
	//Adherence to Prelim Budget
	document.querySelector('#adherencePctTarget').value = result.projectKPIs.AdherenceTgtPct;
	document.querySelector('#adherenceTarget').value = result.projectKPIs.AdherenceTarget;
	document.querySelector('#adherenceActual').value = result.projectKPIs.AdherenceActual;
	percentageDifference(result.projectKPIs.AdherenceActual,result.projectKPIs.AdherenceTarget,'#adherencePctActual');
	calculateVariance(document.querySelector('#adherencePctActual').value,result.projectKPIs.AdherenceTgtPct, '#adherencePctVariance');
	calculateVariance(result.projectKPIs.AdherenceActual, result.projectKPIs.AdherenceTarget, '#adherenceVariance' );
	//Monthly Predictability of Cash Flow
	document.querySelector('#monthlyCashflowPctTarget').value = result.projectKPIs.MonthlyCashFlowPredTgtPct;
	document.querySelector('#monthlyCashflowTarget').value = result.valueInformation.QtrTurnOverMonthForeCast;//same as forecastMTurnover
	document.querySelector('#monthlyCashflowActual').value = result.valueInformation.MonthlyValue;//same as valMTurnover
	calculateVariance(result.valueInformation.MonthlyValue, result.valueInformation.QtrTurnOverMonthForeCast, '#monthlyCashflowVariance' );
	percentageDifference(result.valueInformation.MonthlyValue,result.valueInformation.QtrTurnOverMonthForeCast,'#monthlyCashflowPctActual')
	calculatePercentageVariance(document.querySelector('#monthlyCashflowPctActual').value, result.projectKPIs.MonthlyCashFlowPredTgtPct, '#monthlyCashflowPctVariance' );
	//Quarterly Predictability of Cash Flow
	document.querySelector('#qtrCashflowPctTarget').value = result.projectKPIs.QtrCashFlowPredTgtPct;
	document.querySelector('#qtrCashflowTarget').value = result.valueInformation.QtrTurnOverCumForeCast;//same as forecastMTurnover
	document.querySelector('#qtrCashflowActual').value = result.valueInformation.QtrTurnOverCumActual;//same as valMTurnover
	calculateVariance(result.valueInformation.QtrTurnOverCumActual, result.valueInformation.QtrTurnOverCumForeCast, '#qtrCashflowVariance' );
	percentageDifference(result.valueInformation.QtrTurnOverCumActual,result.valueInformation.QtrTurnOverCumForeCast,'#qtrCashflowPctActual')
	calculatePercentageVariance(document.querySelector('#qtrCashflowPctActual').value, result.projectKPIs.QtrCashFlowPredTgtPct, '#qtrCashflowPctVariance' );
	//Non-Recoverable Works
	document.querySelector('#nonRecWorksPctTarget').value = result.projectKPIs.NonRecWorksTgtPct;
	document.querySelector('#nonRecWorksPctActual').value = ((result.projectKPIs.NonRecWorksActPct)*100).toFixed(0);
	document.querySelector('#nonRecWorksTarget').value = '0';
	document.querySelector('#nonRecWorksActual').value = result.projectKPIs.NonRecoverableWorks;
	calculateVariance(result.projectKPIs.NonRecoverableWorks, document.querySelector('#nonRecWorksTarget').value, '#nonRecWorksVariance');
	calculatePercentageVariance(document.querySelector('#nonRecWorksPctActual').value, result.projectKPIs.NonRecWorksTgtPct, '#nonRecWorksPctVariance' );
	//Predicability of Programme
	document.querySelector('#predOfProgramTarget').value = 100;
	document.querySelector('#predOfProgramActual').value = result.projectKPIs.PredOfProgrammeAct;
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

function populateSummaryKpiTable(){
	//Adherence to Prelim Budget
	document.querySelector('#adherence_Tgt').innerHTML = document.querySelector('#adherencePctTarget').value;
	document.querySelector('#adherence_Act').innerHTML = document.querySelector('#adherencePctActual').value;
	document.querySelector('#adherence_Var').innerHTML = document.querySelector('#adherencePctVariance').value;;
	//Monthly Predictability of Cash Flow
	document.querySelector('#monthlyCashflow_Tgt').innerHTML = document.querySelector('#monthlyCashflowPctTarget').value; 
	document.querySelector('#monthlyCashflow_Act').innerHTML = document.querySelector('#monthlyCashflowPctActual').value;
	document.querySelector('#monthlyCashflow_Var').innerHTML = document.querySelector('#monthlyCashflowPctVariance').value;
	//Quarterly Predictability of Cash Flow
	document.querySelector('#qtrCashflow_Tgt').innerHTML = document.querySelector('#qtrCashflowPctTarget').value;
	document.querySelector('#qtrCashflow_Act').innerHTML = document.querySelector('#qtrCashflowVariance' ).value;
	document.querySelector('#qtrCashflow_Var').innerHTML = document.querySelector('#qtrCashflowPctVariance').value;
	//Non-Recoverable Works
	document.querySelector('#nonRecWorks_Tgt').innerHTML = document.querySelector('#nonRecWorksPctTarget').value;
	document.querySelector('#nonRecWorks_Act').innerHTML = document.querySelector('#nonRecWorksPctActual').value;
	document.querySelector('#nonRecWorks_Var').innerHTML = document.querySelector('#nonRecWorksPctVariance').value;
	//Predicability of Programme
	document.querySelector('#predOfProgram_Tgt').innerHTML = document.querySelector('#predOfProgramTarget').value;
	document.querySelector('#predOfProgram_Act').innerHTML = document.querySelector('#predOfProgramActual').value;
	document.querySelector('#predOfProgram_Var').innerHTML = document.querySelector('#predOfProgramVariance').value;
	//HS Audit Score
	document.querySelector('#HSAudit_Tgt').innerHTML = document.querySelector('#HSAuditPctTarget').value;
	document.querySelector('#HSAudit_Act').innerHTML = document.querySelector('#HSAuditPctActual').value;
	document.querySelector('#HSAudit_Var').innerHTML = document.querySelector('#HSAuditPctVariance').value;

	//Considerate Constructor
	document.querySelector('#considerateConstructor_Tgt').innerHTML = document.querySelector('#considerateConstructorTarget').value;
	document.querySelector('#considerateConstructor_Act').innerHTML = document.querySelector('#considerateConstructorActual').value;
	document.querySelector('#considerateConstructor_Var').innerHTML = document.querySelector('#considerateConstructorPctVariance').value;

	//HS Accident Incident Rate
	document.querySelector('#HSAccidentRate_Tgt').innerHTML = document.querySelector('#HSAccidentRatePctTarget').value;
	document.querySelector('#HSAccidentRate_Act').innerHTML = document.querySelector('#HSAccidentRatePctActual').value;
	document.querySelector('#HSAccidentRate_Var').innerHTML = document.querySelector('#HSAccidentRatePctVariance').value;
	
	//Monthly Usage Water
	document.querySelector('#water100k_Tgt').innerHTML = document.querySelector('#pctRecycledPctTarget').value;
	document.querySelector('#water100k_Act').innerHTML = document.querySelector('#pctRecycledPctActual').value;
	document.querySelector('#water100k_Var').innerHTML = document.querySelector('#pctRecycledPctVariance').value;

	//Monthly Usage Energy
	document.querySelector('#energy100k_Tgt').innerHTML = document.querySelector('#energy100kTarget').value;
	document.querySelector('#energy100k_Act').innerHTML = document.querySelector('#energy100kActual').value;
	
	//Monthly Waste Skip
	document.querySelector('#pctSkipWaste_Tgt').innerHTML = document.querySelector('#pctRecycledPctTarget').value;
	document.querySelector('#pctSkipWaste_Act').innerHTML = document.querySelector('#pctRecycledPctActual').value;
	document.querySelector('#pctSkipWaste_Var').innerHTML = document.querySelector('#pctRecycledPctVariance').value;
	
	//Monthly Waste per 100k
	document.querySelector('#waste100k_Tgt').innerHTML = document.querySelector('#waste100kTarget').value;
	document.querySelector('#waste100k_Act').innerHTML = document.querySelector('#waste100kActual').value;
	document.querySelector('#waste100k_Var').innerHTML = document.querySelector('#waste100kVariance').value;
}

function populateProgressTbl(){
	var progressInfo = result.progress;
	var index=1;
	for(var key in progressInfo){
		if(key!='ContractNumber'){
			for(var i=0;i<2;i++){
				switch(i){
					case 0:
						document.querySelector('#'+key+'Date').value=key;
						break;
					case 1:
						document.querySelector('#'+key+'Weeks').value = result.progress[key]
						break;
				}
			}
			index++;
		}
	}
}


//calculation functions
function calculateVariance(fig1, fig2, targetField){
	var difference = (parseFloat(fig1.replace(/,/g, '')) - parseFloat(fig2.replace(/,/g, ''))).toFixed(0);
	var numericVariance = difference;
	moreThanZero(document.querySelector(targetField).value = numericVariance, targetField);
}

function calculatePercentageVariance(fig1, fig2, targetField){
	if(isNaN(fig1)||fig1==''||isNaN(fig2)||fig2==''){
		document.querySelector(targetField).value='';
	}else{
		var difference = (parseFloat(fig1.replace(/,/g, '')) - parseFloat(fig2.replace(/,/g, '')));
		var variance = ((difference/fig2)*100).toFixed(1);
		var numericVariance = parseFloat(variance);
		moreThanZero(document.querySelector(targetField).value = numericVariance, targetField);
	}
}

function percentageDifference(actualFig, targetFig, percentageField){
	var actualDifference = ((Number(actualFig)/Number(targetFig))*100).toFixed(0);
	document.querySelector(percentageField).value=actualDifference; 
}

//summary section - structure

function createSummarySections(){
	createTopSummaryRow('#summary-page');
	createMiddleSummaryRow('#summary-page');
	createBottomSummaryRow('#summary-page');
}

function createTopSummaryRow(location){
	var rowLocation = document.querySelector(location);
	var rowContents = createDiv('topRow', 'row');
	var summaryProgress = createGraphCard('col s12 l6', 'summaryProgress', 'summaryProgressContnet', 'Progress');
	rowContents.appendChild(summaryProgress);
	var leftDiv= createMultiDataCard('col s12 l6', 'financial', 2, 'Financial', ['Value Information','Summary of Overhead Contribution']);
	rowContents.appendChild(leftDiv);

	rowLocation.appendChild(rowContents);
}

function createMiddleSummaryRow(location){
	var rowLocation = document.querySelector(location);
	var rowContents = createDiv('middleRow','row');
	var hsGraph = createGraphCard('col s12 l6', 'hsGraph', 'hsGraphSection', 'Health and Safety');
	rowContents.appendChild(hsGraph);
	var projectKpiTable = createDataCard('col s12 l6', 'summaryProjectKpi', 'summaryProjectKpi', 'Project KPIs');
	rowContents.appendChild(projectKpiTable);
	rowLocation.appendChild(rowContents);
}

function createBottomSummaryRow(location){
	var rowLocation = document.querySelector(location);
	var rowContents = createDiv('bottomRow','row');
	var timeValueData = createDataCard('col s12 l6', 'completionDate', 'completionTable', 'CompletionDates');
	rowContents.appendChild(timeValueData);
	var timeGraph = createGraphCard('col s6', 'timeGraph', 'timeGraphSection', 'Time');
	rowContents.appendChild(timeGraph);
	var valueGraph = createGraphCard('col s6', 'valueGraph', 'valueeGraphSection', 'Value');
	rowContents.appendChild(valueGraph);
	rowLocation.appendChild(rowContents);
}

//summary section - create tables

function createValuationInfoTbl(){
	var tableLocation = document.querySelector('#ValueInformationTbl')
	var valInfoTable = document.createElement('table');
	valInfoTable.setAttribute('class','striped')

	var tableHeader = document.createElement('thead');
	var HeaderRow = document.createElement('tr');
	for(var i=0;i<3;i++){
		var rowCell = document.createElement('th');
		rowCell.setAttribute('class','center-align');
		if(i==1){
			var rowCellText = document.createTextNode('Turnover');
			rowCell.appendChild(rowCellText);
		}else if(i==2){
			var rowCellText = document.createTextNode('Margin');
			rowCell.appendChild(rowCellText);
		}
		HeaderRow.appendChild(rowCell);
	}
	tableHeader.appendChild(HeaderRow);
	valInfoTable.appendChild(tableHeader);
	var valInfoRowIds=['val','monthlyVal','monthlyForecast','monthlyVariance','qtrValue','qtrForecast','qtrVariance'];
	var valInfoRows=['Valuation to Date','Value in Month', 'Forecast for Month', 'Variance','Value in Quarter','Forecast for Quarter','Variance'];
	var tableBody = document.createElement('tbody');
	for(var i=0; i<valInfoRows.length;i++){
		var bodyRow = document.createElement('tr');
		var fieldID=valInfoRowIds[i];
		for(var j=0;j<3;j++){
			switch(j){
				case 0:
					var bodyCell = document.createElement('th');
					var bodyCellText = document.createTextNode(valInfoRows[i]);
					bodyCell.appendChild(bodyCellText);
					break;
				case 1:
					var bodyCell = document.createElement('td');
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('class','center-align');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id',fieldID+'Turnover'); 
					bodyCellInput.setAttribute('name',fieldID+'Turnover');
					bodyCell.appendChild(bodyCellInput);
					break;
				case 2:
					var bodyCell = document.createElement('td');
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('class','center-align');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id',fieldID+'Margin'); 
					bodyCellInput.setAttribute('name',fieldID+'Margin');
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

function createOverheardContributionTbl(){
	var overheadContributionTblLoc = document.querySelector('#SummaryofOverheadContributionTbl');
	var overheadContributionTbl = document.createElement('table');
	overheadContributionTbl.setAttribute('class','striped responsive');
	var tblHeader = document.createElement('thead');
	var tblHeaderRow = document.createElement('tr');
	var tblRows=["SubContractors", "Materials", "Consultants", "Stats", "Preliminaries", "Others", "OHP", "Total"];
	for(var i = 0;i<3;i++){
		var tblHeaderRowCell = document.createElement('th');
		tblHeaderRowCell.setAttribute('class','center-align');
		var tblHeaderRowCellText;
		switch(i){
			case 0:
				break;
			case 1:
				tblHeaderRowCellText = document.createTextNode('Gross');
				tblHeaderRowCell.appendChild(tblHeaderRowCellText);
				break;
			case 2:
				tblHeaderRowCellText = document.createTextNode('Movement');
				tblHeaderRowCell.appendChild(tblHeaderRowCellText);
				break;
		}
		tblHeaderRow.appendChild(tblHeaderRowCell);
	}
	tblHeader.appendChild(tblHeaderRow)
	overheadContributionTbl.appendChild(tblHeader);
	var tblBody = document.createElement('tbody');
	var rowNum = tblRows.length;
	for (var i=0; i<rowNum; i++){
		var tblBodyRow = document.createElement('tr');
		for(var k=0; k<rowNum; k++){
			var tblBodyRowCell;
			var tblBodyRowCellText;
			var fieldID=tblRows[i].toLowerCase();
			switch(k){
				case 0:
					tblBodyRowCell = document.createElement('th');
					tblBodyRowCellText = document.createTextNode(tblRows[i]);
					tblBodyRowCell.appendChild(tblBodyRowCellText);
					tblBodyRow.appendChild(tblBodyRowCell);
					break;
				case 1:
					tblBodyRowCell = document.createElement('td');
					var bodyRowInput = document.createElement('input');
					bodyRowInput.setAttribute('class','center-align');
					bodyRowInput.setAttribute('type','text');
					bodyRowInput.setAttribute('id',fieldID + 'Gross');
					bodyRowInput.setAttribute('name',fieldID + 'Gross');
					tblBodyRowCell.appendChild(bodyRowInput);
					tblBodyRow.appendChild(tblBodyRowCell);
					break;
				case 2:
					tblBodyRowCell = document.createElement('td');
					var bodyRowInput = document.createElement('input');
					bodyRowInput.setAttribute('class','center-align');
					bodyRowInput.setAttribute('type','text');
					bodyRowInput.setAttribute('id',fieldID + 'Movement');
					bodyRowInput.setAttribute('name',fieldID + 'Movement');
					tblBodyRowCell.setAttribute('class','center-align');
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

function createProjectKPITbl(){
	var projectKpiTblLoc = document.querySelector('#summaryProjectKpi');
	var projectKpiTbl = document.createElement('table');
	projectKpiTbl.setAttribute('class','striped');
	var projectKpiHeader = document.createElement('thead');
	var projectKpiHeaderNames = ["","","Target","Acutal","Variance",];
	var kpiHeaderRow = document.createElement('tr');
	for(var i=0;i<5;i++){
		var projectKpiHeaderCell = document.createElement("th");
		if(i>0){
			var projectKpiHeaderText = document.createTextNode(projectKpiHeaderNames[i]);
			projectKpiHeaderCell.appendChild(projectKpiHeaderText);
		}
		kpiHeaderRow.appendChild(projectKpiHeaderCell);
		projectKpiHeader.appendChild(kpiHeaderRow);
	}
	projectKpiTbl.appendChild(projectKpiHeader);
	var projectKpiBody = document.createElement('tbody')
	var projectKpiTblRows=["Adherence to Prelim Budget", "Predictability to Cash Flow (month)", "Predictability to Cash Flow (Qtr)", "Non Recoverable Works", "Predictability of Programme", "H&S Audit Score", "H&S Accident Incident Rate", "Considerate Constructor Score", "Monthly Usage", "Energy kgCO2 per 100k", "Monthly Waste", "Waste per £100k Turnover"];
	
	var projectKpiTblRowId=["adherence","monthlyCashflow","qtrCashflow","nonRecWorks","predOfProgram","HSAudit","HSAccidentRate","considerateConstructor",	"water100k","energy100k","pctSkipWaste","waste100k"];
	for (var projectKpiRowNum=0; projectKpiRowNum<projectKpiTblRows.length; projectKpiRowNum++){
		var projectKpiBodyRow = document.createElement("tr");
		var cellCount;
		switch(projectKpiRowNum){
			case 0:
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
			case 9:
			case 11:
				cellCount = 4;
				break;
			case 8:
			case 10:
				cellCount = 5;
				break;
		}
		if(cellCount==4){
			if(projectKpiRowNum<=7){
				for(var projectKpiCellNum=0; projectKpiCellNum<cellCount;projectKpiCellNum++){
					var projectKpiCellBody = document.createElement("td")
					switch(projectKpiCellNum){
						case 0:
							projectKpiCellBody.setAttribute('colspan','2');
							projectKpiCellBody.setAttribute('id', projectKpiTblRowId[projectKpiRowNum]+'_Ttl');
							projectKpiCellBody.innerHTML = projectKpiTblRows[projectKpiRowNum];
							break;
						case 1:
							projectKpiCellBody.setAttribute('id', projectKpiTblRowId[projectKpiRowNum]+'_Tgt');
							break;
						case 2:
							projectKpiCellBody.setAttribute('id', projectKpiTblRowId[projectKpiRowNum]+'_Act');
							break;
						case 3:
							projectKpiCellBody.setAttribute('id', projectKpiTblRowId[projectKpiRowNum]+'_Var');
							break;
					}
					projectKpiBodyRow.appendChild(projectKpiCellBody);
				}
			}else{
				for(var projectKpiCellNum=0; projectKpiCellNum<cellCount;projectKpiCellNum++){
					var projectKpiCellBody = document.createElement("td")
					switch(projectKpiCellNum){
						case 0:
							projectKpiCellBody.innerHTML = projectKpiTblRows[projectKpiRowNum];
							break;
						case 1:
							projectKpiCellBody.setAttribute('id', projectKpiTblRowId[projectKpiRowNum]+'_Tgt');
							break;

						case 2:
							projectKpiCellBody.setAttribute('id', projectKpiTblRowId[projectKpiRowNum]+'_Act');
							break;

						case 3:
							projectKpiCellBody.setAttribute('id', projectKpiTblRowId[projectKpiRowNum]+'_Var');
							break;



					}
					projectKpiBodyRow.appendChild(projectKpiCellBody);
				}
			}
		}else{
			for(var projectKpiCellNum=0; projectKpiCellNum<cellCount;projectKpiCellNum++){
					var projectKpiCellBody = document.createElement("td")
					switch(projectKpiCellNum){
						case 0:
							projectKpiCellBody.setAttribute('rowspan','2');
							projectKpiCellBody.innerHTML = projectKpiTblRows[projectKpiRowNum];
							break;
						case 1:
							if(projectKpiRowNum==8 && projectKpiCellNum==1){
								projectKpiCellBody.innerHTML = "Water m3 per £100k";
							}else if(projectKpiRowNum==10 && projectKpiCellNum==1){
								projectKpiCellBody.innerHTML = "Percentage Skip Waste Recycled";
							}
							break;
						case 2:
							projectKpiCellBody.setAttribute('id', projectKpiTblRowId[projectKpiRowNum]+'_Tgt');
							break;
						case 3:
							projectKpiCellBody.setAttribute('id', projectKpiTblRowId[projectKpiRowNum]+'_Act');
							break;

						case 4:
							projectKpiCellBody.setAttribute('id', projectKpiTblRowId[projectKpiRowNum]+'_Var');
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

function createCompletionDatesTbl(){
	var tableLocation = document.querySelector('#completionTable');
	var completionDateTbl = document.createElement('table');
	completionDateTbl.setAttribute('class','striped');
	var tableBody = document.createElement('tbody');
	var row;
	var rowID;
	for(var j=0; j<2; j++){
		var bodyRow = document.createElement('tr');
		if(j==0){
			row = 'Contractual End Date';
		}else{
			row ='Estimate End Date';
		}
		rowID = row.charAt(0).toLowerCase() + row.substr(1).replace(/\s/g, '');
		for(var k=0;k<2;k++){
			if(k==0){
				var bodyCell = document.createElement('td');
				var bodyCellText = document.createTextNode(row);
				bodyCell.appendChild(bodyCellText);
			}else{
				var bodyCell = document.createElement('td');
				var bodyCellInput = document.createElement('input');
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
function populateValuationInfoTbl(){
	document.querySelector('#valTurnover').value = result.valueInformation.CumulativeValueGross;
	document.querySelector('#valMargin').value = result.valueInformation.CumulativeProfitGross;
	document.querySelector('#monthlyValTurnover').value = result.valueInformation.MonthlyValue;
	document.querySelector('#monthlyValMargin').value = result.valueInformation.MonthlyProfit;
	document.querySelector('#monthlyForecastTurnover').value = parseInt(result.valueInformation.QtrTurnOverMonthForeCast);
	document.querySelector('#monthlyForecastMargin').value = result.valueInformation.QtrProfMonthForeCast;
	calculateVariance(result.valueInformation.MonthlyValue, result.valueInformation.QtrTurnOverMonthForeCast, '#monthlyVarianceTurnover');
	calculateVariance(result.valueInformation.MonthlyProfit, result.valueInformation.QtrProfMonthForeCast, '#monthlyVarianceMargin');
	document.querySelector('#qtrValueTurnover').value = result.valueInformation.QtrTurnOverCumActual;
	document.querySelector('#qtrValueMargin').value = result.valueInformation.QtrProfCumActual;
	document.querySelector('#qtrForecastTurnover').value = result.valueInformation.QtrTurnOverCumForeCast;
	document.querySelector('#qtrForecastMargin').value = result.valueInformation.QtrProfCumForecast;
	calculateVariance(result.valueInformation.QtrTurnOverCumActual, result.valueInformation.QtrTurnOverCumForeCast, '#qtrVarianceTurnover');
	calculateVariance(result.valueInformation.QtrProfCumActual, result.valueInformation.QtrProfCumForecast, '#qtrVarianceMargin');
	document.querySelector('#weeksCompleted').value = weeksCompleted;
	document.querySelector('#weeksContracted').value = result.timeValue.WeeksContracted;
	document.querySelector('#timeCompleted').value = result.timeValue.TimeCompleted;
	document.querySelector('#timeRemaining').value = result.timeValue.TimeRemaining;
	document.querySelector('#valueCompleted').value = result.timeValue.ValueCompleted;
	document.querySelector('#valueRemaining').value = result.timeValue.ValueRemaining;
}

function populateOverheadContributionTbl(){
	var tblRows=['SubContractors', 'Materials', 'Consultants', 'Stats', 'Preliminaries', 'Others', 'OHP', 'Total'];
	var rowNum = tblRows.length;
	var overheadData = result.overheadContribution;
	var fieldID;
	for(var i=0; i<8; i++){
		for(var j=0;j<2;j++){
			var dataRef;
			switch(j){
				case 0:
					dataRef = 'Gross'+ tblRows[i];
					fieldID='#'+tblRows[i].toLowerCase()+'Gross';
					if(dataRef=='GrossTotal'){
						moreThanZero(document.querySelector(fieldID).value = overheadData[dataRef],fieldID);
					}else{
						document.querySelector(fieldID).value=overheadData[dataRef];
					}
					break;
				case 1:
					dataRef ='Movement'+ tblRows[i];
					fieldID='#'+tblRows[i].toLowerCase()+'Movement';
					if(dataRef=='MovementTotal'){
						moreThanZero(document.querySelector(fieldID).value = overheadData[dataRef],fieldID);
					}else{
						document.querySelector(fieldID).value=overheadData[dataRef];
					}
					break;
			}
		}
	}
}

//Progress Graphs Section - Structure
function createProgressGraphs(){
	createProgressGraphTop('#progressGraphs');
	createProgressGraphBottom('#progressGraphs')
}

function createProgressGraphTop(location){
	var sectionLocation = document.querySelector(location);
	var ProgressGraphSection = createDiv('progressGraphRow','row');
	var monthlyProgress = createGraphCard('col s12', 'monthProgressSection', 'monthProgressContent', 'Monthly Progress');
	ProgressGraphSection.appendChild(monthlyProgress);
	sectionLocation.appendChild(ProgressGraphSection);
}

function createProgressGraphBottom(location){
	var sectionLocation = document.querySelector(location);
	var ProgressGraphSection = createDiv('progressGraphRow','row');
	var weekRecOfLbrGraph = createGraphCard('col s12 l6', 'weeklyRecOfLbrGraphSection', 'weeklyRecOfLbrGraphContent', 'Record Of Labour for Most Recent Week');
	ProgressGraphSection.appendChild(weekRecOfLbrGraph);
	var recOfLbrGraph = createGraphCard('col s12 l6', 'recOfLbrGraphSection', 'recOfLbrGraphContent', 'Record Of Labour Throughout Contract');
	ProgressGraphSection.appendChild(recOfLbrGraph);
	sectionLocation.appendChild(ProgressGraphSection);
}


//Progress Graphs Section
function progressGraph(chartLocation){
	var progressData = result.progress;
	delete progressData.ContractNumber;
	var graphData=[];
	for(var prop in progressData){
		var progressDate = getProgressDate(prop);
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

function getProgressDate(progressDate){
	var progressMonth = progressDate.slice(0,3);
	var progressMonthNumber; 
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
	var formattedDate = '20'+progressDate.slice(3,5)+'-'+progressMonthNumber;
	return formattedDate;
}

function getRecordOfLbrFigures(){
	var recOfLbrTbl = document.querySelector("#recOfLbr");
	var rowNums = document.querySelector("#recOfLbr").rows.length-1;
	var cellNum = recOfLbrTbl.rows[rowNums].cells.length;
	var recordOfLabourFigures = [];
	for(var i=0;i<cellNum;i++){
		if(i!=0&&i!=8){
			var weekDay = getRecordOfLabourDay(i);
			recordOfLabourFigures.push(document.querySelector('#week'+(rowNums)+weekDay).value);
		}
	}
	return recordOfLabourFigures;
}

function getRecordOfLbrTotals(){
	var recOfLbrTbl = document.querySelector("#recOfLbr");
	var rowNums = document.querySelector("#recOfLbr").rows.length-1;
	var cellNum = recOfLbrTbl.rows[rowNums].cells.length;
	var recordOfLabourTotals = [];
	for(var i=0;i<rowNums;i++){
		if(i>1){
			var fieldID = '#week'+i+'Total';
			recordOfLabourTotals.push(parseInt(document.querySelector(fieldID).value));
		}
	}
	return recordOfLabourTotals;
}

function recordOfLabourTotalsGraph(location){
	var overallRecordOfLabourData = getRecordOfLbrTotals();
	var recOfLbrTtlGraphData =[]
	var weekNumber=document.querySelector('#week1WeekNum').value;
	for(var prop in overallRecordOfLabourData){
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

function currentWeekRecordOfLabourGraph(location){
	var recordOfLabourData = getRecordOfLbrFigures();
	var recOfLbrGraphData =[]
	var days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
	var dayIndex = 0;
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
function createFinancialGraphs(){
	createFinancialGraphTop('#financialGraph');
	createFinancialGraphBottom('#financialGraph')
}

function createFinancialGraphTop(location){
	var sectionLocation = document.querySelector(location);
	var topFinGraphs = createDiv('finGraphsTop','row');
	var predictabilityGraph= createGraphCard('col s12 l6', 'predictabilitySection', 'predictabilityContent', 'Predictability (Turnover)');
	topFinGraphs.appendChild(predictabilityGraph);
	var cwdGraph = createGraphCard('col s12 l6', 'cwdGraphSection', 'cwdGraphContent', 'Contractors Written Direction Total To Date');
	topFinGraphs.appendChild(cwdGraph);
	sectionLocation.appendChild(topFinGraphs);
}

function createFinancialGraphBottom(location){
	var sectionLocation = document.querySelector(location);
	var bottomFinGraphs = createDiv('finGraphBottom','row');
	var costflowGraph = createGraphCard('col s12 l6', 'costflowGraphSection', 'costflowGraphContent', 'Costflow');
	bottomFinGraphs.appendChild(costflowGraph);
	var monthlyCwds = createGraphCard('col s12 l6', 'monthlyCwdGraphSection', 'monthlyCwdGraphContent', 'Contractors Written Direction in Month');
	bottomFinGraphs.appendChild(monthlyCwds);
	sectionLocation.appendChild(bottomFinGraphs);
}

//Financial Graph Section - Graphs
function createTurnoverGraph(location){
	var turnoverData = result.financialData;
	var turnoverGraphData=[];
	var lengthValue = 0;
	var propertyKeys=[];
	for(var i=0;i<turnoverData.length;i++){
		delete turnoverData[i].ContractNumber;
		delete turnoverData[i].Column;
	}

	for(var prop in turnoverData){
		var tempValue = Object.keys(turnoverData[prop]).length;
		if(parseInt(prop)>0){
			if(tempValue<lengthValue){
				lengthValue=tempValue;
				propertyKeys=Object.keys(turnoverData[prop]);
			};
		}else{
			lengthValue=tempValue;
		}
	}
	for(var j=0;j<lengthValue;j++){
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

function costflowGraph(location){
	var costFlowData = tableToArray(document.querySelector('#costflowTbl'));
	var costFlowGraphData=[];
	var lengthValue = 0;
	var propertyKeys=[];
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

function totalCwdToDate(location){
	totalCwdData = CwdTableToArray(document.querySelector('#totalCwdTbl'));
	totalCwdGraphData = [];
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

function monthlyCwdToDate(location){
	monthlyCwdData = CwdTableToArray(document.querySelector('#monthlyCwdTbl'));
	monthlyCwdGraphData = [];
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
function createCcsGraphs(){
	createCcsGraphTop('#ccsCosts');
	createCssGraphBottom('#ccsCosts')
}

function createCcsGraphTop(location){
	var sectionLocation = document.querySelector(location);
	var ccsTopGraphSection = createDiv('ccsTopRow','row');
	var considerateConstructorsGraph = createGraphCard('col s12', 'consConstructorsGraphSection', 'consConstructorsGraphContent', 'Considerate Constructors');
	ccsTopGraphSection.appendChild(considerateConstructorsGraph);
	sectionLocation.appendChild(ccsTopGraphSection);
}

function createCssGraphBottom(location){
	var sectionLocation = document.querySelector(location);
	var ccsBottomGraphSection = createDiv('progressGraphRow','row');
	var matsSummaryGraph = createGraphCard('col s12 l6', 'matsSummaryGraphSection', 'matsSummaryGraphContent', 'Summary Of Materials Ordered');
	ccsBottomGraphSection.appendChild(matsSummaryGraph);
	var matsReplacementGraph = createGraphCard('col s12 l6', 'matsReplacementGraphSection', 'matsReplacementContent', 'Reasons for Replacement');
	ccsBottomGraphSection.appendChild(matsReplacementGraph);
	sectionLocation.appendChild(ccsBottomGraphSection);
}

//CCS & Costs Graphs Section - Graphs
function copyConsiderateContractorTbl(){
	var considerateContractorTbl = document.querySelector("#considerContractorTbl");
	var clone = considerateContractorTbl.cloneNode(true);
	clone.id="ccsContractorTbl"
	document.querySelector("#consConstructorsGraphSectionGraph").appendChild(clone);
}

function considerateContractorsGraph(location){
	var considerateContractorsData = CwdTableToArray(document.querySelector('#considerContractorTbl'));
	var contractorGraphData=[]
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

function materialsOrderedChart(location){
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

function materialsReasonChart(location){
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
function createSubConFinGraphs(location){
	var sectionLocation = document.querySelector(location);
	var subConFinGraphSection = createDiv('subConFinRow','row');
	var subConFinGraph = createGraphCard('col s12', 'subConFinGraphSection', 'subConFinGraphContent', 'Subcontractors Orders and Variations');
	subConFinGraphSection.appendChild(subConFinGraph);
	sectionLocation.appendChild(subConFinGraphSection);
}

//Sub-Contractor Finance Graph Section - Graphs
function subContractorOrderVariations(location){
	subbieData = result.SubConFinData.length;
	subbieGraphData=[];
	for(var i=0;i<subbieData;i++){
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
function createHSGraphSection(){
	createHSGraphTopSection('#hsGraphs');
	createHSGraphBottomSection('#hsGraphs');
}

function createHSGraphTopSection(location){
	var sectionLocation = document.querySelector(location);
	var HSTopGraphSection = createDiv('HSGraphTopRow','row');
	var monthlyAuditGraph = createGraphCard('col s12 l6', 'monthlyAuditGraphSection', 'monthlyAuditGraphContent', 'Health and Safety');
	HSTopGraphSection.appendChild(monthlyAuditGraph);
	var accidentsGraph = createGraphCard('col s12 l6', 'accidentsGraphGraphSection', 'accidentsGraphContent', 'Number Of Days Lost Due To Accidents');
	HSTopGraphSection.appendChild(accidentsGraph);
	sectionLocation.appendChild(HSTopGraphSection);
}

function createHSGraphBottomSection(location){
	var sectionLocation = document.querySelector(location);
	var HSBottomGraphSection = createDiv('HSGraphBottomRow','row');
	var HSDataTables = createDataCard('col s12 l4','HsDataTableSection','HsDataTableContent','');
	HSBottomGraphSection.appendChild(HSDataTables);
	//var bottomGraphs = createMultiGraphCard('col s12 l8', 'HSGraph', 2, 'HSGraph', ['By Trade','By Type']);
	var accidentByTradeGraph = createGraphCard('col s12 l4', 'accidentByTradeGraphSection', 'accidentByTradeGraphContent', 'By Trade');
	HSBottomGraphSection.appendChild(accidentByTradeGraph);
	var accidentByTypeGraph = createGraphCard('col s12 l4', 'accidentByTypeGraphSection', 'accidentByTypeGraphContent', 'By Type');
	HSBottomGraphSection.appendChild(accidentByTypeGraph);
	sectionLocation.appendChild(HSBottomGraphSection);
}

//HS Graph Section
function createEnforcementActionTbl(){
	var tableLocation = document.querySelector('#enforcementActionTbl');
	var enforementTbl = document.createElement('table');
	var tableHeader = document.createElement('thead');
	var headerRow = document.createElement('tr');
	for(var i =0;i<2;i++){
		var headerCell = document.createElement('th');
		if(i==1){
			var headerCellText = document.createTextNode('Number');
			headerCell.appendChild(headerCellText);
		}
		headerRow.appendChild(headerCell);
	}
	tableHeader.appendChild(headerRow);
	var tableBody = document.createElement('tbody');
	for(var j = 0;j<2;j++){
		var bodyRow = document.createElement('tr');
		for(var k = 0; k<2;k++){
			var bodyRowCell = document.createElement('td')
			var bodyRowCellText;
			if(k=0){
				switch(i){
					case 0:
							bodyRowCellText = document.createTextNode('HSE Enforcement Action');
							bodyRowCell.appendChild(bodyRowCellText);
							break;
					case 1:
							bodyRowCellText = document.createTextNode('Higgins Enforcement Action');
							bodyRowCell.appendChild(bodyRowCellText);
							break;
				}
			}
		}
	}
}

//HS Graph Section
function tradeAccidentGraph(location){
	accidentTradeData = tableToArray(document.querySelector('#accidentsTrade'));
	accidentTradeGraphData=[];
	var count = 0;
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

function typeAccidentGraph(location){
	accidentTypeData = tableToArray(document.querySelector('#accidentsType'));
	accidentTypeGraphData=[];
	var count = 0;
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

function HSMonthlyAuditGraph(location){
	var auditData = tableToArray(document.querySelector('#monthlyAuditTbl'));
	var auditGraphData=[]
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

function daysLostGraph(location){
	daysLostData = tableToArray(document.querySelector('#daysLostTbl'));
	daysLostGraphData=[];
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

function createEnforcementActionTbl(){
	var tableLocation = document.querySelector('#enforcementActionTbl');
	var enforementTbl = document.createElement('table');
	var tableHeader = document.createElement('thead');
	var headerRow = document.createElement('tr');
	for(var i =0;i<2;i++){
		var headerCell = document.createElement('th');
		if(i==1){
			var headerCellText = document.createTextNode('Number');
			headerCell.appendChild(headerCellText);
		}
		headerRow.appendChild(headerCell);
	}
	tableHeader.appendChild(headerRow);
	var tableBody = document.createElement('tbody');
	for(var j = 0;j<2;j++){
		var bodyRow = document.createElement('tr');
		for(var k = 0; k<2;k++){
			var bodyRowCell = document.createElement('td')
			var bodyRowCellText;
			if(k=0){
				switch(i){
					case 0:
							bodyRowCellText = document.createTextNode('HSE Enforcement Action');
							bodyRowCell.appendChild(bodyRowCellText);
							break;
					case 1:
							bodyRowCellText = document.createTextNode('Higgins Enforcement Action');
							bodyRowCell.appendChild(bodyRowCellText);
							break;
				}
			}
		}
	}
}

//TimeValue - structure
function createTimeStats(location){
	var sectionLocation = document.querySelector(location);
	var timeStatsSection = createDiv('timeStats','row');
	var timeTableContainer = createDataCard('col s12 l6', 'timeTable', 'timeTable', 'Time');
	timeStatsSection.appendChild(timeTableContainer);
	var timeChartContainer = createGraphCard('col s12 l6', 'timeChart', 'timeChartContent', 'Time');
	timeStatsSection.appendChild(timeChartContainer);
	sectionLocation.appendChild(timeStatsSection);
}

function createValueStats(location){
	var sectionLocation = document.querySelector(location);
	var valueStatsSection = createDiv('valueStats','row');
	var valueTableContainer = createDataCard('col s12 l6', 'valueTable', 'valueTable', 'Value')
	valueStatsSection.appendChild(valueTableContainer);
	var valueChartContainer = createGraphCard('col s12 l6', 'valueChart', 'valueChartContent', 'Value')
	valueStatsSection.appendChild(valueChartContainer);
	sectionLocation.appendChild(valueStatsSection);
}

//timeValue - create tables
function createTimeTable(){
	var tableLocation = document.querySelector('#completionTable');
	var timeTable = document.createElement('table');
	timeTable.setAttribute('class','striped');
	var tableHeader = document.createElement('thead');
	var headerRow = document.createElement('th');
	headerRow.setAttribute('colspan','2');
	var headerTxt = document.createElement('br');
	headerRow.appendChild(headerTxt);
	tableHeader.appendChild(headerRow)
	timeTable.appendChild(tableHeader);
	var tableBody = document.createElement('tbody');
	for(var i=0; i<8;i++){
		var tableRow = document.createElement('tr');
		var rowHeader = document.createElement('td');
		var rowContent= document.createElement('td');
		var rowInput = document.createElement('input')
		switch(i){
			case 0:
				var rowHeaderText=document.createTextNode('Weeks Completed');
				rowInput.setAttribute('id','weeksCompleted');
				rowInput.setAttribute('name','weeksCompleted');
				break;
			case 1:
				var rowHeaderText=document.createTextNode('Weeks Contracted');
				rowInput.setAttribute('type','text');
				rowInput.setAttribute('id','weeksContracted');
				rowInput.setAttribute('name','weeksContracted');
				break;
			case 2:
				var rowHeaderText=document.createTextNode('Time Completed %');
				rowInput.setAttribute('type','text');
				rowInput.setAttribute('id','timeCompleted');
				rowInput.setAttribute('name','timeCompleted');
				break;
			case 3:
				var rowHeaderText=document.createTextNode('Time Remaining %');
				rowInput.setAttribute('type','text');
				rowInput.setAttribute('id','timeRemaining');
				rowInput.setAttribute('name','timeRemaining');
				break;
			case 4:
				var rowHeaderText=document.createTextNode('Value Completed');
				rowInput.setAttribute('type','text');
				rowInput.setAttribute('id','valueCompleted');
				rowInput.setAttribute('name','valueCompleted');
				break;
			case 5:
				var rowHeaderText=document.createTextNode('Value Remaining');
				rowInput.setAttribute('type','text');
				rowInput.setAttribute('id','valueRemaining');
				rowInput.setAttribute('name','valueRemaining');
				break;
			case 6:
				var rowHeaderText=document.createTextNode('Contractual End Date');
				rowInput.setAttribute('type','text');
				rowInput.setAttribute('id','contractualEndDate');
				rowInput.setAttribute('name','contractualEndDate');
				rowInput.setAttribute('value',result.timeValue.ConCompDate);
				break;
			case 7:
				var rowHeaderText=document.createTextNode('Estimated End Date');
				rowInput.setAttribute('type','text');
				rowInput.setAttribute('id','estimateEndDate');
				rowInput.setAttribute('name','estimateEndDate');
				rowInput.setAttribute('value',result.timeValue.EstCompDate);
				break;
		}
		rowHeader.appendChild(rowHeaderText);
		rowContent.appendChild(rowInput);
		tableRow.appendChild(rowHeader);
		tableRow.appendChild(rowContent);
		tableBody.appendChild(tableRow);
	}
	timeTable.appendChild(tableBody);
	tableLocation.appendChild(timeTable);
}

function createValueTable(){
	var tableLocation = document.querySelector('#completionTable');
	var valueTable = document.createElement('table');
	valueTable.setAttribute('class','striped');
	var tableHeader = document.createElement('thead');
	var tableBody = document.createElement('tbody');
	for(var i=0; i<2;i++){
		var tableRow = document.createElement('tr');
		var rowHeader = document.createElement('td');
		var rowContent= document.createElement('td');
		var rowInput = document.createElement('input');
		rowInput.setAttribute('type','text');
		switch(i){
			case 0:
				var rowHeaderText=document.createTextNode('Value Completed');
				rowInput.setAttribute('id','valueCompleted');
				rowInput.setAttribute('name','valueCompleted');
				rowContent.appendChild(rowInput);
				rowHeader.appendChild(rowHeaderText);
				break;
			case 1:
				var rowHeaderText=document.createTextNode('Value Remaining');
				rowInput.setAttribute('id','valueRemaining');
				rowInput.setAttribute('name','valueRemaining');
				rowContent.appendChild(rowInput);
				rowHeader.appendChild(rowHeaderText);
				break;
		}
		tableRow.appendChild(rowHeader);
		tableRow.appendChild(rowContent);
		tableBody.appendChild(tableRow);

	}
	valueTable.appendChild(tableBody);
	tableLocation.appendChild(valueTable);
}

//timeValue - create graphs

function createTimeChart(chartLocation){
	var completedTime = document.querySelector('#timeCompleted').value;
	var timeRemaining = document.querySelector('#timeRemaining').value;
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

function createValueChart(chartLocation){
	var completedValueData = document.querySelector('#valueCompleted').value;
	var remainingValueData = document.querySelector('#valueRemaining').value;
	
	var valueGraph = Morris.Donut({
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

function createProjectKpiSection(){
	var rowLocation = document.querySelector('#projectKPIs');
	var projectKpiRow = createDiv('projectKPIsRow','row');
	var projectKPIcontainer =createDataCard('col s12 l5', 'projectKPI', 'KpiTable', 'Project KPI\'s')
	projectKpiRow.appendChild(projectKPIcontainer);
	var monthlyKPIcontainer = createDataCard('col s12 l7', 'monthlyKPI', 'monthlyKpiTable', 'Monthly KPI\'s records');
	projectKpiRow.appendChild(monthlyKPIcontainer);
	rowLocation.appendChild(projectKpiRow);
}

//Project KPI - create tables
function createKpiCatTbl(){
	var tblLocation = document.querySelector("#KpiTable");
	var kpiHTMLtable = document.createElement('table');
	kpiHTMLtable.setAttribute('class','striped');
	var kpiHeader = document.createElement('thead');
	var kpiHeaderNames = ["","Target","Actual","Variance",]
	var headerRow = document.createElement("tr");
	for(var i=0;i<2;i++){
		for(var j=0;j<kpiHeaderNames.length;j++){
			var kpiHeaderCell = document.createElement("th");
			var kpiHeaderText = document.createTextNode(kpiHeaderNames[j]);
			kpiHeaderCell.setAttribute('class','center-align');
			kpiHeaderCell.appendChild(kpiHeaderText);
			headerRow.appendChild(kpiHeaderCell);
		}
	}
	kpiHeader.appendChild(headerRow)
	kpiHTMLtable.appendChild(kpiHeader);
	var kpiBody = document.createElement('tbody');
	var tblRows=['Adherence to Prelim Budget', 'Predictability to Cash Flow (month)', 'Predictability to Cash Flow (Qtr)', 'Non Recoverable Works', 'Predictability of Programme', 'H&S Audit Score', 'H&S Accident Incident Rate', 'Considerate Constructor Score', 'Waste', 'Percentage Recycled', 'Waste per £100k', 'Water m3 per £100k', 'Energy KG CO2 per £100k'];
	var tblRowId=['adherence','monthlyCashflow','qtrCashflow','nonRecWorks','predOfProgram','HSAudit','HSAccidentRate','considerateConstructor','','pctRecycled','waste100k','water100k','energy100k'];
	for (var i=0; i<tblRows.length; i++){
		var bodyRow = document.createElement('tr');
		var cellRef = tblRowId[i];
		if(tblRows[i]=='Waste'){
			var bodyCell = document.createElement('td');
			bodyCell.setAttribute('colspan','8');
			bodyCell.innerHTML = 'Waste';
			bodyRow.appendChild(bodyCell);
		}else{
			for(var j=0; j<8;j++){
				var bodyCell = document.createElement('td');
				if(j>0){
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','text');
				}
				switch(j){
					case 0:
						var bodyRowText = document.createTextNode(tblRows[i]);
						bodyCell.appendChild(bodyRowText);
						break;
					case 1: 
						bodyCellInput.setAttribute('id',cellRef+'PctTarget');
						bodyCellInput.setAttribute('name',cellRef+'PctTarget');
						bodyCell.appendChild(bodyCellInput);
						break;
					case 2: 
						bodyCellInput.setAttribute('id',cellRef+'PctActual');
						bodyCellInput.setAttribute('name',cellRef+'PctActual');
						bodyCell.appendChild(bodyCellInput);
						break;
					case 3: 
						bodyCellInput.setAttribute('id',cellRef+'PctVariance');
						bodyCellInput.setAttribute('name',cellRef+'PctVariance');
						bodyCell.appendChild(bodyCellInput);
						break;
					case 5: 
						bodyCellInput.setAttribute('id',cellRef+'Target');
						bodyCellInput.setAttribute('name',cellRef+'Target');
						bodyCell.appendChild(bodyCellInput);
						break;
					case 6: 
						bodyCellInput.setAttribute('id',cellRef+'Actual');
						bodyCellInput.setAttribute('name',cellRef+'Actual');
						bodyCell.appendChild(bodyCellInput);
						break;
					case 7: 
						bodyCellInput.setAttribute('id',cellRef+'Variance');
						bodyCellInput.setAttribute('name',cellRef+'Variance');
						bodyCell.appendChild(bodyCellInput);
						break;
				}
				bodyRow.appendChild(bodyCell);
			}
		}
		kpiBody.appendChild(bodyRow);
	}
	kpiHTMLtable.appendChild(kpiBody);
	tblLocation.appendChild(kpiHTMLtable);	
}

function createMonthlyKPITbl(){
	var monthlyKpiTblLoc = document.querySelector('#monthlyKpiTable');
	var monthlyKpiTbl = document.createElement('table');
	monthlyKpiTbl.setAttribute('class','striped responsive');
	var tblHeaders=['Date','Total Skip waste m3','Total Cart Away Waste m3','% All Skip Waste Recycled','Water m3','Emissions from Diesel KG CO2','Emissions from Electricity KG CO2','Total Emissions KG CO2','Waste per £100k m3','Emissions from Energy KG CO2 per 100KG','Water m3 per £100k','Actual T.O'];
	var headerLength = tblHeaders.length;
	var tblHeader = document.createElement('thead');
	var tblHeaderRow = document.createElement('tr');
	for(var i = 0;i<headerLength;i++){
		var tblHeaderRowCellText;
		var tblHeaderRowCell = document.createElement('th');
		tblHeaderRowCellText = document.createTextNode(tblHeaders[i]);
		tblHeaderRowCell.setAttribute('class','center-align');
		tblHeaderRowCell.appendChild(tblHeaderRowCellText);
		tblHeaderRow.appendChild(tblHeaderRowCell);
	}
	tblHeader.appendChild(tblHeaderRow)
	monthlyKpiTbl.appendChild(tblHeader);
	var lastItem = getLastMonthlyKpiItem(); 
	var tblBody = document.createElement('tbody');
	var tblColIds=['date','TtlSkipWasteM3','totalCartAwayWastem3','pctAllSkipWasteCycled','waterm3','emitFromDieselKgCo2','EmitFromElectrictyKgCo2','TotalEmitKgCo2','Wasteper100kM3','emitfromEnergyKgCo2per100kg','waterm3Per100k','actualTo'];
	for(var j=0; j<lastItem;j++){
		var tblBodyRow = document.createElement('tr');
		for(var k=0; k<headerLength; k++){
			var tblBodyRowCell;
			var tblBodyRowCellText;
			var fieldID=tblColIds[k]+(j+1);
			tblBodyRowCell = document.createElement('td');
			if (k==0){
				tblBodyRowCellText = document.createTextNode(result.monthlyKPI[j].Date);
				tblBodyRowCell.appendChild(tblBodyRowCellText);
				tblBodyRowCell.setAttribute('id',fieldID);
				tblBodyRow.appendChild(tblBodyRowCell);
			}else{
				var bodyCellInput = document.createElement('input');
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

function populateMonthlyKpiTbl(){
	var tblColIds=['date','TtlSkipWasteM3','totalCartAwayWastem3','pctAllSkipWasteCycled','waterm3','emitFromDieselKgCo2','EmitFromElectrictyKgCo2','TotalEmitKgCo2','Wasteper100kM3','emitfromEnergyKgCo2per100kg','waterm3Per100k','actualTo'];
	var rowLength = tblColIds.length;
	var kpiData=result.monthlyKPI;
	var rowNum = kpiData.length;	
	for(var Prop in kpiData){
		var tblRowIndex = 0;
		for(var innerProp in kpiData[Prop]){
			var fieldID='#'+tblColIds[tblRowIndex]+(parseInt(Prop)+1);
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
function createProgressSection(location){
	var sectionLocation = document.querySelector(location);
	var section = createDiv('progressSection','row');
	var leftColumn = createDataCard('col s12 l3', 'progressTbl', 'progressTblContent', 'Progress')
	section.appendChild(leftColumn);
	var midColumn = createDiv('midColumn','col s12 l3');
	var midLeftFirstCard = createDiv('considerateConsContainer','card col s6 l12');
	var midLeftFirstContent = createDiv('considerateContractorsTbl','card-content');
	var midLeftFirstTitle = createTitle('h5','Considerate Constructors');
	var breakelement = document.createElement('br')
	midLeftFirstContent.appendChild(midLeftFirstTitle);
	midLeftFirstCard.appendChild(midLeftFirstContent);
	midColumn.appendChild(midLeftFirstCard);
	var midSecondCard = createDiv('materials','card col s6 l12');
	var midSecondContent = createDiv('materialsTables','card-content');
	var midSecondMainTitle = createTitle('h5','Material Controls');
	var midSecondSubTitleA = document.createTextNode('Summary of Materials Ordered By Category:');
	var midSecondSubTitleB = document.createTextNode('Summary of Replacement Ordered by Reason:');
	var matsByCatsDiv = createDiv('matsByCats');
	var matsByReasonDiv = createDiv('matsbyReason');



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
	var rightColumn = createDataCard('col s12 l6', 'recordOfLabour', 'recordOfLabourContent', 'Record Of Labour');
	section.appendChild(rightColumn);
	sectionLocation.appendChild(section);
}

//Progress Data Section - Create Tables
function createProgressTbl(){
	var tableLocation = document.querySelector('#progressTblContent');
	var progressTable = document.createElement('table');
	progressTable.setAttribute('class','striped');
	var progressHeader = document.createElement('thead');
	var headerRow = document.createElement('tr');
	for(var i = 0; i<2;i++){
		var headerCell = document.createElement('th');
		if(i==0){
			var headerCellText = document.createTextNode('Month');
		}else{
			var headerRowCell = document.createTextNode('Progress');
		}
		headerCell.appendChild(headerCellText);
		headerRow.appendChild(headerCell)
	}
	progressHeader.appendChild(headerRow);

	var progressBody = document.createElement('tbody');	
	var tableLength = projectMonths.length; 
	for(var j=0;j<tableLength;j++){
		var bodyRow = document.createElement('tr');
		for(var k=0;k<2;k++){
			var bodyCell = document.createElement('td');
			var bodyCellInput = document.createElement('input');
			bodyCellInput.setAttribute('type','text');
			if(projectMonths[i]!= '___rowNum__'){
				switch(k){
					case 0:
						bodyCellInput.setAttribute('id',projectMonths[j]+'Date');
						bodyCellInput.setAttribute('name',projectMonths[j]+'Date');
						bodyCell.appendChild(bodyCellInput);
						break;
					case 1:
						bodyCellInput.setAttribute('id',projectMonths[j]+'Weeks');
						bodyCellInput.setAttribute('name',projectMonths[j]+'Weeks');
						bodyCell.appendChild(bodyCellInput);
						break;
				}
			}
			bodyRow.appendChild(bodyCell);
		}
		progressBody.appendChild(bodyRow);
	}
	progressTable.appendChild(progressBody);
	tableLocation.appendChild(progressTable);
}

function createConsiderateConstructorsTable(location){
	var tableLocation = document.querySelector(location)
	var considerateConsTable = document.createElement('table');
	considerateConsTable.setAttribute('id','considerContractorTbl')
	considerateConsTable.setAttribute('class','striped')
	var tableHeader = document.createElement('thead');
	var headerRow = document.createElement('tr');
	for(var i=0;i<2;i++){
		var column = document.createElement('th');
		if(i==0){
			var colTitle = document.createTextNode('Date');
		}else{
			var colTitle = document.createTextNode('Score');
		}
		column.appendChild(colTitle);
		headerRow.appendChild(column);
	}
	tableHeader.appendChild(headerRow);
	considerateConsTable.appendChild(tableHeader);
	var tableLength = result.CCS.length;
	var tableBody = document.createElement('tbody');
	for(var j=0;j<tableLength;j++){
		var bodyRow = document.createElement('tr');
		for(var k=0;k<2;k++){
			var bodyCell = document.createElement('td');
			var bodyCellInput = document.createElement('input');
			bodyCellInput.setAttribute('type','text');
			if(k==0){
				var fieldID = 'CCS';
				var fieldContentSting = result.CCS[j].Date;
				var fieldContentDate = fieldContentSting.split('/')[1]+'/'+fieldContentSting.split('/')[0]+'/'+ fieldContentSting.split('/')[2];
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

function createMatsByCats(){
	 var tblLocation = document.querySelector('#matsByCats');
	 var matsByCatsTbl = document.createElement('table');
	 matsByCatsTbl.setAttribute('class','striped');
	 matsByCatsTbl.setAttribute('id','materialsByCat');
	 var tblHeader = document.createElement('thead');
	 var tblHeaderRow = document.createElement('tr');
	 for(var i=0; i<2; i++){
	 	var tblHeaderCell = document.createElement('th');
	 	var tblHeaderCellTxt;
	 	switch(i){
	 		case 0:
	 			tblHeaderCellTxt = document.createTextNode('Category');
	 			break;
	 		case 1:
	 			tblHeaderCellTxt = document.createTextNode('Number');
	 			break;
	 	}
	 	tblHeaderCell.appendChild(tblHeaderCellTxt);
	 	tblHeaderRow.appendChild(tblHeaderCell);
	 }
	 tblHeader.appendChild(tblHeaderRow);
	 matsByCatsTbl.appendChild(tblHeader);
	 var tblBody = document.createElement('tbody');
	 for(var j=0; j<3; j++){
	 	var tblBodyRow = document.createElement('tr');
	 	for(var k=0;k<2;k++){
	 		var tblBodyCell = document.createElement('td');
	 		var tblBodyText;
	 		if(k==0){
	 			switch(j){
	 				case 0:
	 					tblBodyText = document.createTextNode('Part Site');
	 					break;
	 				case 1:
	 					tblBodyText = document.createTextNode('Whole Site');
	 					break;
	 				case 2:
	 					tblBodyText = document.createTextNode('Replacement');
	 					break;
	 			}
	 			tblBodyCell.appendChild(tblBodyText);
	 		}else{
	 			var bodyCellInput = document.createElement('input');
	 			bodyCellInput.setAttribute('type','text');
	 			switch(j){
	 				case 0:
	 					bodyCellInput.setAttribute('id','partSiteValue');
	 					bodyCellInput.setAttribute('name','partSiteValue');
	 					bodyCellInput.value = result.MaterialOrdersCategories[0].partSite;
	 					tblBodyCell.appendChild(bodyCellInput);
	 					break;
	 				case 1:
	 					bodyCellInput.setAttribute('id','wholeSiteValue');
	 					bodyCellInput.setAttribute('name','wholeSiteValue');
	 					bodyCellInput.value = result.MaterialOrdersCategories[0].wholeSite;
	 					tblBodyCell.appendChild(bodyCellInput);
	 					break;
	 				case 2:
	 					bodyCellInput.setAttribute('id','replacementValue');
	 					bodyCellInput.setAttribute('name','replacementValue');
	 					bodyCellInput.value = result.MaterialOrdersCategories[0].replacement;
	 					tblBodyCell.appendChild(bodyCellInput);
	 					break;
	 			}
	 		}
	 		tblBodyRow.appendChild(tblBodyCell);
	 	}
	 	tblBody.appendChild(tblBodyRow);
	 }
	 matsByCatsTbl.appendChild(tblBody);
	 tblLocation.appendChild(matsByCatsTbl);
}

function createMatsByReason(){
	 var tblLocation = document.querySelector('#matsbyReason');
	 var matsByReasonTbl = document.createElement('table');
	 matsByReasonTbl.setAttribute('class','striped');
	 matsByReasonTbl.setAttribute('id','replacementsByReason');
	 var tblHeader = document.createElement('thead');
	 var tblHeaderRow = document.createElement('tr');
	 for(var i=0; i<2; i++){
	 	var tblHeaderCell = document.createElement('th');
	 	var tblHeaderCellTxt;
	 	switch(i){
	 		case 0:
	 			tblHeaderCellTxt = document.createTextNode('Reason');
	 			break;
	 		case 1:
	 			tblHeaderCellTxt = document.createTextNode('Number');
	 			break;
	 	}
	 	tblHeaderCell.appendChild(tblHeaderCellTxt);
	 	tblHeaderRow.appendChild(tblHeaderCell);
	 }
	 tblHeader.appendChild(tblHeaderRow);
	 matsByReasonTbl.appendChild(tblHeader);
	 var tblBody = document.createElement('tbody');
	 for(var j=0; j<4; j++){
	 	var tblBodyRow = document.createElement('tr');
	 	for(var k=0;k<2;k++){
	 		var tblBodyCell = document.createElement('td');
	 		var tblBodyText;
	 		if(k==0){
	 			switch(j){
	 				case 0:
	 					tblBodyText = document.createTextNode('Client Change');
	 					break;
	 				case 1:
	 					tblBodyText = document.createTextNode('Theft');
	 					break;
	 				case 2:
	 					tblBodyText = document.createTextNode('Waste');
	 					break;
	 				case 3:
	 					tblBodyText = document.createTextNode('Damage');
	 					break;
	 			}
	 			tblBodyCell.appendChild(tblBodyText);
	 		}else{
	 			var bodyCellInput = document.createElement('input');
	 			bodyCellInput.setAttribute('type','number');
	 			switch(j){
	 				case 0:
	 					bodyCellInput.setAttribute('id','clientChangeValue');
	 					bodyCellInput.setAttribute('name','clientChangeValue');
	 					bodyCellInput.value = result.MaterialOrdersType[0].clientChange;
	 					tblBodyCell.appendChild(bodyCellInput);
	 					break;
	 				case 1:
	 					bodyCellInput.setAttribute('id','theftValue');
	 					bodyCellInput.setAttribute('name','theftValue');
	 					bodyCellInput.value = result.MaterialOrdersType[0].theft;
	 					tblBodyCell.appendChild(bodyCellInput);
	 					break;
	 				case 2:
	 					bodyCellInput.setAttribute('id','wasteValue');
	 					bodyCellInput.setAttribute('name','wasteValue');
	 					bodyCellInput.value = result.MaterialOrdersType[0].waste;
	 					tblBodyCell.appendChild(bodyCellInput);
	 					break;
	 				case 3:
	 					bodyCellInput.setAttribute('id','damageValue');
	 					bodyCellInput.setAttribute('name','damageValue');
	 					bodyCellInput.value = result.MaterialOrdersType[0].damage;
	 					tblBodyCell.appendChild(bodyCellInput);
	 					break;
	 			}
	 		}
	 		tblBodyRow.appendChild(tblBodyCell);
	 	}
	 	tblBody.appendChild(tblBodyRow);
	 }
	 matsByReasonTbl.appendChild(tblBody);
	 tblLocation.appendChild(matsByReasonTbl);
}

function createRecordOfLabourTable(){
	var labourTable = document.createElement('table'); 
	labourTable.setAttribute('id','recOfLbr');
	labourTable.setAttribute('class','striped');
	var tableHeader = document.createElement('thead');
	var headerRow = document.createElement('tr');
	for(var i = 0;i<9;i++){
		var headerCell = document.createElement('th');
		headerCell.setAttribute('class','center-align');
		switch(i){
			case 0:
				var headerCellText = document.createTextNode('Week');
				break;
			case 1:
				var headerCellText = document.createTextNode('Mon');
				break;
			case 2:
				var headerCellText = document.createTextNode('Tues');
				break;
			case 3:
				var headerCellText = document.createTextNode('Wed');
				break;
			case 4:
				var headerCellText = document.createTextNode('Thurs');
				break;
			case 5:
				var headerCellText = document.createTextNode('Fri');
				break;
			case 6:
				var headerCellText = document.createTextNode('Sat');
				break;
			case 7:
				var headerCellText = document.createTextNode('Sun');
				break;
			case 8:
				var headerCellText = document.createTextNode('Total');
				break;
		}
		headerCell.appendChild(headerCellText);
		headerRow.appendChild(headerCell);
	}
	tableHeader.appendChild(headerRow);
	labourTable.appendChild(tableHeader);

	var tableBody = document.createElement('tbody');
	var numberOfRows =result.NewRecordOfLabour.length;
	for(var i=0;i<numberOfRows; i++){
		var bodyRow = recordOfLabourRows(i);
		tableBody.appendChild(bodyRow);
	}
	labourTable.appendChild(tableBody);
	document.querySelector("#recordOfLabourContent").appendChild(labourTable);
}

function recordOfLabourRows(weekNumber){
	var rowOfFields=document.createElement('tr');
	var weekNumber = weekNumber+1;
	for(var i=0;i<9;i++){
		var singleField = document.createElement('td');
		var fieldInput = document.createElement('input');
		fieldInput.setAttribute('type','text');
		var cellId = recordOfLabourCell(i)
		var fieldID = 'week'+weekNumber+cellId;
		fieldInput.setAttribute('id',fieldID);
		fieldInput.setAttribute('name',fieldID);
		singleField.appendChild(fieldInput);
		rowOfFields.appendChild(singleField);
	}
	return rowOfFields;
}

function recordOfLabourCell(cellNumber){
	var cellId;
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

function populateRecordOfLabourTbl(){
	var numberOfRows = result.NewRecordOfLabour.length;
	for(var i=0;i<numberOfRows;i++){
		setRecordOfLabourRows(i);
	}	
}

function setRecordOfLabourRows(weekNumber){
	var totalLabour =0;
	for(var prop in result.NewRecordOfLabour[weekNumber]){
		var fieldId = '#week'+(weekNumber+1)+prop;
		if(prop != 'ContractNumber'){
			if(prop != 'WeekNum'){
				totalLabour =  totalLabour + parseInt(result.NewRecordOfLabour[weekNumber][prop]);
			}
			document.querySelector(fieldId).value = result.NewRecordOfLabour[weekNumber][prop];
		}
	}
	var fieldId = '#week'+(weekNumber+1)+'Total';
	document.querySelector(fieldId).value =totalLabour;
}

//Financial Data Section - Structure

function createfinancialData(){
	var location = document.querySelector('#finacialData');
	var row = createDiv('financialDataRow','row');
	var monthlyCWD = createDataCard('col s12 l2', 'totalCWD', 'totalCWDCardContent', 'CWD To Date');
	var totalCWD = createDataCard('col s12 l2', 'monthlyCWD', 'monthlyCWDCardContent', 'CWD In Month');
	var turnover = createDataCard('col s12 l4', 'turnover', 'turnoverCardContent', 'Predicatability (Turnover)');
	var costflow = createDataCard('col s12 l4', 'costflow', 'costflowCardContent', 'Costflow');
	row.appendChild(monthlyCWD);
	row.appendChild(totalCWD);
	row.appendChild(turnover);
	row.appendChild(costflow);
	location.appendChild(row);
}

//Financial Data Section - create tables

function createFinancialDataSection(){
	var sectionLocation = document.querySelector('#financialData');
	var sectionRow = createDiv('financialRow','row');
	var CwdToDate = createDataCard('col s12 l2', 'totalCWD', 'totalCwdContent', 'CWD To Date');
	var monthlyCwds = createDataCard('col s12 l2', 'monthlyCWD', 'monthlyCwdContent', 'CWD In Month');
	var turnover = createDataCard('col s12 l4', 'turnover', 'turnoverContent', 'Predictability (Turnover)');
	var costflow = createDataCard('col s12 l4', 'costflow', 'costflowContent', 'Costflow');
	sectionRow.appendChild(CwdToDate);
	sectionRow.appendChild(monthlyCwds);
	sectionRow.appendChild(turnover);
	sectionRow.appendChild(costflow);
	sectionLocation.appendChild(sectionRow);
}


//Financial Data Section - create and fill tables
function createCwdToDateTbl(){
	var tblLocation = document.querySelector('#totalCwdContent');
	var totalCWDTbl = document.createElement('table');
	totalCWDTbl.setAttribute('id','totalCwdTbl');
	totalCWDTbl.setAttribute('class','striped');
	var tableHeader=document.createElement('thead');
	var headerRow = document.createElement('tr');
	for(var i=0;i<2;i++){
		var rowCell = document.createElement('th');
		switch(i){
			case 0:
				var cellText = document.createTextNode('Sub-Contractor');
				break;
			case 1:
				var cellText = document.createTextNode('Number');
				break;
		}
		rowCell.appendChild(cellText);
		headerRow.appendChild(rowCell);
	}
	tableHeader.appendChild(headerRow);
	totalCWDTbl.appendChild(tableHeader)
	var tableBody = document.createElement('tbody');
	var tableSize= result.CWDsTotal.length;
	for(var j=0;j<tableSize;j++){
		var bodyRow=document.createElement('tr');
		for(var k=0; k<2;k++){
			var bodyCell = document.createElement('td');
			switch(k){
				case 0:
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id','totalCwdSubbie'+(j+1));
					bodyCellInput.setAttribute('name','totalCwdSubbie'+(j+1));
					bodyCellInput.value = result.CWDsTotal[j].SubContractor;
					bodyCell.appendChild(bodyCellInput);
					break;
				case 1:
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id','totalCwdSubbie'+(j+1)+'Frequency');
					bodyCellInput.setAttribute('name','totalCwdSubbie'+(j+1)+'Frequency');
					bodyCellInput.value=result.CWDsTotal[j].Total;
					bodyCell.appendChild(bodyCellInput);
					break;
			}
			bodyRow.appendChild(bodyCell);
		}
		tableBody.appendChild(bodyRow);
	}
	totalCWDTbl.appendChild(tableBody);
	tblLocation.appendChild(totalCWDTbl);
}

function createMonthlyCwdTbl(){
	var tblLocation = document.querySelector('#monthlyCwdContent');
	var monthlyCWDTbl = document.createElement('table');
	monthlyCWDTbl.setAttribute('id','monthlyCwdTbl');
	monthlyCWDTbl.setAttribute('class','striped');
	var tableHeader=document.createElement('thead');
	var headerRow = document.createElement('tr');
	for(var i=0;i<2;i++){
		var rowCell = document.createElement('th');
		switch(i){
			case 0:
				var cellText = document.createTextNode('Sub-Contractor');
				break;
			case 1:
				var cellText = document.createTextNode('Number');
				break;
		}
		rowCell.appendChild(cellText);
		headerRow.appendChild(rowCell);
	}
	tableHeader.appendChild(headerRow);
	monthlyCWDTbl.appendChild(tableHeader)
	var tableBody = document.createElement('tbody');
	var tableSize= result.CWDsMonthly.length;
	for(var j=0;j<tableSize;j++){
		var bodyRow=document.createElement('tr');
		for(var k=0; k<2;k++){
			var bodyCell = document.createElement('td');
			switch(k){
				case 0:
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id','totalCwdSubbie'+(j+1));
					bodyCellInput.setAttribute('name','totalCwdSubbie'+(j+1));
					bodyCellInput.value = result.CWDsMonthly[j].SubContractor;
					bodyCell.appendChild(bodyCellInput);
					break;
				case 1:
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id','totalCwdSubbie'+(j+1)+'Frequency');
					bodyCellInput.setAttribute('name','totalCwdSubbie'+(j+1)+'Frequency');
					bodyCellInput.value=result.CWDsMonthly[j].Total;
					bodyCell.appendChild(bodyCellInput);
					break;
			}
			bodyRow.appendChild(bodyCell);
		}
		tableBody.appendChild(bodyRow);
	}
	monthlyCWDTbl.appendChild(tableBody);
	tblLocation.appendChild(monthlyCWDTbl);
}

function createPredTurnoverTbl(){
	var predTurnoverTbl = document.createElement('table');
	predTurnoverTbl.setAttribute('id','predTurnoverTbl');
	predTurnoverTbl.setAttribute('class','striped');
	var tableHeader = document.createElement('thead');
	var headerRow = document.createElement('tr');
	for(var i=0;i<4;i++){
		var rowCell = document.createElement('th');
		switch(i){
			case 0:
				var cellText=document.createTextNode('Month');
				break;
			case 1:
				var cellText=document.createTextNode('Original Cum T.O');
				break;
			case 2:
				var cellText=document.createTextNode('Current Cum T.O');
				break;
			case 3:
				var cellText=document.createTextNode('Actual Cum T.O');
				break;
		}
		rowCell.appendChild(cellText);
		headerRow.appendChild(rowCell);
	}
	tableHeader.appendChild(headerRow);
	predTurnoverTbl.appendChild(tableHeader)
	var tableBody = document.createElement('tbody');
	var listOfMonths = projectMonths.length;
	for(var j=0;j<listOfMonths;j++){
		var bodyRow=document.createElement('tr');
		for(var k=0; k<4;k++){
			var bodyCell = document.createElement('td');
			switch(k){
				case 0:
					bodyCell.innerHTML = projectMonths[j];
					break;
				case 1:
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id',projectMonths[j]+'OriginalCum');
					bodyCellInput.setAttribute('name',projectMonths[j]+'OriginalCum');
					bodyCellInput.value = result.financialData[2][projectMonths[j]];
					bodyCell.appendChild(bodyCellInput);
					break;
				case 2:
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id',projectMonths[j]+'CurrentCum');
					bodyCellInput.setAttribute('name',projectMonths[j]+'CurrentCum');
					bodyCellInput.value=result.financialData[0][projectMonths[j]];
					bodyCell.appendChild(bodyCellInput);
					break;
				case 3:
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id',projectMonths[j]+'ActualCum');
					bodyCellInput.setAttribute('name',projectMonths[j]+'ActualCum');
					bodyCellInput.value = result.financialData[1][projectMonths[j]];
					bodyCell.appendChild(bodyCellInput);
					break;

			}
			bodyRow.appendChild(bodyCell);
		}
		tableBody.appendChild(bodyRow);
	}
	predTurnoverTbl.appendChild(tableBody);
	document.querySelector('#turnoverContent').appendChild(predTurnoverTbl);
}

function createCostflowTbl(){
	var costflowTbl = document.createElement('table');
	costflowTbl.setAttribute('id','costflowTbl');
	costflowTbl.setAttribute('class','striped');
	var tableHeader = document.createElement('thead');
	var headerRow = document.createElement('tr');
	for(var i=0;i<4;i++){
		var rowCell = document.createElement('th');
		switch(i){
			case 0:
				var cellText=document.createTextNode('Month');
				break;
			case 1:
				var cellText=document.createTextNode('Cum Certified Cash');
				break;
			case 2:
				var cellText=document.createTextNode('current Cum T.O');
				break;
			case 3:
				var cellText=document.createTextNode('Actual Cum T.O');
				break;
		}
		rowCell.appendChild(cellText);
		headerRow.appendChild(rowCell);
	}
	tableHeader.appendChild(headerRow);
	costflowTbl.appendChild(tableHeader)
	var listOfMonths = projectMonths.length;
	var tableBody = document.createElement('tbody');
	for(var j=0;j<listOfMonths;j++){
		var bodyRow=document.createElement('tr');
		for(var k=0; k<4;k++){
			var cumTgtCostflow=(result.financialData[0][projectMonths[j]]*(1-0.1)).toFixed(0);
			var bodyCell = document.createElement('td');
			switch(k){
				case 0:
					bodyCell.innerHTML = projectMonths[j];
					break;
				case 1:
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id','costFlow'+projectMonths[j]+'CumCertifiedCash');
					bodyCellInput.setAttribute('name','costFlow'+projectMonths[j]+'CumCertifiedCash');
					bodyCellInput.value = result.financialData[0][projectMonths[j]];
					bodyCell.appendChild(bodyCellInput);
					break;
				case 2:
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id','costFlow'+projectMonths[j]+'CurrentCum');
					bodyCellInput.setAttribute('name','costFlow'+projectMonths[j]+'CurrentCum');
					bodyCellInput.value=cumTgtCostflow;
					bodyCell.appendChild(bodyCellInput);
					break;
				case 3:
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id','costFlow'+projectMonths[j]+'AcutalCum');
					bodyCellInput.setAttribute('name','costFlow'+projectMonths[j]+'AcutalCum');
					bodyCellInput.value = result.financialData[3][projectMonths[j]];
					bodyCell.appendChild(bodyCellInput);
					break;

			}
			bodyRow.appendChild(bodyCell);
		}
		tableBody.appendChild(bodyRow);
	}
	costflowTbl.appendChild(tableBody);
	document.querySelector('#costflowContent').appendChild(costflowTbl);
}



//Subcontractor Financial Data Section

function createSubContractorSection(location){
	var sectionLocation = document.querySelector(location);
	var section= createDiv('subContractorContainer','row');
	var subContractorDiv = createDataCard('col s12 l12', 'subContractor', 'subConOrderVariations', 'Subcontractor Orders and Variations');
	section.appendChild(subContractorDiv);
	sectionLocation.appendChild(section);
}

function createsubConOrderVarTbl(){
	var tblLength = result.SubConFinData.length;
	if(tblLength>0){
		var startOfFieldID;
		var middleOfFieldID=1;
		var endOfFieldID;
		var tableLocation = document.querySelector('#subConOrderVariations');
		var subConOrderTable = document.createElement('table');
		subConOrderTable.setAttribute('id','subbieOrders');
		subConOrderTable.setAttribute('class','striped');
		var subConHeader = document.createElement('thead');
		var headerRow = document.createElement('tr');
		for(var i=0;i<6;i++){
			var headerCell = document.createElement('th');
			headerCell.setAttribute('class','center-align');
			switch(i){
				case 0:
					var headerCellText = document.createTextNode('Trade');
					break;
				case 1:
					var headerCellText = document.createTextNode('Sub-Contract Nett Order Value');
					break;
				case 2:
					var headerCellText = document.createTextNode('Design Development');
					break;
				case 3:
					var headerCellText = document.createTextNode('Package');
					break;
				case 4:
					var headerCellText = document.createTextNode('Site');
					break;
				case 5:
					var headerCellText = document.createTextNode('Recoverable Variations');
			}
			headerCell.appendChild(headerCellText);
			headerRow.appendChild(headerCell);
		}
		subConHeader.appendChild(headerRow);
		subConOrderTable.appendChild(subConHeader);
		var subConBody = document.createElement('tbody');
		var colsIds=Object.keys(result.SubConFinData[0]);
		colsIds.shift();
		for (var j=0; j<tblLength; j++){
			var bodyRow = document.createElement('tr');
			if(middleOfFieldID==51){middleOfFieldID=1};
			for(var k=0; k<colsIds.length;k++){
				var bodyCell = document.createElement('td');
				var cellInput = document.createElement('input');
				var bodyCellId= colsIds[k]+(j+1);
				cellInput.setAttribute('id',bodyCellId);
				cellInput.setAttribute('name',bodyCellId);
				bodyCell.appendChild(cellInput);
				bodyRow.appendChild(bodyCell)
				endOfFieldID++;
			}
			subConBody.appendChild(bodyRow);
			middleOfFieldID++;
		}
		subConOrderTable.appendChild(subConBody)


		tableLocation.appendChild(subConOrderTable);
		populateSubConOrderVarTbl();
	}
	else{
		var alternativeText = document.createTextNode('- No Information to Display - ');
		tableLocation.appendChild(alternativeText);
	}
}

function populateSubConOrderVarTbl(){
	var middleOfFieldID=1;
	for(var prop in result.SubConFinData){
		if(result.SubConFinData.hasOwnProperty(prop)){
			for(var innerProp in result.SubConFinData[prop]){
				if(innerProp!='ContractNumber'){
					var fieldID = '#'+innerProp+(parseInt(prop)+1);
					document.querySelector(fieldID).value = result.SubConFinData[prop][innerProp];
				}
			}
		}
	}
}



//HS Data Section Structure

function createHSDataSection(locaton){
	var sectionLocation = document.querySelector(locaton);
	var HsRow = createDiv('HsRow','row');
	var monthlyAuditCard = createDataCard('col s12 l2','monthlyAudit','HSMonthlyAudit','Monthly Audit');
	var accidentTradeTypeCard = createMultiDataCard('col s12 l4', 'accidentTradeType', 2, '', ['By Type','By Trade'])
	var accidentReportCard = createDataCard('col s12 l3','accidentReport','tblAccidentReport','Accident Report');
	var daysLostCard = createDataCard('col s12 l3', 'daysLost', 'daysLostContent', 'Days Lost');
	HsRow.appendChild(monthlyAuditCard);
	HsRow.appendChild(accidentTradeTypeCard);
	HsRow.appendChild(accidentReportCard);
	HsRow.appendChild(daysLostCard);
	sectionLocation.appendChild(HsRow);
}

function getProjectMonths(){
	projectMonths = Object.getOwnPropertyNames(result.progress);
	projectMonths.shift();
	projectMonths.shift();
}

//HS Data Section Create Table
function createHSMonthlyAuditTbl(){
	var tableLocation = document.querySelector('#HSMonthlyAudit');
	var HSAuditTable = document.createElement('table');
	HSAuditTable.setAttribute('id','monthlyAuditTbl');
	HSAuditTable.setAttribute('class','striped');
	var tableHeader = document.createElement('thead');
	var headerRow = document.createElement('tr');
	for(var i=0; i<3;i++){
		var headerCell = document.createElement('th');
		headerCell.setAttribute('class','center-align');
		if(i==1){
			var cellText = document.createTextNode('%');
			headerCell.appendChild(cellText);
		}else if(i==2){
			var cellText = document.createTextNode('Score');
			headerCell.appendChild(cellText);
		}	
		headerRow.appendChild(headerCell);
	}
	tableHeader.appendChild(headerRow);
	HSAuditTable.appendChild(tableHeader);
	var tableBody = document.createElement('tbody');
	var numOfRows = projectMonths.length;
	for(var j=0;j<numOfRows;j++){
		var bodyRow = document.createElement('tr');
		var	percentage =result.HSData[1][projectMonths[j]];
		var	score = result.HSData[0][projectMonths[j]];
		if(percentage==undefined){percentage=0};
		if(score==undefined){score=0};
		for(var k=0; k<3;k++){
			var bodyCell = document.createElement('td');
			switch(k){
				case 0:
					bodyCell.appendChild(document.createTextNode(projectMonths[j]));
					break;
				case 1:
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id',projectMonths[j]+'Pct');
					bodyCellInput.setAttribute('name',projectMonths[j]+'Pct');	
					bodyCellInput.value = percentage;
					bodyCell.appendChild(bodyCellInput);
					break;
				case 2:
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id',projectMonths[j]+'Value');
					bodyCellInput.setAttribute('name',projectMonths[j]+'Value');
					bodyCellInput.value = score;
					bodyCell.appendChild(bodyCellInput);
					break;
			}
			bodyRow.appendChild(bodyCell);
		}
		tableBody.appendChild(bodyRow);
	}
	HSAuditTable.appendChild(tableBody);
	tableLocation.appendChild(HSAuditTable);
}

function tblAccidentType(location){
	var accidentTypeTblLoc=document.querySelector(location);
	var typeTable = document.createElement('table');
	typeTable.setAttribute('id','accidentsType');
	typeTable.setAttribute('class','striped');
	var tableHeader = document.createElement('thead');
	var headerRow = document.createElement('tr');	
	for(var i=0;i<2;i++){
		var headerRowCell = document.createElement('th');
		var headerText;
		switch(i){
			case 0:
				headerText=document.createTextNode('Type');
				break;
			case 1:
				headerText=document.createTextNode('Frequency');
		}
		headerRowCell.appendChild(headerText);
		headerRow.appendChild(headerRowCell);
	}
	tableHeader.appendChild(headerRow);
	typeTable.appendChild(tableHeader);
	var tableBody = document.createElement('tbody');
	var typeData = ['abdomen','arms','back','burns','chest','eyes','face','feet','hands','head','jaw','legs','muscular','neck','pelvis','penis','shoulder','skeletal'];
	var rowNum = typeData.length;
	for(var j=0;j<rowNum;j++){
		if(elem != 'ContractNumber'){
			var tableBodyRow = document.createElement('tr');
			for(var k=0; k<2;k++){
				var bodyRowCell =document.createElement('td');
				var bodyRowCellText;
				switch(k){
					case 0:
						bodyRowCellText = document.createTextNode(typeData[j]);
						bodyRowCell.appendChild(bodyRowCellText);
						break;
					case 1:
						var cellID = getTypeFieldID(typeData[j])
						var bodyCellInput = document.createElement('input');
						bodyCellInput.setAttribute('type','number');
						bodyCellInput.setAttribute('id',typeData[j]+'Value');
						bodyCellInput.setAttribute('name',typeData[j]+'Value');
						bodyCellInput.value = '0';
						bodyRowCell.appendChild(bodyCellInput);
						break;
				}
				
				tableBodyRow.appendChild(bodyRowCell);
			}
			tableBody.appendChild(tableBodyRow);
		}
	}
	typeTable.appendChild(tableBody);
	accidentTypeTblLoc.appendChild(typeTable);
}

function tblAccidentTrade(location){
	var accidentTradeTblLoc=document.querySelector(location);
	var tradeTable = document.createElement('table');
	tradeTable.setAttribute('id','accidentsTrade');
	tradeTable.setAttribute('class','striped');
	var tableHeader = document.createElement('thead');
	var headerRow = document.createElement('tr');	
	for(var i=0;i<2;i++){
		var headerRowCell = document.createElement('th');
		var headerText;
		switch(i){
			case 0:
				headerText=document.createTextNode('Type');
				break;
			case 1:
				headerText=document.createTextNode('Frequency');
		}
		headerRowCell.appendChild(headerText);
		headerRow.appendChild(headerRowCell);
	}
	tableHeader.appendChild(headerRow);
	tradeTable.appendChild(tableHeader);
	var tableBody = document.createElement('tbody');
	var tradeData = ['asbestosRemoval','brickwork','carpentry','cladding','cleaning','demolition','electrical','fencing','flooring','forklift','frame','glazing','groundwork','insulation','labourer','landscaping','lifts','lightningProtection','management','mastic','mechanical','metalwork','paintingandDecoration','pestControl','piling','plastering','plumbing','render','roofing','scaffolding','steelwork','tiling','treeSurgery','waterProofing','windows'];
	var rowNum = tradeData.length;
	for(var j=0;j<rowNum;j++){
		var tableBodyRow = document.createElement('tr');
		for(var k=0; k<2;k++){
			var bodyRowCell =document.createElement('td');
			var bodyRowCellText;
			switch(k){
				case 0:
					bodyRowCellText = document.createTextNode(tradeData[j]);
					bodyRowCell.appendChild(bodyRowCellText);
					break;
				case 1:
					var cellID = getTradeFieldID(tradeData[j])
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','number');
					bodyCellInput.setAttribute('id',tradeData[j]+'Value');
					bodyCellInput.setAttribute('name',tradeData[j]+'Value');
					bodyCellInput.value = '0';
					bodyRowCell.appendChild(bodyCellInput);
					break;
			}
			tableBodyRow.appendChild(bodyRowCell);
		}
		tableBody.appendChild(tableBodyRow);
	}
	tradeTable.appendChild(tableBody);
	accidentTradeTblLoc.appendChild(tradeTable);
}

function createAccidentReportTbl(){
	var tableLocation = document.querySelector('#tblAccidentReport');
	var accidentReportTable = document.createElement('table');
	accidentReportTable.setAttribute('class','striped');
	accidentReportTable.setAttribute('id','AccidentReportTbl');
	var tblHead = document.createElement('thead');
	var tblHeadRow = document.createElement('tr');
	for(var i=0;i<5;i++){
		var tblHeadRowCell = document.createElement('th');
		var tblHeadRowCellTxt;
		switch(i){
			case 0:
				tblHeadRowCellTxt=document.createTextNode('Date');
				break;
			case 1:
				tblHeadRowCellTxt=document.createTextNode('Trade');
				break;
			case 2:
				tblHeadRowCellTxt=document.createTextNode('Type');
				break;
			case 3:
				tblHeadRowCellTxt=document.createTextNode('Lost Days');
				break;
			case 4:
				tblHeadRowCellTxt=document.createTextNode('Riddor');
				break;
		}
		tblHeadRowCell.appendChild(tblHeadRowCellTxt);
		tblHeadRow.appendChild(tblHeadRowCell);
	}
	tblHead.appendChild(tblHeadRow);
	accidentReportTable.appendChild(tblHead);
	var tblBody = document.createElement('tbody');
	var tblLength = result.AccidentReport.length;
	var fieldIdentifier = 1;
	for(var j=0;j<tblLength;j++){
		var bodyRow = document.createElement('tr');
		for(var k=0;k<5;k++){
			var rowCell = document.createElement('td');
			var cellInput = document.createElement('input');
			var fieldID = 'accidentReport';
			switch(k){
				case 0:
					cellInput.setAttribute('class','datepicker');
					cellInput.setAttribute('type','text');
					cellInput.setAttribute('id','_datepicker_'+fieldID+(parseInt(j)+1));
					cellInput.setAttribute('onChange','constructDate()');
					var hiddenInput  = document.createElement('input');
					hiddenInput.setAttribute('type','hidden');
					hiddenInput.setAttribute('name',fieldID+(parseInt(j)+1)+'_hour');
					hiddenInput.setAttribute('value','0');
					rowCell.appendChild(hiddenInput);
					var hiddenInput2  = document.createElement('input');
					hiddenInput2.setAttribute('type','hidden');
					hiddenInput2.setAttribute('name',fieldID+(parseInt(j)+1)+'_minute');
					hiddenInput2.setAttribute('value','0');
					rowCell.appendChild(hiddenInput2);
					var hiddenInput3  = document.createElement('input');
					hiddenInput3.setAttribute('type','hidden');
					hiddenInput3.setAttribute('name',fieldID+(parseInt(j)+1)+'_second');
					hiddenInput3.setAttribute('value','0');
					rowCell.appendChild(hiddenInput3);
					var hiddenInput4  = document.createElement('input');
					hiddenInput4.setAttribute('type','hidden');
					hiddenInput4.setAttribute('name',fieldID+(parseInt(j)+1)+'_ampm');
					hiddenInput4.setAttribute('value','0');
					rowCell.appendChild(hiddenInput4);
					var hiddenInput5  = document.createElement('input');
					hiddenInput5.setAttribute('type','hidden');
					hiddenInput5.setAttribute('name',fieldID+(parseInt(j)+1)+'_dirtyFlag');
					hiddenInput5.setAttribute('value','0');
					rowCell.appendChild(hiddenInput5);
					var hiddenInput6  = document.createElement('input');
					hiddenInput6.setAttribute('type','hidden');
					hiddenInput6.setAttribute('name',fieldID+(parseInt(j)+1));
					hiddenInput6.setAttribute('id',fieldID+(parseInt(j)+1));
					hiddenInput6.setAttribute('value','[LL_FormTag'+fieldID+'/]');
					rowCell.appendChild(hiddenInput6);
					break;
				case 1:
					cellInput.setAttribute('type','text');
					cellInput.setAttribute('id',fieldID+(parseInt(j)+1)+'Trade');
					break;
				case 2:
					cellInput.setAttribute('type','text');
					cellInput.setAttribute('id',fieldID+(parseInt(j)+1)+'Type');
					break;
				case 3:
					cellInput.setAttribute('type','text');
					cellInput.setAttribute('id',fieldID+(parseInt(j)+1)+'LostDays');
					break;
				case 4:
					cellInput.setAttribute('type','text');
					cellInput.setAttribute('id',fieldID+(parseInt(j)+1)+'Riddor');
					break;
			}
			rowCell.appendChild(cellInput);
			bodyRow.appendChild(rowCell);
		}
		tblBody.appendChild(bodyRow);
	}
	accidentReportTable.appendChild(tblBody);
	tableLocation.appendChild(accidentReportTable);
}

function createDaysLostTbl(){
	var tblLocation = document.querySelector('#daysLostContent');
	var DaysLostTable = document.createElement('table');
	DaysLostTable.setAttribute('id','daysLostTbl');
	DaysLostTable.setAttribute('class','striped');
	var tableHeader=document.createElement('thead');
	var headerRow = document.createElement('tr');
	for(var i=0;i<3;i++){
		var headerRowCell=document.createElement('th');
		var headerRowCellTxt;
		switch(i){
			case 0:
				headerRowCellTxt=document.createTextNode('Month');
				break;
			case 1:
				headerRowCellTxt=document.createTextNode('Riddor (7Days +)');
				break;
			case 2:
				headerRowCellTxt=document.createTextNode('Non-Riddor Lost time 0-6 Days');
				break;
		}
		headerRowCell.appendChild(headerRowCellTxt);
		headerRow.appendChild(headerRowCell);
	}
	tableHeader.appendChild(headerRow);
	DaysLostTable.appendChild(tableHeader);
	var tableBody = document.createElement('tbody');
	var latestMonth = projectMonths[projectMonths.length-1];
	tableLength=projectMonths.length;
	for(var j=0;j<tableLength;j++){
		var bodyRow = document.createElement('tr');
		for(var k=0;k<3;k++){
			var bodyRowCell = document.createElement('td');
			bodyRowCell.setAttribute('class','center-align');
			var bodyRowCellTxt;
			switch(k){
				case 0:
					bodyRowCell.appendChild(document.createTextNode(projectMonths[j]));
					break;
				case 1:
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id','riddor'+projectMonths[j]);
					bodyCellInput.setAttribute('name','riddor'+projectMonths[j]);
					bodyCellInput.setAttribute('value',0);
					bodyRowCell.appendChild(bodyCellInput);
					break;
				case 2:
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id','nonRiddor'+projectMonths[j]);
					bodyCellInput.setAttribute('name','nonRiddor'+projectMonths[j]);
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

function HSMonthlyAuditAvg(){
	var HSsum=0;
	var numberOfMonths=0;
	for(var i=0;i<projectMonths.length;i++){
		if(projectMonths[i]!="___rowNum__"){
			var currentMonth = projectMonths[i];
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

function HSMonthlyAuditAvgPct(){
	var HSsum=0;
	var numberOfMonths=0;
	for(var i=0;i<projectMonths.length;i++){
		if(projectMonths[i]!="___rowNum__"){
			var currentMonth = projectMonths[i];
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

function populateAccidentReportTbl(){
	var middleOfFieldID=1;
	var dateMonth;
	var dateYear;
	for(var prop in result.AccidentReport){
		if(result.AccidentReport.hasOwnProperty(prop)){
			for(var innerProp in result.AccidentReport[prop]){
				if(middleOfFieldID==51){middleOfFieldID=1};
				if(innerProp!='ContractNumber' && typeof(innerProp)!==undefined){
					if(innerProp=='Date'){
						var fieldID ='#_datepicker_accidentReport'+(parseInt(prop)+1);
						dateMonth= result.AccidentReport[prop]["Date"].substr(3,2);
						dateYear = result.AccidentReport[prop]["Date"].substr(6,2);

					}else{
						var fieldID = '#accidentReport'+(parseInt(prop)+1)+innerProp;
					}
					document.querySelector(fieldID).value = result.AccidentReport[prop][innerProp];
					switch(innerProp){
						case 'Type':
							var type = result.AccidentReport[prop][innerProp];
							var typeTableID = '#'+getTypeFieldID(type);
							var currentTypeValue = document.querySelector(typeTableID).value;
							document.querySelector(typeTableID).value=++currentTypeValue;
							break;
						case 'Trade':
							var trade = getTradeCategory(result.AccidentReport[prop][innerProp]);
							var tradeTableID = '#'+getTradeFieldID(trade);
							var currentTradeValue = document.querySelector(tradeTableID).value;
							document.querySelector(tradeTableID).value=++currentTradeValue;
							break;
						case 'LostDays':
							var newdaysLost =parseInt(result.AccidentReport[prop][innerProp].replace(/[^0-9 ]/g, ""));
							var lostDaysFieldID='#'+findLostDaysID(dateMonth,dateYear,'nonRiddor');
							var totalLostDays=parseInt(document.querySelector(lostDaysFieldID).value);
							if(newdaysLost<7){
								totalLostDays+=newdaysLost;
								document.querySelector(lostDaysFieldID).value=totalLostDays;
							}
							document.querySelector(lostDaysFieldID).setAttribute('value',totalLostDays);
							break;
						case 'Riddor':
							var riddorFieldID='#'+findLostDaysID(dateMonth,dateYear,'riddor');
							var totalRiddor = parseInt(document.querySelector(riddorFieldID).value);
							var riddor = parseInt(result.AccidentReport[prop][innerProp]);
							totalRiddor+=riddor;
							document.querySelector(riddorFieldID).value=totalRiddor;
							document.querySelector(riddorFieldID).setAttribute('value',totalLostDays);
							break;
					};
				}
			}
		}
	}
}

function findLostDaysID(month, year, fieldType){
	var writtenMonth = getMonthName(month);
	var fieldDate = writtenMonth+year;
	if(fieldType=='nonRiddor'){
		var fieldID = 'nonRiddor'+fieldDate;
	}else{
		var fieldID = 'riddor'+fieldDate;
	}
	return fieldID;
}