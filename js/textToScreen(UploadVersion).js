	
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
			if (sheetName=="considerateConstructors" ||sheetName=="SubConFinData" || sheetName=="HSData" || sheetName=="monthlyKPI"|| sheetName=="RecordOfLabour"|| sheetName=="financialData"|| sheetName=="TradeAccidents"|| sheetName=="AccidentReport" ){

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
	getRecordOfLabour();
	getProjectMonths();
	createSummarySections();
	createProjectKpiSection();
	createProgressSection('progress');
	createSubContractorSection('subContractorData');
	createFinancialDataSection();
	createHSDataSection('hsData');
	getmonthlyCWDTotals();
	getCWDTotals();
	populateTables();
	
	return result;
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

function getRecordOfLabour(){
	
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
	var fieldID = '_1_1_179_';
	var tradeFieldIdLookup={
		'asbestosremoval':function(){fieldID+='1_181_1';},
		'brickwork':function(){fieldID+='2_181_1';},
		'carpentry':function(){fieldID+='3_181_1';},
		'cladding':function(){fieldID+='4_181_1';},
		'cleaning':function(){fieldID+='5_181_1';},
		'demolition':function(){fieldID+='6_181_1';},
		'electrical':function(){fieldID+='7_181_1';},
		'fencing':function(){fieldID+='8_181_1';},
		'flooring':function(){fieldID+='9_181_1';},
		'forklift':function(){fieldID+='10_181_1';},
		'frame':function(){fieldID+='11_181_1';},
		'glazing':function(){fieldID+='12_181_1';},
		'groundwork':function(){fieldID+='13_181_1';},
		'insulation':function(){fieldID+='14_181_1';},
		'labourer':function(){fieldID+='15_181_1';},
		'landscaping':function(){fieldID+='16_181_1';},
		'lifts':function(){fieldID+='17_181_1';},
		'lightningprotection':function(){fieldID+='18_181_1';},
		'management':function(){fieldID+='19_181_1';},
		'mastic':function(){fieldID+='20_181_1';},
		'mechanical':function(){fieldID+='21_181_1';},
		'metalwork':function(){fieldID+='22_181_1';},
		'paintinganddecoration':function(){fieldID+='23_181_1';},
		'pestcontrol':function(){fieldID+='24_181_1';},
		'piling':function(){fieldID+='25_181_1';},
		'plastering':function(){fieldID+='26_181_1';},
		'plumbing':function(){fieldID+='27_181_1';},
		'render':function(){fieldID+='28_181_1';},
		'roofing':function(){fieldID+='29_181_1';},
		'scaffolding':function(){fieldID+='30_181_1';},
		'steelwork':function(){fieldID+='31_181_1';},
		'tiling':function(){fieldID+='32_181_1';},
		'treesurgery':function(){fieldID+='33_181_1';},
		'waterproofing':function(){fieldID+='34_181_1';},
		'windows':function(){fieldID+='35_181_1';}
	};
	(tradeFieldIdLookup[tradeName])();
	return fieldID;
}

function getTypeFieldID(type){
	var typeName =getTypeCategory(type); 
	var fieldID = '_1_1_180_';
	var typeFieldIdLookup={
		'Abdomen':function(){fieldID+='1_182_1';},
		'Arms':function(){fieldID+='2_182_1';},
		'Back':function(){fieldID+='3_182_1';},
		'Burns':function(){fieldID+='4_182_1';},
		'Chest':function(){fieldID+='5_182_1';},
		'Eyes':function(){fieldID+='6_182_1';},
		'Face':function(){fieldID+='7_182_1';},
		'Feet':function(){fieldID+='8_182_1';},
		'Hands':function(){fieldID+='9_182_1';},
		'Head':function(){fieldID+='10_182_1';},
		'Jaw':function(){fieldID+='11_182_1';},
		'Legs':function(){fieldID+='12_182_1';},
		'Muscular':function(){fieldID+='13_182_1';},
		'Neck':function(){fieldID+='14_182_1';},
		'Pelvis':function(){fieldID+='15_182_1';},
		'Penis':function(){fieldID+='16_182_1';},
		'Shoulder':function(){fieldID+='17_182_1';},
		'Skeletal':function(){fieldID+='18_182_1';}
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
			document.getElementById(section[i]).style.display = "none";
		}else{
			document.getElementById(section[i]).style.display = "block";
		}
	}
	document.body.scrollTop = 0;
}

function hideInput(){
	var inputFields = document.getElementById("inputData");
	inputFields.style.display="none";
}

function conNum(){con=document.getElementById("contractNumber").value;}


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
	var rows = table.rows;
	var cells;
	var t;
	for(var i=1; i<rows.length;i++){
		cells=rows[i].cells;
		t=[];
		for(var j=0;j<cells.length;j++){
			t.push(cells[j].textContent);
		}
		tableArray.push(t)
	}
	
	return tableArray;
}

function considerateConstractorsAverage(location){
	var table = tableToArray(document.getElementById('considerContractorTbl'));
	var rowNum= table.length;
	var scoreTotal=0;
	var scoreAverage;
	for(var i=0;i<rowNum;i++){
		scoreTotal+=parseInt(table[i][1]);
	}
	scoreAverage=(scoreTotal/rowNum).toFixed(0);
	if(isNaN(scoreAverage) || scoreAverage<1){
		document.getElementById(location).value='';
	}else{
		document.getElementById(location).value = scoreAverage;
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

//traffic light filters

function moreThanZero(figure, location){
	if(String(figure).charAt(0)=='£'){
		var figureLength = figure.length;
		var numericFigure = figure.substr(2,figureLength);
	}else{
		var numericFigure = figure;
	}
	if(parseInt(numericFigure)>0){
		document.getElementById(location).setAttribute('class','green-text center-align');
	}
	else if(parseInt(numericFigure)<0){
		document.getElementById(location).setAttribute('class','red-text center-align');
	}else{
		document.getElementById(location).setAttribute('class','orange-text center-align');
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
		document.getElementById(location).setAttribute('class','red-text center-align');
	}
	else if(parseInt(numericFigure)<0){
		document.getElementById(location).setAttribute('class','green-text center-align');
	}else{
		document.getElementById(location).setAttribute('class','orange-text center-align');
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
		document.getElementById(location).setAttribute('class','red-text center-align');
	}else{
		document.getElementById(location).setAttribute('class','green-text center-align');
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
		document.getElementById(location).setAttribute('class','red-text center-align');
	}
	else{
		document.getElementById(location).setAttribute('class','green-text center-align');
	}
}

function targetComparison(projectKpiFigure, monthlyKpiFigure, location){
	var projectKpi = projectKpiFigure
	if(projectKpi==''){projectKpi='0'};
	if(parseInt(monthlyKpiFigure)>parseInt(projectKpi)){
		document.getElementById(location).setAttribute('class','red-text center-align');
	}else{
		document.getElementById(location).setAttribute('class','green-text center-align');
	}
}

function progressTrafficLight(figure, location){
	var progressFigure= parseInt(figure);
	if(progressFigure < -2){
		document.getElementById(location).setAttribute('class','red-text center-align');
	}else if(progressFigure>=0){
		document.getElementById(location).setAttribute('class','green-text center-align');
	}else{
		document.getElementById(location).setAttribute('class','orange-text center-align');
	}
}

//Populating tables
function findConsiderateConstructorVariance(){
	var considerateConstructorScore = document.getElementById('_1_1_224_7_229_1').value-document.getElementById('_1_1_224_7_228_1').value;
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
	var indexOfLastItem = result.monthlyKPI.length-1;
	return indexOfLastItem;
}

function getLastTurnoverItem(){
	turnoverData = result.Turnover
}


function getObjectLastProperty(objectName){
	var currentObject = objectName;
	var lastPropertyIndex = Object.keys(currentObject).length-1
	var lastProperty =Object.keys(currentObject)[lastPropertyIndex];
	return lastProperty;
}

function populateTables(){
	weeksCompleted = parseInt(result.timeValue.WeeksCompleted);
	tblAccidentType('ByTypeTbl');
	tblAccidentTrade('ByTradeTbl');
	//Import CWD and Record Of Labour Information
	createTimeTable();
	createValueTable();
	//createConsiderateConstructorsTable('considerateContractorsTbl');
	createRecordOfLabourTable();
	createValuationInfoTbl();
	createOverheardContributionTbl();
	populateOverheadContributionTbl();
	createCompletionDatesTbl();
	createProgressTbl();
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
	document.getElementById('_1_1_134_1_139_1').value=result.timeValue.WeeksCompleted;
	document.getElementById('_1_1_134_1_140_1').value=result.timeValue.WeeksContracted;
	HSMonthlyAuditAvg();
	HSMonthlyAuditAvgPct();
	//Summary Section
	populateValuationInfoTbl();
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
}

function populateKpiTable(){
	//Adherence to Prelim Budget
	document.getElementById('_1_1_224_0_225_1').value = result.projectKPIs.AdherenceTgtPct;
	document.getElementById('_1_1_224_0_228_1').value = result.projectKPIs.AdherenceTarget;
	document.getElementById('_1_1_224_0_229_1').value = result.projectKPIs.AdherenceActual;
	percentageDifference(result.projectKPIs.AdherenceActual,result.projectKPIs.AdherenceTarget,'_1_1_224_0_226_1');
	calculateVariance(document.getElementById('_1_1_224_0_226_1').value,result.projectKPIs.AdherenceTgtPct, '_1_1_224_0_227_1');
	calculateVariance(result.projectKPIs.AdherenceActual, result.projectKPIs.AdherenceTarget, "_1_1_224_0_230_1" );
	//Monthly Predictability of Cash Flow
	document.getElementById('_1_1_224_1_225_1').value = result.projectKPIs.MonthlyCashFlowPredTgtPct;
	document.getElementById('_1_1_224_1_228_1').value = result.valueInformation.QtrTurnOverMonthForeCast;//same as forecastMTurnover
	document.getElementById('_1_1_224_1_229_1').value = result.valueInformation.MonthlyValue;//same as valMTurnover
	calculateVariance(result.valueInformation.MonthlyValue, result.valueInformation.QtrTurnOverMonthForeCast, '_1_1_224_1_230_1' );
	percentageDifference(result.valueInformation.MonthlyValue,result.valueInformation.QtrTurnOverMonthForeCast,'_1_1_224_1_226_1')
	calculatePercentageVariance(document.getElementById('_1_1_224_1_226_1').value, result.projectKPIs.MonthlyCashFlowPredTgtPct, '_1_1_224_1_227_1' );
	//Quarterly Predictability of Cash Flow
	document.getElementById('_1_1_224_2_225_1').value = result.projectKPIs.QtrCashFlowPredTgtPct;
	document.getElementById('_1_1_224_2_228_1').value = result.valueInformation.QtrTurnOverCumForeCast;//same as forecastMTurnover
	document.getElementById('_1_1_224_2_229_1').value = result.valueInformation.QtrTurnOverCumActual;//same as valMTurnover
	calculateVariance(result.valueInformation.QtrTurnOverCumActual, result.valueInformation.QtrTurnOverCumForeCast, '_1_1_224_2_230_1' );
	percentageDifference(result.valueInformation.QtrTurnOverCumActual,result.valueInformation.QtrTurnOverCumForeCast,'_1_1_224_2_226_1')
	calculatePercentageVariance(document.getElementById('_1_1_224_1_226_1').value, result.projectKPIs.QtrCashFlowPredTgtPct, '_1_1_224_2_227_1' );
	//Non-Recoverable Works
	document.getElementById('_1_1_224_3_225_1').value = result.projectKPIs.NonRecWorksTgtPct;
	document.getElementById('_1_1_224_3_226_1').value = ((result.projectKPIs.NonRecWorksActPct)*100).toFixed(0);
	document.getElementById('_1_1_224_3_228_1').value = '0';
	document.getElementById('_1_1_224_3_229_1').value = result.projectKPIs.NonRecoverableWorks;
	calculateVariance(result.projectKPIs.NonRecoverableWorks, document.getElementById('_1_1_224_3_228_1').value, '_1_1_224_3_230_1');
	calculatePercentageVariance(document.getElementById('_1_1_224_3_226_1').value, result.projectKPIs.NonRecWorksTgtPct, '_1_1_224_3_227_1' );
	//Predicability of Programme
	document.getElementById('_1_1_224_4_228_1').value = 100;
	document.getElementById('_1_1_224_4_229_1').value = result.projectKPIs.PredOfProgrammeAct;
	calculatePercentageVariance(result.projectKPIs.PredOfProgrammeAct,document.getElementById('_1_1_224_4_228_1').value,  '_1_1_224_4_230_1' );
	//HS Audit Score
	document.getElementById('_1_1_224_5_225_1').value = result.projectKPIs.HAuditScoreTgtPct;
	HSMonthlyAuditAvgPct();
	calculatePercentageVariance(document.getElementById('_1_1_224_5_226_1').value,document.getElementById('_1_1_224_5_225_1').value,'_1_1_224_5_227_1');

	//Considerate Constructor
	document.getElementById('_1_1_224_7_228_1').value=35;
	//considerateConstractorsAverage('_1_1_224_7_229_1');
	document.getElementById('_1_1_224_7_225_1').value = findPercentage(parseFloat(document.getElementById('_1_1_224_7_228_1').value),50);
	document.getElementById('_1_1_224_7_226_1').value = findPercentage(parseFloat(document.getElementById('_1_1_224_7_229_1').value),50);
	calculatePercentageVariance(document.getElementById('_1_1_224_7_226_1').value, document.getElementById('_1_1_224_7_225_1').value, '_1_1_224_7_227_1' );
	document.getElementById('_1_1_224_7_230_1').value=findConsiderateConstructorVariance();
	//HS Accident Incident Rate
	document.getElementById('_1_1_224_6_225_1').value = result.projectKPIs.HSAccidentIncidentRateTgtPct;
	document.getElementById('_1_1_224_6_226_1').value = result.projectKPIs.HSAccidentIncidentRateActPct;
	calculatePercentageVariance(document.getElementById('_1_1_224_6_226_1').value, document.getElementById('_1_1_224_6_225_1').value, '_1_1_224_6_227_1');
	//Percentage Recycled
	document.getElementById('_1_1_224_9_225_1').value = result.projectKPIs.PctRecycledWasteTgt;
	document.getElementById('_1_1_224_9_226_1').value = result.projectKPIs.PctRecycledWasteAct;
	calculatePercentageVariance(result.projectKPIs.PctRecycledWasteAct,result.projectKPIs.PctRecycledWasteTgt, '_1_1_224_9_227_1')

	//Waste per £100k
	document.getElementById('_1_1_224_10_228_1').value=15;
	document.getElementById('_1_1_224_10_229_1').value = result.monthlyKPI[result.monthlyKPI.length-1].Wstper100kM3
	//Water m3 per £100k
	document.getElementById('_1_1_224_11_229_1').value = result.monthlyKPI[result.monthlyKPI.length-1].waterM3Per100k
	//Energy Kg CO2 per £100k
	document.getElementById('_1_1_224_12_229_1').value = result.monthlyKPI[result.monthlyKPI.length-1].emitFromEnergyKgCo2Per100k

	//document.getElementById('energy100kAct').innerHTML = document.getElementById('emitFromEnergyKgCo2Per100k_'+projectMonths.length).innerHTML;
}


function populateProgressTbl(){
	var progressInfo = result.progress;
	var progressItem = getObjectLastProperty(progressInfo);
	var progressField = '_1_1_218_1_252_1';
	document.getElementById('_1_1_218_1_222_1').value = progressItem;
	progressTrafficLight(document.getElementById(progressField).value = progressInfo[progressItem], progressField);
}


//calculation functions
function calculateVariance(fig1, fig2, targetField){
	var difference = (parseFloat(fig1.replace(/,/g, '')) - parseFloat(fig2.replace(/,/g, ''))).toFixed(0);
	var numericVariance = difference;
	moreThanZero(document.getElementById(targetField).value = numericVariance, targetField);
}

function calculatePercentageVariance(fig1, fig2, targetField){
	if(isNaN(fig1)||fig1==''||isNaN(fig2)||fig2==''){
		document.getElementById(targetField).value='';
	}else{
		var difference = (parseFloat(fig1.replace(/,/g, '')) - parseFloat(fig2.replace(/,/g, '')));
		var variance = ((difference/fig2)*100).toFixed(1);
		var numericVariance = parseFloat(variance);
		moreThanZero(document.getElementById(targetField).value = numericVariance, targetField);
	}
}

function percentageDifference(actualFig, targetFig, percentageField){
	var actualDifference = ((Number(actualFig)/Number(targetFig))*100).toFixed(0);
	document.getElementById(percentageField).value=actualDifference; 
}

//summary section - structure

function createSummarySections(){
	createTopSummaryRow('summary-page');
	createBottomSummaryRow('summary-page');
}

function createTopSummaryRow(location){
	var rowLocation = document.getElementById(location);
	var rowContents = createDiv('topRow', 'row');
	var leftDiv= createMultiDataCard('col s12 l6', 'financial', 2, 'Financial', ['Value Information','Summary of Overhead Contribution']);
	rowContents.appendChild(leftDiv);
	var rightDiv = createDataCard('col s12 l6', 'completionDate', 'completionTable', 'CompletionDates');
	rowContents.appendChild(rightDiv);
	rowLocation.appendChild(rowContents);
}

function createBottomSummaryRow(location){
	var rowLocation = document.getElementById(location);
	var rowContents = createDiv('bottomRow','row');
	
	rowLocation.appendChild(rowContents);
}

//summary section - create tables

function createValuationInfoTbl(){
	var tableLocation = document.getElementById('ValueInformationTbl')
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
	var valInfoRowIds=['val','valM','forecastM','monthlyVariance','qtrValue','qtrForecast','qtrVariance'];
	var valInfoRows=['Valuation to Date','Value in Month', 'Forecast for Month', 'Variance','Value in Quarter','Forecast for Quarter','Variance'];
	var tableBody = document.createElement('tbody');
	for(var i=0; i<valInfoRows.length;i++){
		var bodyRow = document.createElement('tr');
		var fieldID='_1_1_231_'+(i+1);
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
					bodyCellInput.setAttribute('id',fieldID+'_232_1'); 
					bodyCellInput.setAttribute('name',fieldID+'_232_1');
					bodyCell.appendChild(bodyCellInput);
					break;
				case 2:
					var bodyCell = document.createElement('td');
					var bodyCellInput = document.createElement('input');
					bodyCellInput.setAttribute('class','center-align');
					bodyCellInput.setAttribute('type','text');
					bodyCellInput.setAttribute('id',fieldID+'_233_1'); 
					bodyCellInput.setAttribute('name',fieldID+'_233_1');
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
	var overheadContributionTblLoc = document.getElementById('SummaryofOverheadContributionTbl');
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
			var fieldID='_1_1_234_'+(i+1);
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
					bodyRowInput.setAttribute('id',fieldID + '_235_1');
					bodyRowInput.setAttribute('name',fieldID + '_235_1');
					tblBodyRowCell.appendChild(bodyRowInput);
					tblBodyRow.appendChild(tblBodyRowCell);
					break;
				case 2:
					tblBodyRowCell = document.createElement('td');
					var bodyRowInput = document.createElement('input');
					bodyRowInput.setAttribute('class','center-align');
					bodyRowInput.setAttribute('type','text');
					bodyRowInput.setAttribute('id',fieldID + '_236_1');
					bodyRowInput.setAttribute('name',fieldID + '_236_1');
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

function createCompletionDatesTbl(){
	var tableLocation = document.getElementById('completionTable');
	var completionDateTbl = document.createElement('table');
	completionDateTbl.setAttribute('class','striped');
	var tableBody = document.createElement('tbody');
	var row;
	var rowID;
	for(var j=0; j<2; j++){
		var bodyRow = document.createElement('tr');
		if(j==0){
			row = 'Contractual End Date';
			rowID = '_1_1_134_1_141_1';
		}else{
			row ='Estimate End Date';
			rowID = '_1_1_134_1_142_1'; 
		}
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
	document.getElementById('_1_1_134_1_141_1').value = result.timeValue.ConCompDate;
	document.getElementById('_1_1_134_1_142_1').value = result.timeValue.EstCompDate;
}

//summary section - fill tables
function populateValuationInfoTbl(){
	document.getElementById('_1_1_231_1_232_1').value = result.valueInformation.CumulativeValueGross;
	document.getElementById('_1_1_231_1_233_1').value = result.valueInformation.CumulativeProfitGross;
	document.getElementById('_1_1_231_2_232_1').value = result.valueInformation.MonthlyValue;
	document.getElementById('_1_1_231_2_233_1').value = result.valueInformation.MonthlyProfit;
	document.getElementById('_1_1_231_3_232_1').value = parseInt(result.valueInformation.QtrTurnOverMonthForeCast);
	document.getElementById('_1_1_231_3_233_1').value = result.valueInformation.QtrProfMonthForeCast;
	calculateVariance(result.valueInformation.MonthlyValue, result.valueInformation.QtrTurnOverMonthForeCast, '_1_1_231_4_232_1');
	calculateVariance(result.valueInformation.MonthlyProfit, result.valueInformation.QtrProfMonthForeCast, '_1_1_231_4_233_1');
	document.getElementById('_1_1_231_5_232_1').value = result.valueInformation.QtrTurnOverCumActual;
	document.getElementById('_1_1_231_5_233_1').value = result.valueInformation.QtrProfCumActual;
	document.getElementById('_1_1_231_6_232_1').value = result.valueInformation.QtrTurnOverCumForeCast;
	document.getElementById('_1_1_231_6_233_1').value = result.valueInformation.QtrProfCumForecast;
	calculateVariance(result.valueInformation.QtrTurnOverCumActual, result.valueInformation.QtrTurnOverCumForeCast, '_1_1_231_7_232_1');
	calculateVariance(result.valueInformation.QtrProfCumActual, result.valueInformation.QtrProfCumForecast, '_1_1_231_7_233_1');
	document.getElementById('_1_1_134_1_139_1').value = weeksCompleted;
	document.getElementById('_1_1_134_1_140_1').value = result.timeValue.WeeksContracted;
	document.getElementById('_1_1_134_1_137_1').value = result.timeValue.TimeCompleted;
	document.getElementById('_1_1_134_1_138_1').value = result.timeValue.TimeRemaining;
	document.getElementById('_1_1_134_1_135_1').value = result.timeValue.ValueCompleted;
	document.getElementById('_1_1_134_1_136_1').value = result.timeValue.ValueRemaining;
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
					fieldID='_1_1_234_'+(i+1)+'_235_1'
					if(dataRef=='GrossTotal'){
						moreThanZero(document.getElementById(fieldID).value = overheadData[dataRef],fieldID);
					}else{
						document.getElementById(fieldID).value=overheadData[dataRef];
					}
					break;
				case 1:
					dataRef = 'Movement'+ tblRows[i];
					fieldID='_1_1_234_'+(i+1)+'_236_1'
					if(dataRef=='MovementTotal'){
						moreThanZero(document.getElementById(fieldID).value = overheadData[dataRef],fieldID);
					}else{
						document.getElementById(fieldID).value=overheadData[dataRef];
					}
					break;
			}
		}
	}
}



//Progress Graphs Section
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
	var recOfLbrTbl = document.getElementById("recOfLbr");
	var rowNums = document.getElementById("recOfLbr").rows.length-1;
	var cellNum = recOfLbrTbl.rows[rowNums].cells.length;
	var recordOfLabourFigures = [];
	for(var i=0;i<cellNum;i++){
		if(i!=0&&i!=8)
		recordOfLabourFigures.push(document.getElementById("recOfLbr").rows[rowNums].cells[i].value);
	}
	return recordOfLabourFigures;
}

function getRecordOfLbrTotals(){
	var recOfLbrTbl = document.getElementById("recOfLbr");
	var rowNums = document.getElementById("recOfLbr").rows.length-1;
	var cellNum = recOfLbrTbl.rows[rowNums].cells.length;
	var recordOfLabourTotals = [];
	for(var i=1;i<rowNums;i++){
		if(i<=50){
			var fieldID = '_1_1_46_'+i+'_55_1';
		}else if(i<=100){
			fieldID ='_1_1_56_'+(i-50)+'_65_1';
		}else if(i<=150){
			fieldID ='_1_1_66_'+(i-100)+'_75_1';
		}else if(i<=200){
			fieldID ='_1_1_76_'+(i-150)+'_95_1';
		}else if(i<=250){
			fieldID ='_1_1_90_'+(i-200)+'_99_1';
		}else if(i<=300){
			fieldID ='_1_1_100_'+(i-250)+'_109_1';
		}else{
			fieldID ='_1_1_110_'+(i-350)+'_119_1';
		}

		recordOfLabourTotals.push(parseInt(document.getElementById(fieldID).value));
	}
	return recordOfLabourTotals;
}

//HS Graph Section
function createEnforcementActionTbl(){
	var tableLocation = document.getElementById('enforcementActionTbl');
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
	var sectionLocation = document.getElementById(location);
	var timeStatsSection = createDiv('timeStats','row');
	var timeTableContainer = createDataCard('col s12 l6', 'timeTable', 'timeTable', 'Time');
	timeStatsSection.appendChild(timeTableContainer);
	var timeChartContainer = createGraphCard('col s12 l6', 'timeChart', 'timeChartContent', 'Time');
	timeStatsSection.appendChild(timeChartContainer);
	sectionLocation.appendChild(timeStatsSection);
}

function createValueStats(location){
	var sectionLocation = document.getElementById(location);
	var valueStatsSection = createDiv('valueStats','row');
	var valueTableContainer = createDataCard('col s12 l6', 'valueTable', 'valueTable', 'Value')
	valueStatsSection.appendChild(valueTableContainer);
	var valueChartContainer = createGraphCard('col s12 l6', 'valueChart', 'valueChartContent', 'Value')
	valueStatsSection.appendChild(valueChartContainer);
	sectionLocation.appendChild(valueStatsSection);
}

//timeValue - create tables
function createTimeTable(){
	var tableLocation = document.getElementById('completionTable');
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
	for(var i=0; i<4;i++){
		var tableRow = document.createElement('tr');
		var rowHeader = document.createElement('td');
		var rowContent= document.createElement('td');
		var rowInput = document.createElement('input')
		switch(i){
			case 0:
				var rowHeaderText=document.createTextNode('Weeks Completed');
				rowInput.setAttribute('id','_1_1_134_1_139_1');
				rowInput.setAttribute('name','_1_1_134_1_139_1');
				rowHeader.appendChild(rowHeaderText);
				rowContent.appendChild(rowInput);
				break;
			case 1:
				var rowHeaderText=document.createTextNode('Weeks Contracted');
				rowInput.setAttribute('type','text');
				rowInput.setAttribute('id','_1_1_134_1_140_1');
				rowInput.setAttribute('name','_1_1_134_1_140_1');
				rowHeader.appendChild(rowHeaderText);
				rowContent.appendChild(rowInput);
				break;
			case 2:
				var rowHeaderText=document.createTextNode('Time Completed %');
				rowInput.setAttribute('type','text');
				rowInput.setAttribute('id','_1_1_134_1_137_1');
				rowInput.setAttribute('name','_1_1_134_1_137_1');
				rowHeader.appendChild(rowHeaderText);
				rowContent.appendChild(rowInput);
				break;
			case 3:
				var rowHeaderText=document.createTextNode('Time Remaining %');
				rowInput.setAttribute('type','text');
				rowInput.setAttribute('id','_1_1_134_1_138_1');
				rowInput.setAttribute('name','_1_1_134_1_138_1');
				rowHeader.appendChild(rowHeaderText);
				rowContent.appendChild(rowInput);
				break;
		}
		
		tableRow.appendChild(rowHeader);
		tableRow.appendChild(rowContent);
		tableBody.appendChild(tableRow);
	}
	timeTable.appendChild(tableBody);
	tableLocation.appendChild(timeTable);
}

function createValueTable(){
	var tableLocation = document.getElementById('completionTable');
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
				rowInput.setAttribute('id','_1_1_134_1_135_1');
				rowInput.setAttribute('name','_1_1_134_1_135_1');
				rowContent.appendChild(rowInput);
				rowHeader.appendChild(rowHeaderText);
				break;
			case 1:
				var rowHeaderText=document.createTextNode('Value Remaining');
				rowInput.setAttribute('id','_1_1_134_1_136_1');
				rowInput.setAttribute('name','_1_1_134_1_136_1');
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


//Project KPI - Structure

function createProjectKpiSection(){
	var rowLocation = document.getElementById('projectKPIs');
	var projectKpiRow = createDiv('projectKPIsRow','row');
	var projectKPIcontainer =createDataCard('col s12 l5', 'projectKPI', 'KpiTable', 'Project KPI\'s')
	projectKpiRow.appendChild(projectKPIcontainer);
	var monthlyKPIcontainer = createDataCard('col s12 l7', 'monthlyKPI', 'monthlyKpiTable', 'Monthly KPI\'s records');
	projectKpiRow.appendChild(monthlyKPIcontainer);
	rowLocation.appendChild(projectKpiRow);
}

//Project KPI - create tables
function createKpiCatTbl(){
	var tblLocation = document.getElementById("KpiTable");
	var kpiHTMLtable = document.createElement('table');
	kpiHTMLtable.setAttribute('class','striped');
	var kpiHeader = document.createElement('thead');
	var kpiHeaderNames = ["","Target","Acutal","Variance",]
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
		var cellRef = '_1_1_224_'+i;
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
						bodyCellInput.setAttribute('id',cellRef+'_225_1');
						bodyCellInput.setAttribute('name',cellRef+'_225_1');
						bodyCell.appendChild(bodyCellInput);
						break;
					case 2: 
						bodyCellInput.setAttribute('id',cellRef+'_226_1');
						bodyCellInput.setAttribute('name',cellRef+'_226_1');
						bodyCell.appendChild(bodyCellInput);
						break;
					case 3: 
						bodyCellInput.setAttribute('id',cellRef+'_227_1');
						bodyCellInput.setAttribute('name',cellRef+'_227_1');
						bodyCell.appendChild(bodyCellInput);
						break;
					case 5: 
						bodyCellInput.setAttribute('id',cellRef+'_228_1');
						bodyCellInput.setAttribute('name',cellRef+'_228_1');
						bodyCell.appendChild(bodyCellInput);
						break;
					case 6: 
						bodyCellInput.setAttribute('id',cellRef+'_229_1');
						bodyCellInput.setAttribute('name',cellRef+'_229_1');
						bodyCell.appendChild(bodyCellInput);
						break;
					case 7: 
						bodyCellInput.setAttribute('id',cellRef+'_230_1');
						bodyCellInput.setAttribute('name',cellRef+'_230_1');
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
	var monthlyKpiTblLoc = document.getElementById('monthlyKpiTable');
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
	var tblRows=['','_6_1','_8_1', '_10_1', '_12_1', '_14_1', '_244_1', '_16_1', '_18_1','_20_1','_22_1','_24_1'];
	var tblBodyRow = document.createElement('tr');
	for(var k=0; k<headerLength; k++){
		var tblBodyRowCell;
		var tblBodyRowCellText;
		var fieldID='_1_1_2_1'+tblRows[k];
		tblBodyRowCell = document.createElement('td');
		if (k==0){
			tblBodyRowCellText = document.createTextNode(result.monthlyKPI[lastItem].Date);
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
	}
	tblBody.appendChild(tblBodyRow);	
	monthlyKpiTbl.appendChild(tblBody);
	monthlyKpiTblLoc.appendChild(monthlyKpiTbl);
}

//Project KPI - fill tables

function populateMonthlyKpiTbl(){
	var rowIds=['Date','TtlSkipWasteM3', 'TtlCartAwayWasteM3', 'SkipWasteRecycled', 'WaterM3', 'emitFromDieselKgCo2', 'EmitFromElectrictyKgCo2', 'TtlEmitkgCO2', 'Wstper100kM3','emitFromEnergyKgCo2Per100k','waterM3Per100k','ActualTO'];
	var rowLength = rowIds.length;
	var kpiData=result.monthlyKPI;
	var rowNum = kpiData.length;
	var tblRows=['','_6_1','_8_1', '_10_1', '_12_1', '_14_1', '_244_1', '_16_1', '_18_1','_20_1','_22_1','_24_1'];
	var tblRowIndex = 0;	
	for(var Prop in kpiData[rowNum-1]){
		var sizeOfRow = Object.keys(kpiData[rowNum-1]).length;
		var fieldID="_1_1_2_1"+tblRows[tblRowIndex];
		if(Prop!='ContractNumber'){
			document.getElementById(fieldID).value = kpiData[rowNum-1][Prop];
			if(Prop=='Wstper100kM3'||Prop=='emitFromEnergyKgCo2Per100k'||Prop=='waterM3Per100k'){
				switch(Prop){
					case 'Wstper100kM3':
						targetComparison(document.getElementById('_1_1_224_10_228_1').value,document.getElementById(fieldID).value = kpiData[rowNum-1][Prop], fieldID);
						break;
					case 'emitFromEnergyKgCo2Per100k':
						targetComparison(document.getElementById('_1_1_224_12_228_1').value,document.getElementById(fieldID).value = kpiData[rowNum-1][Prop], fieldID);
						break;
					case 'waterM3Per100k':
						targetComparison(document.getElementById('_1_1_224_11_228_1').value,document.getElementById(fieldID).value = kpiData[rowNum-1][Prop], fieldID);
						break;
				}
			}
		tblRowIndex++;
		}
	}
}

//Progress Data Section - Structure
function createProgressSection(location){
	var sectionLocation = document.getElementById(location);
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
	var tableLocation = document.getElementById('progressTblContent');
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
	var bodyRow = document.createElement('tr');
	for(var k=0;k<2;k++){
		var bodyCell = document.createElement('td');
		var bodyCellInput = document.createElement('input');
		bodyCellInput.setAttribute('type','text');
		if(projectMonths[i]!= '___rowNum__'){
			switch(k){
				case 0:
					bodyCellInput.setAttribute('id','_1_1_218_1_222_1');
					bodyCellInput.setAttribute('name','_1_1_218_1_222_1');
					bodyCell.appendChild(bodyCellInput);
					break;
				case 1:
						bodyCellInput.setAttribute('id','_1_1_218_1_252_1');
						bodyCellInput.setAttribute('name','_1_1_218_1_252_1');
						bodyCell.appendChild(bodyCellInput);
			}
		}
		bodyRow.appendChild(bodyCell);
		}
		progressBody.appendChild(bodyRow);

	progressTable.appendChild(progressBody);
	tableLocation.appendChild(progressTable);
}

function createConsiderateConstructorsTable(location){
	var tableLocation = document.getElementById(location)
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
	var tableLength = result.considerateConstructors.length;
	var tableBody = document.createElement('tbody');
	for(var j=0;j<tableLength;j++){
		var bodyRow = document.createElement('tr');
		for(var k=0;k<2;k++){
			var bodyCell = document.createElement('td');
			var bodyCellInput = document.createElement('input');
			bodyCellInput.setAttribute('type','text');
			if(k==0){
				var fieldID = '_1_1_215_'+(j+1)+'_1_216_1';
				var fieldContentSting = result.considerateConstructors[j].Date;
				var fieldContentDate = fieldContentSting.split('/')[1]+'/'+fieldContentSting.split('/')[0]+'/'+ fieldContentSting.split('/')[2];
				bodyCellInput.setAttribute('class','datepicker');
				bodyCellInput.setAttribute('id','_datepicker_'+fieldID);
				bodyCellInput.setAttribute('onChange','constructDate(fieldContentSting,fieldID)');
				var hiddenInput  = document.createElement('input');
				hiddenInput.setAttribute('type','hidden');
				hiddenInput.setAttribute('name',fieldID+'_hour');
				hiddenInput.setAttribute('value','0');
				bodyCell.appendChild(hiddenInput);
				var hiddenInput2  = document.createElement('input');
				hiddenInput2.setAttribute('type','hidden');
				hiddenInput2.setAttribute('name',fieldID+'_minute');
				hiddenInput2.setAttribute('value','0');
				bodyCell.appendChild(hiddenInput2);
				var hiddenInput3  = document.createElement('input');
				hiddenInput3.setAttribute('type','hidden');
				hiddenInput3.setAttribute('name',fieldID+'_second');
				hiddenInput3.setAttribute('value','0');
				bodyCell.appendChild(hiddenInput3);
				var hiddenInput4  = document.createElement('input');
				hiddenInput4.setAttribute('type','hidden');
				hiddenInput4.setAttribute('name',fieldID+'_ampm');
				hiddenInput4.setAttribute('value','0');
				bodyCell.appendChild(hiddenInput4);
				var hiddenInput5  = document.createElement('input');
				hiddenInput5.setAttribute('type','hidden');
				hiddenInput5.setAttribute('name',fieldID+'_dirtyFlag');
				hiddenInput5.setAttribute('value','0');
				bodyCell.appendChild(hiddenInput5);
				var hiddenInput6  = document.createElement('input');
				hiddenInput6.setAttribute('type','hidden');
				hiddenInput6.setAttribute('name',fieldID);
				hiddenInput6.setAttribute('id',fieldID);
				hiddenInput6.setAttribute('value','[LL_FormTag'+fieldID+'/]');
				bodyCell.appendChild(hiddenInput6);
				bodyCellInput.setAttribute('value',fieldContentDate);
				bodyCell.appendChild(bodyCellInput);
			}else{
				
				bodyCellInput.setAttribute('id','_1_1_215_'+(j+1)+'_1_217_1');
				bodyCellInput.setAttribute('name','_1_1_215_'+(j+1)+'_1_217_1');
				bodyCellInput.setAttribute('value',result.considerateConstructors[j].Score);
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
	 var tblLocation = document.getElementById('matsByCats');
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
	 					bodyCellInput.setAttribute('id','_1_1_126_1_127_1');
	 					bodyCellInput.setAttribute('name','_1_1_126_1_127_1');
	 					bodyCellInput.value = '0'; //For Testing Purposes
	 					tblBodyCell.appendChild(bodyCellInput);
	 					break;
	 				case 1:
	 					bodyCellInput.setAttribute('id','_1_1_126_1_128_1');
	 					bodyCellInput.setAttribute('name','_1_1_126_1_128_1');
	 					bodyCellInput.value = '1';//For Testing Purposes
	 					tblBodyCell.appendChild(bodyCellInput);
	 					break;
	 				case 2:
	 					bodyCellInput.setAttribute('id','_1_1_126_1_129_1');
	 					bodyCellInput.setAttribute('name','_1_1_126_1_129_1');
	 					bodyCellInput.value = '0';//For Testing Purposes
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
	 var tblLocation = document.getElementById('matsbyReason');
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
	 					tblBodyText = document.createTextNode('Garage');
	 					break;
	 			}
	 			tblBodyCell.appendChild(tblBodyText);
	 		}else{
	 			var bodyCellInput = document.createElement('input');
	 			bodyCellInput.setAttribute('type','number');
	 			switch(j){
	 				case 0:
	 					bodyCellInput.setAttribute('id','_1_1_126_1_130_1');
	 					bodyCellInput.setAttribute('name','_1_1_126_1_130_1');
	 					bodyCellInput.value = 0;
	 					tblBodyCell.appendChild(bodyCellInput);
	 					break;
	 				case 1:
	 					bodyCellInput.setAttribute('id','_1_1_126_1_131_1');
	 					bodyCellInput.setAttribute('name','_1_1_126_1_131_1');
	 					bodyCellInput.value = 1;
	 					tblBodyCell.appendChild(bodyCellInput);
	 					break;
	 				case 2:
	 					bodyCellInput.setAttribute('id','_1_1_126_1_132_1');
	 					bodyCellInput.setAttribute('name','_1_1_126_1_132_1');
	 					bodyCellInput.value = 0;
	 					tblBodyCell.appendChild(bodyCellInput);
	 					break;
	 				case 3:
	 					bodyCellInput.setAttribute('id','_1_1_126_1_133_1');
	 					bodyCellInput.setAttribute('name','_1_1_126_1_133_1');
	 					bodyCellInput		.value = 0;
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
	var setIdentifier = 1;
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
		if(setIdentifier==51){setIdentifier=1}
		if(i<50){
			var bodyRow = recordOfLabourRows('_1_1_46',setIdentifier , '47',i);
		}else if(i<100){
			var bodyRow = (recordOfLabourRows('_1_1_56',setIdentifier , '57',i));
		}else if(i<150){
			var bodyRow = recordOfLabourRows('_1_1_66',setIdentifier , '67',i);
		}else if(i<200){
			var bodyRow = recordOfLabourRows('_1_1_76',setIdentifier , '87',i);
		}else if(i<250){
			var bodyRow = recordOfLabourRows('_1_1_90',setIdentifier , '91',i);
		}else if(i<300){
			var bodyRow = recordOfLabourRows('_1_1_100',setIdentifier , '101',i);
		}else{
			var bodyRow = recordOfLabourRows('_1_1_110',setIdentifier , '111',i);
		}
		tableBody.appendChild(bodyRow);
		setIdentifier++;
	}
	labourTable.appendChild(tableBody);
	document.getElementById("recordOfLabourContent").appendChild(labourTable);
}

function recordOfLabourRows(startOfFieldID, identifier, endOfFieldID, weekNumber){
	var rowOfFields=document.createElement('tr');
	var weekNumberCell = document.createElement('th');
	var weekNumber = document.createTextNode(weekNumber+1);
	var fieldEnd = endOfFieldID;
	for(var i=0;i<9;i++){
		var singleField = document.createElement('td');
		var fieldInput = document.createElement('input');
		fieldInput.setAttribute('type','text');
		var fieldID = startOfFieldID+'_'+identifier+'_'+fieldEnd+'_1';
		fieldInput.setAttribute('id',fieldID);
		fieldInput.setAttribute('name',fieldID);
		singleField.appendChild(fieldInput);
		rowOfFields.appendChild(singleField);
		fieldEnd++;
	}
	return rowOfFields;
}

function populateRecordOfLabourTbl(){
	var numberOfRows = result.NewRecordOfLabour.length-1;
	var setIdentifier = 1;
	for(var i=0;i<numberOfRows;i++){
		if(setIdentifier==51){setIdentifier=1}
		if(i<50){
			setRecordOfLabourRows('_1_1_46_',setIdentifier , '47',i);
		}else if(i<100){
			setRecordOfLabourRows('_1_1_56_',setIdentifier , '57',i);
		}else if(i<150){
			setRecordOfLabourRows('_1_1_66_',setIdentifier , '67',i);
		}else if(i<200){
			setRecordOfLabourRows('_1_1_76_',setIdentifier , '87',i);
		}else if(i<250){
			setRecordOfLabourRows('_1_1_90_',setIdentifier , '91',i);
		}else if(i<300){
			setRecordOfLabourRows('_1_1_100_',setIdentifier , '101',i);
		}else{
			setTecordOfLabourRows('_1_1_110_',setIdentifier , '111',i);
		}
		setIdentifier++;
	}	
}

function setRecordOfLabourRows(start, identifier, end, weekNumber){
	var endOfId = end;
	var totalLabour =0;
	for(var prop in result.NewRecordOfLabour[weekNumber]){
		var fieldId = start+identifier+'_'+endOfId+'_1';
		if(prop != 'ContractNumber'){
			if(prop != 'Week_No'){
				totalLabour =  totalLabour + parseInt(result.NewRecordOfLabour[weekNumber][prop]);
			}
			document.getElementById(fieldId).value = result.NewRecordOfLabour[weekNumber][prop];
			endOfId++; 
		}
	}
	fieldId = start+identifier+'_'+endOfId+'_1';
	document.getElementById(fieldId).value =totalLabour;
}

//Financial Data Section - Structure

function createfinancialData(){
	var location = document.getElementById('finacialData');
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
	var sectionLocation = document.getElementById('financialData');
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

function createCWDtoDateTable(){
	var tableLocation = document.getElementById('totalCwdContent');
	var monthlyCwdTable = document.createElement('table');
	monthlyCwdTable.setAttribute('class','striped');
	var tableHeader = document.createElement('thead');
	var headerRow = document.createElement('tr');
	for(var i=0; i<2; i++){
		var headerCell = document.createElement('th');
		switch(i){
			case 0:
				var cellText = document.createTextNode('Subcontractor');
				break;
			case 1:
				var cellText = document.createTextNode('Total');
		}
		headerCell.appendChild(cellText);
		headerRow.appendChild(headerCell);

	}
	tableHeader.appendChild(headerRow);
	monthlyCwdTable.appendChild(tableHeader);
	var tableBody = document.createElement('tbody');
	var bodySize = result.CwdTotalData.length;
	for(var j=0; j<bodySize; j++){
		var bodyRow = document.createElement('tr');
		for(var k=0;k<2;k++){
			var bodyCell = document.createElement('td');
			switch(k){
				case 0:
					var bodyText = document.createTextNode(asciiToChar(result.CwdTotalData[j]['Issued_to']));
					break;
				case 1:
					var bodyText = document.createTextNode(result.CwdTotalData[j]['Total']);;
					break;
			}
			bodyCell.appendChild(bodyText);
			bodyRow.appendChild(bodyCell);
		}
		tableBody.appendChild(bodyRow);
	}
	monthlyCwdTable.appendChild(tableBody);
	tableLocation.appendChild(monthlyCwdTable);
}

function createMonthlyCWD(){
	var tableLocation = document.getElementById('monthlyCwdContent');
	var monthlyCwdTable = document.createElement('table');
	monthlyCwdTable.setAttribute('class','striped');
	var tableHeader = document.createElement('thead');
	var headerRow = document.createElement('tr');
	for(var i=0; i<2; i++){
		var headerCell = document.createElement('th');
		switch(i){
			case 0:
				var cellText = document.createTextNode('Subcontractor');
				break;
			case 1:
				var cellText = document.createTextNode('Total');
		}
		headerCell.appendChild(cellText);
		headerRow.appendChild(headerCell);

	}
	tableHeader.appendChild(headerRow);
	monthlyCwdTable.appendChild(tableHeader);
	var tableBody = document.createElement('tbody');
	var bodySize = result.CwdMonthlyData.length;
	for(var j=0; j<bodySize; j++){
		var bodyRow = document.createElement('tr');
		for(var k=0;k<2;k++){
			var bodyCell = document.createElement('td');
			switch(k){
				case 0:
					var bodyText = document.createTextNode(asciiToChar(result.CwdMonthlyData[j]['Issued_to']));
					break;
				case 1:
					var bodyText = document.createTextNode(result.CwdMonthlyData[j]['Total']);;
					break;
			}
			bodyCell.appendChild(bodyText);
			bodyRow.appendChild(bodyCell);
		}
		tableBody.appendChild(bodyRow);
	}
	monthlyCwdTable.appendChild(tableBody);
	tableLocation.appendChild(monthlyCwdTable);
}

//Financial Data Section - create and fill tables

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
	var lastTunoverDate = projectMonths[projectMonths.length-1];
	var bodyRow=document.createElement('tr');
	var startOfFieldID='_1_1_152_1_1_';
	var endOfFieldID=145;
	var middleDigit = 1;
	for(var k=0; k<4;k++){
		var bodyCell = document.createElement('td');
		switch(k){
			case 0:
				bodyCell.innerHTML = lastTunoverDate;
				break;
			case 1:
				var bodyCellInput = document.createElement('input');
				bodyCellInput.setAttribute('type','text');
				bodyCellInput.setAttribute('id',startOfFieldID+endOfFieldID+'_1');
				bodyCellInput.setAttribute('name',startOfFieldID+endOfFieldID+'_1');
				bodyCellInput.value = result.financialData[2][lastTunoverDate];
				bodyCell.appendChild(bodyCellInput);
				endOfFieldID++;
				break;
			case 2:
				var bodyCellInput = document.createElement('input');
				bodyCellInput.setAttribute('type','text');
				bodyCellInput.setAttribute('id',startOfFieldID+endOfFieldID+'_1');
				bodyCellInput.setAttribute('name',startOfFieldID+endOfFieldID+'_1');
				bodyCellInput.value=result.financialData[0][lastTunoverDate];
				bodyCell.appendChild(bodyCellInput);
				endOfFieldID++;
				break;
			case 3:
				var bodyCellInput = document.createElement('input');
				bodyCellInput.setAttribute('type','text');
				bodyCellInput.setAttribute('id',startOfFieldID+endOfFieldID+'_1');
				bodyCellInput.setAttribute('name',startOfFieldID+endOfFieldID+'_1');
				bodyCellInput.value = result.financialData[1][lastTunoverDate];
				bodyCell.appendChild(bodyCellInput);
				endOfFieldID++;
				break;

		}
		bodyRow.appendChild(bodyCell);
	}
	tableBody.appendChild(bodyRow);
	predTurnoverTbl.appendChild(tableBody);
	document.getElementById('turnoverContent').appendChild(predTurnoverTbl);
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
	var lastCostflowDate = projectMonths[projectMonths.length-1];
	var tableBody = document.createElement('tbody');
	var bodyRow=document.createElement('tr');
	var startOfFieldID='_1_1_152_1_';
	var endOfFieldID=153;
	for(var k=0; k<4;k++){
		var cumTgtCostflow=(result.financialData[0][lastCostflowDate]*(1-0.1)).toFixed(0);
		var bodyCell = document.createElement('td');
		switch(k){
			case 0:
				bodyCell.innerHTML = lastCostflowDate;
				break;
			case 1:
				var bodyCellInput = document.createElement('input');
				bodyCellInput.setAttribute('type','text');
				bodyCellInput.setAttribute('id',startOfFieldID+endOfFieldID+'_1');
				bodyCellInput.setAttribute('name',startOfFieldID+endOfFieldID+'_1');
				bodyCellInput.value = result.financialData[0][lastCostflowDate];
				bodyCell.appendChild(bodyCellInput);
				endOfFieldID++;
				break;
			case 2:
				var bodyCellInput = document.createElement('input');
				bodyCellInput.setAttribute('type','text');
				bodyCellInput.setAttribute('id',startOfFieldID+endOfFieldID+'_1');
				bodyCellInput.setAttribute('name',startOfFieldID+endOfFieldID+'_1');
				bodyCellInput.value=cumTgtCostflow;
				bodyCell.appendChild(bodyCellInput);
				endOfFieldID++;
				break;
			case 3:
				var bodyCellInput = document.createElement('input');
				bodyCellInput.setAttribute('type','text');
				bodyCellInput.setAttribute('id',startOfFieldID+endOfFieldID+'_1');
				bodyCellInput.setAttribute('name',startOfFieldID+endOfFieldID+'_1');
				bodyCellInput.value = result.financialData[3][lastCostflowDate];
				bodyCell.appendChild(bodyCellInput);
				endOfFieldID++;
				break;

		}
		bodyRow.appendChild(bodyCell);
	}
	tableBody.appendChild(bodyRow);
	costflowTbl.appendChild(tableBody);
	document.getElementById('costflowContent').appendChild(costflowTbl);
}



//Subcontractor Financial Data Section

function createSubContractorSection(location){
	var sectionLocation = document.getElementById(location);
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
		var tableLocation = document.getElementById('subConOrderVariations');
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
		for (var j=0; j<tblLength; j++){
			var bodyRow = document.createElement('tr');
			if(middleOfFieldID==51){middleOfFieldID=1};
			for(var k=0; k<6;k++){
				var bodyCell = document.createElement('td');
				var cellInput = document.createElement('input');
				if(j<50){
					if(k==0){
						startOfFieldID = '_1_1_189_';
						endOfFieldID='190';
					}
				}else if(j<100){
					if(k==0){
						startOfFieldID = '_1_1_195_';
						endOfFieldID='196';
					}
				}else{
					if(k==0){
						startOfFieldID = '_1_1_201_';
						endOfFieldID='202';
					}
				}
				var bodyCellId= startOfFieldID+middleOfFieldID+'_'+endOfFieldID+'_1';
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
			if(parseInt(prop)<50){
				var startOfFieldID='_1_1_189_';
				var endOfFieldID=190;
			}else if(parseInt(prop)<100){
				var startOfFieldID='_1_1_195_';
				var endOfFieldID=196;
			}else{
				var startOfFieldID='_1_1_201_';
				var endOfFieldID=202;
			}
			for(var innerProp in result.SubConFinData[prop]){
				if(middleOfFieldID==51){middleOfFieldID=1};
				if(innerProp!='ContractNumber'){
					var fieldID = startOfFieldID+middleOfFieldID+'_'+endOfFieldID+'_1';
					document.getElementById(fieldID).value = result.SubConFinData[prop][innerProp];
					endOfFieldID++;
				}
			}
			middleOfFieldID++;
		}
	}
}



//HS Data Section Structure

function createHSDataSection(locaton){
	var sectionLocation = document.getElementById(locaton);
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
	var tableLocation = document.getElementById('HSMonthlyAudit');
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
	var latestMonth = projectMonths[projectMonths.length-1];
	var bodyRow = document.createElement('tr');
	var	percentage =result.HSData[1][latestMonth];
	var	score = result.HSData[0][latestMonth];
	if(percentage==undefined){percentage=0};
	if(score==undefined){score=0};
	for(var k=0; k<3;k++){
		var bodyCell = document.createElement('td');
		switch(k){
			case 0:
				bodyCell.appendChild(document.createTextNode(latestMonth));
				break;
			case 1:
				var bodyCellInput = document.createElement('input');
				bodyCellInput.setAttribute('type','text');
				bodyCellInput.setAttribute('id','_1_1_161_1_163_1');
				bodyCellInput.setAttribute('name','_1_1_161_1_163_1');	
				bodyCellInput.value = percentage;
				bodyCell.appendChild(bodyCellInput);
				break;
			case 2:
				var bodyCellInput = document.createElement('input');
				bodyCellInput.setAttribute('type','text');
				bodyCellInput.setAttribute('id','_1_1_161_1_164_1');
				bodyCellInput.setAttribute('name','_1_1_161_1_164_1');
				bodyCellInput.value = score;
				bodyCell.appendChild(bodyCellInput);
				break;
		}
		bodyRow.appendChild(bodyCell);
	}
	tableBody.appendChild(bodyRow);
	HSAuditTable.appendChild(tableBody);
	tableLocation.appendChild(HSAuditTable);
}

function tblAccidentType(location){
	var accidentTypeTblLoc=document.getElementById(location);
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
	var typeData = ['Abdomen','Arms','Back','Burns','Chest','Eyes','Face','Feet','Hands','Head','Jaw','Legs','Muscular','Neck','Pelvis','Penis','Shoulder','Skeletal'];
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
						bodyCellInput.setAttribute('id',cellID);
						bodyCellInput.setAttribute('name',cellID);
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
	var accidentTradeTblLoc=document.getElementById(location);
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
	var tradeData = ['AsbestosRemoval','Brickwork','Carpentry','Cladding','Cleaning','Demolition','Electrical','Fencing','Flooring','Forklift','Frame','Glazing','Groundwork','Insulation','Labourer','Landscaping','Lifts','LightningProtection','Management','Mastic','Mechanical','Metalwork','PaintingandDecoration','PestControl','Piling','Plastering','Plumbing','Render','Roofing','Scaffolding','Steelwork','Tiling','TreeSurgery','WaterProofing','Windows'];
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
					bodyCellInput.setAttribute('id',cellID);
					bodyCellInput.setAttribute('name',cellID);
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
	var tableLocation = document.getElementById('tblAccidentReport');
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
		var startOfFieldID = '_1_1_167_';
		var endOfFieldID = 169;
		for(var k=0;k<5;k++){
			var rowCell = document.createElement('td');
			var cellInput = document.createElement('input');
			var fieldID = startOfFieldID+fieldIdentifier+'_'+endOfFieldID+'_1';
			switch(k){
				case 0:
					cellInput.setAttribute('class','datepicker');
					cellInput.setAttribute('type','text');
					cellInput.setAttribute('id','_datepicker_'+fieldID);
					cellInput.setAttribute('onChange','constructDate()');
					var hiddenInput  = document.createElement('input');
					hiddenInput.setAttribute('type','hidden');
					hiddenInput.setAttribute('name',fieldID+'_hour');
					hiddenInput.setAttribute('value','0');
					rowCell.appendChild(hiddenInput);
					var hiddenInput2  = document.createElement('input');
					hiddenInput2.setAttribute('type','hidden');
					hiddenInput2.setAttribute('name',fieldID+'_minute');
					hiddenInput2.setAttribute('value','0');
					rowCell.appendChild(hiddenInput2);
					var hiddenInput3  = document.createElement('input');
					hiddenInput3.setAttribute('type','hidden');
					hiddenInput3.setAttribute('name',fieldID+'_second');
					hiddenInput3.setAttribute('value','0');
					rowCell.appendChild(hiddenInput3);
					var hiddenInput4  = document.createElement('input');
					hiddenInput4.setAttribute('type','hidden');
					hiddenInput4.setAttribute('name',fieldID+'_ampm');
					hiddenInput4.setAttribute('value','0');
					rowCell.appendChild(hiddenInput4);
					var hiddenInput5  = document.createElement('input');
					hiddenInput5.setAttribute('type','hidden');
					hiddenInput5.setAttribute('name',fieldID+'_dirtyFlag');
					hiddenInput5.setAttribute('value','0');
					rowCell.appendChild(hiddenInput5);
					var hiddenInput6  = document.createElement('input');
					hiddenInput6.setAttribute('type','hidden');
					hiddenInput6.setAttribute('name',fieldID);
					hiddenInput6.setAttribute('id',fieldID);
					hiddenInput6.setAttribute('value','[LL_FormTag'+fieldID+'/]');
					rowCell.appendChild(hiddenInput6);
					break;
				case 1:
					cellInput.setAttribute('type','text');
					cellInput.setAttribute('id',fieldID);
					break;
				case 2:
					cellInput.setAttribute('type','text');
					cellInput.setAttribute('id',fieldID);
					break;
				case 3:
					cellInput.setAttribute('type','text');
					cellInput.setAttribute('id',fieldID);
					break;
				case 4:
					cellInput.setAttribute('type','text');
					cellInput.setAttribute('id',fieldID);
					break;
			}
			rowCell.appendChild(cellInput);
			bodyRow.appendChild(rowCell);
			endOfFieldID++;
		}
		fieldIdentifier++
		tblBody.appendChild(bodyRow);
	}
	accidentReportTable.appendChild(tblBody);
	tableLocation.appendChild(accidentReportTable);
}

function createDaysLostTbl(){
	var tblLocation = document.getElementById('daysLostContent');
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
	var bodyRow = document.createElement('tr');
	for(var k=0;k<3;k++){
		var bodyRowCell = document.createElement('td');
		bodyRowCell.setAttribute('class','center-align');
		var bodyRowCellTxt;
		var bodyCellInput = document.createElement('input');
		bodyCellInput.setAttribute('type','text');
		switch(k){
			case 0:
				bodyCellInput.value = latestMonth;
				break;
			case 1:
				bodyCellInput.setAttribute('id','_1_1_183_1_184_1');
				bodyCellInput.setAttribute('name','_1_1_183_1_184_1');
				bodyCellInput.setAttribute('value',0);
				break;
			case 2:
				bodyCellInput.setAttribute('id','_1_1_183_1_185_1');
				bodyCellInput.setAttribute('name','_1_1_183_1_185_1');
				bodyCellInput.setAttribute('value','_1_1_183_1_184_1');
				bodyCellInput.setAttribute('value',0);
				break;
		}
		bodyRowCell.appendChild(bodyCellInput);
		bodyRow.appendChild(bodyRowCell);
	}
	tableBody.appendChild(bodyRow);
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
	document.getElementById("_1_1_224_5_229_1").value = (HSsum/numberOfMonths).toFixed(0);
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
	document.getElementById("_1_1_224_5_226_1").value = (HSsum/numberOfMonths).toFixed(0);
}

function populateAccidentReportTbl(){
	var middleOfFieldID=1;
	for(var prop in result.AccidentReport){
		if(result.AccidentReport.hasOwnProperty(prop)){
			if(parseInt(prop)<50){
				var startOfFieldID='_1_1_167_';
				var endOfFieldID=169;
			}else{
				var startOfFieldID='_1_1_168_';
				var endOfFieldID=174;
			}
			for(var innerProp in result.AccidentReport[prop]){
				if(middleOfFieldID==51){middleOfFieldID=1};
				if(innerProp!='ContractNumber' && typeof(innerProp)!==undefined){
					if(innerProp=='Date'){
						var fieldID ='_datepicker_'+startOfFieldID+middleOfFieldID+'_'+endOfFieldID+'_1';
					}else{
						var fieldID = startOfFieldID+middleOfFieldID+'_'+endOfFieldID+'_1';
					}
					document.getElementById(fieldID).value = result.AccidentReport[prop][innerProp];
					switch(innerProp){
						case 'Type':
							var type = result.AccidentReport[prop][innerProp];
							var typeTableID = getTypeFieldID(type);
							var currentTypeValue = document.getElementById(typeTableID).value;
							document.getElementById(typeTableID).value=++currentTypeValue;
							break;
						case 'Trade':
							var trade = getTradeCategory(result.AccidentReport[prop][innerProp]);
							var tradeTableID = getTradeFieldID(trade);
							var currentTradeValue = document.getElementById(tradeTableID).value;
							document.getElementById(tradeTableID).value=++currentTradeValue;
							break;
						case 'LostDays':
							var newdaysLost =parseInt(result.AccidentReport[prop][innerProp].replace(/[^0-9 ]/g, ""));
							var totalLostDays=parseInt(document.getElementById('_1_1_183_1_185_1').value);
							if(newdaysLost<7){
								totalLostDays+=newdaysLost;
								document.getElementById('_1_1_183_1_185_1').value=totalLostDays;
							}
							break;
						case 'Riddor':
							var totalRiddor = parseInt(document.getElementById('_1_1_183_1_184_1').value);
							var riddor = parseInt(result.AccidentReport[prop][innerProp]);
							totalRiddor+=riddor;
							document.getElementById('_1_1_183_1_184_1').value=totalRiddor;
							break;


					}
					endOfFieldID++;
				}
			}
			middleOfFieldID++;
		}
	}
}