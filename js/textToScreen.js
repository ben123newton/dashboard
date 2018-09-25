
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
			if (sheetName=="SubConFinData" || sheetName=="HSData" || sheetName=="projectKPI"|| sheetName=="RecordOfLabour"|| sheetName=="financialData"|| sheetName=="TradeAccidents"|| sheetName=="TypeAccidents" ){

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
	createSummarySections();
	createProgressSections();
	createCcsCosts();
	createFinancialGraphSection();
	createSubConGraphSection('subcontractorGraphs');
	createHsGraphs();
	createTimeValueGraphs();
	createProjectKpiSection();
	createProgressSection('progress');
	createSubContractorSection('subContractorData');
	createHSDataSection('hsData');
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

//===STRUCTURE FUNCTIONS===

function createSummarySections(){
	createTopSummaryRow('summary-page');
	createMiddleSummaryRow('summary-page');
	createBottomSummaryRow('summary-page');
}

function createProgressSections(){
	createTopProgressRow('progressGraphs');
	createBottomProgressRow('progressGraphs');
}

function createCcsCosts(){
	createCcsTopRow('ccsCosts');
	createCcsBottomRow('ccsCosts');
}

function createFinancialGraphSection(){
	createTopFinGraphs('financialGraph');
	createBottomFinGraphs('financialGraph');
}
	
function createHsGraphs(){
	createHSTopRowGraphs('hsGraphs');
	createHSBottomRowGraphs('hsGraphs');
}


//Summary Structure
function createTopSummaryRow(location){
	var rowLocation = document.getElementById(location);
	var rowContents = createDiv('topRow', 'row');
	var leftDiv= createGraphCard('col s12 l6', 'sumProgress', 'progressCardContent', 'Progress');
	rowContents.appendChild(leftDiv);
	var rightDiv = createMultiDataCard('col s12 l6', 'financial', 2, 'Financial', ['Value Information','Summary of Overhead Contribution']);
	rowContents.appendChild(rightDiv);
	rowLocation.appendChild(rowContents);
}

function createMiddleSummaryRow(location){
	var rowLocation = document.getElementById(location);
	var rowContents = createDiv('middleRow', 'row');
	var middleLeft = createGraphCard('col s12 l6', 'middleLeft', 'middleLeftContent', 'Health and Safety')
	rowContents.appendChild(middleLeft);
	var middleRight = createDataCard('col s12 l6', 'projectKpi', 'projectKpiContent', 'Project KPI\'s')
	rowContents.appendChild(middleRight);
	rowLocation.appendChild(rowContents);
}

function createBottomSummaryRow(location){
	var rowLocation = document.getElementById(location);
	var rowContents = createDiv('bottomRow','row');
	var leftDiv = createDataCard('col s12 l6', 'completionDate', 'completionTable', 'CompletionDates');
	rowContents.appendChild(leftDiv);
	var rightDiv = createMultiGraphCard('col s12 l6', 'timeValue', 2 , ['time','Value'], ['','']);
	rowContents.appendChild(rightDiv);
	rowLocation.appendChild(rowContents);
}

//Progress Structure
function createTopProgressRow(location){
	var rowLocation = document.getElementById(location);
	var rowContents = createDiv('progressTopRow','row');
	var topRow = createGraphCard('col s12', 'progressCard', 'progressCardContent', 'Monthly Progress');
	rowContents.appendChild(topRow);
	rowLocation.appendChild(rowContents);
}

function createBottomProgressRow(location){
	var rowLocation = document.getElementById(location);
	var rowContents = createDiv('progressBottomRow','row');
	var firstCardContainer = createGraphCard('col s12 l6', 'weeklyLabour', 'weeklyLabourContent', 'Record Of Labour for Most Recent Week');
	rowContents.appendChild(firstCardContainer);
	var secondCardContainer = createGraphCard('col s12 l6', 'TotalLabour', 'totalLabourContent', 'Record of Labour Throughout Contract');
	rowContents.appendChild(secondCardContainer);
	rowLocation.appendChild(rowContents);
}

//CCS Costs Structure
function createCcsTopRow(location){
	var rowLocation = document.getElementById(location);
	var row = createDiv('ccsTopRow','row');

	var container = createDiv('ccsTopContainer','col s12');
	var containerRow = createDiv('ccsTopContainerRow','row');
	var card = createDiv('ccsTopCard','card');
	var cardContent = createDiv('considerateCons','card-content');
	var cardRow = createDiv('dataRow','row');

	var cardTitle = createTitle('h5','Considerate Constructor');
	var cardTableContainer = createDiv('considerateConsTbl','col s2');
	var cardGraphContainer = createDiv('Graph Div', 'col s10');
	var graphDiv = createDiv('considerateConsGraph');
	cardGraphContainer.appendChild(graphDiv);
	cardRow.appendChild(cardTitle);
	cardRow.appendChild(cardTableContainer);
	cardRow.appendChild(cardGraphContainer);
	cardContent.appendChild(cardRow);
	card.appendChild(cardContent);
	containerRow.appendChild(card);
	container.appendChild(containerRow);
	row.appendChild(container);
	rowLocation.appendChild(row);
}

function createCcsBottomRow(location){
	var rowLocation = document.getElementById(location);
	var row = createDiv('ccsBottomRow','row');
	var containerOne = createGraphCard('col s12 l6', 'materialSummary', 'materialSummary', 'Summary of Materials Ordered');
	row.appendChild(containerOne);
	var containerTwo = createGraphCard('col s12 l6', 'materialReason', 'replacementReason', 'Reason for Replacement');
	row.appendChild(containerTwo);
	rowLocation.appendChild(row);
}


//Financial Graphs Structure
function createTopFinGraphs(location){
	var location = document.getElementById(location);
	var topRow = createDiv('topFinRow','row');
	var leftGraphContainer  = createGraphCard('col s12 l6', 'predTurnover', 'turnoverContent', 'Predicatability (Turnover)');
	topRow.appendChild(leftGraphContainer);
	var rightGraphContainer  = createGraphCard('col s12 l6', 'cwd', 'cwdContent', 'Contractors Written Directives');
	topRow.appendChild(rightGraphContainer);
	location.appendChild(topRow);
}

function createBottomFinGraphs(location){
	var location = document.getElementById(location);
	var bottomRow = createDiv('bottomFinRow','row');
	var leftGraphContainer = createGraphCard('col s12 l6', 'costflow', 'costflowContent', 'Costflow')
	bottomRow.appendChild(leftGraphContainer);
	var rightGraphContainer= createGraphCard('col s12 l6', 'cwdInMonth', 'cwdInMonthContent', 'In Month');
	bottomRow.appendChild(rightGraphContainer);
	location.appendChild(bottomRow);
}

//Subcontractor Finance Graphs Structure
function createSubConGraphSection(location){
	var location = document.getElementById(location);
	var row  = createDiv('subConRow','row');
	var subConContainer = createGraphCard('col s12', 'subCon', 'subconCardContent', 'Subcontractors Orders and Variations');
	row.appendChild(subConContainer);
	location.appendChild(row);
}

//HS Graphs Structure 
function createHSTopRowGraphs(location){
	location = document.getElementById(location);
	var row = createDiv('topRow','row');
	var monthlyAuditContainer = createGraphCard('col s12 l6', 'monthlyAudit', 'monthlyAuditContent', 'H&S Monthly Audit');
	row.appendChild(monthlyAuditContainer);
	var daysLostContainer = createGraphCard('col s12 l6', 'daysLost', 'daysLost', 'Number of Days Lost Due to Accident');
	row.appendChild(daysLostContainer);
	location.appendChild(row);
}

function createHSBottomRowGraphs(location){
	location = document.getElementById(location);
	var row = createDiv('bottomRow','row');
	var firstItemContainer = createDiv('HsTableSection', 'col s12 l4');
	var firstItemCard = createDiv('HsTableCard','card');
	var firstItemContent = createDiv('HsTableContent','card-content');
	var firstItemFirstTitle = createTitle('h5','Enforcement Action Notices');
	var firstItemFirstTable = createDiv('HSAudit');
	var firstItemSecondTitle = createTitle('h5','Major Compliance Audit Score');
	var firstItemSecondTable = createDiv('HSAudit');
	firstItemContent.appendChild(firstItemFirstTitle);
	firstItemContent.appendChild(firstItemFirstTable);
	firstItemContent.appendChild(firstItemSecondTitle);
	firstItemContent.appendChild(firstItemSecondTable);
	firstItemCard.appendChild(firstItemContent);
	firstItemContainer.appendChild(firstItemCard);
	row.appendChild(firstItemContainer);
	var HsByTradeContainer = createGraphCard('col s12 l4', 'HsByTrade', 'HsByTradeContent', 'By Trade');
	row.appendChild(HsByTradeContainer);
	var HsByTypeContainer = createGraphCard('col s12 l4', 'HsByType', 'HsByTypeContent', 'By Type');
	row.appendChild(HsByTypeContainer);
	location.appendChild(row);
}

//timeValue Structure
function createTimeValueGraphs(){
	createTimeStats('timeValueGraphs');
	createValueStats('timeValueGraphs');
}

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

//Project KPI Structure
function createProjectKpiSection(){
	var rowLocation = document.getElementById('projectKPIs');
	var projectKpiRow = createDiv('projectKPIsRow','row');
	var projectKPIcontainer =createDataCard('col s12 l5', 'projectKPI', 'KpiTable', 'Project KPI\'s')
	projectKpiRow.appendChild(projectKPIcontainer);
	var monthlyKPIcontainer = createDataCard('col s12 l7', 'monthlyKPI', 'monthlyKpiTable', 'Monthly KPI\'s records');
	projectKpiRow.appendChild(monthlyKPIcontainer);
	rowLocation.appendChild(projectKpiRow);
}

//Progress Data Section Structure
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

//subContractor Data Section Structure

function createSubContractorSection(location){
	var sectionLocation = document.getElementById(location);
	var section= createDiv('subContractorContainer','row');
	var subContractorDiv = createDataCard('col s12 l12', 'subContractor', 'subConOrderVariations', 'Subcontractor Orders and Variations');
	section.appendChild(subContractorDiv);
	sectionLocation.appendChild(section);
}

//HSData section Structure

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
function addRow(tableName){
	var tbl = tableName;
	var tableLength = document.getElementById(tableName).rows[0].cells.length;
	var newTableRow = document.createElement("tr");
	for(var cell = 0; cell<tableLength;cell++){
		var tblRowCell = document.createElement("td");
		newTableRow.appendChild(tblRowCell);
	}
	document.getElementById(tbl).tBodies[0].appendChild(newTableRow);
}

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
	document.getElementById(location).innerHTML = scoreAverage;
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

//traffic light filters

function moreThanZero(figure, location){
	if(figure.charAt(0)=='£'){
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
function populateTables(){
	weeksCompleted = result.contractData.WeeksCompleted;
	getProjectMonths();
	createTimeTable();
	createValueTable();
	createConsiderateConstructorsTable('considerateContractorsTbl');
	createRecordOfLabourTable();
	createValuationInfoTbl();
	createOverheardContributionTbl();
	populateOverheadContributionTbl();
	createProjectKPITbl();
	createCompletionDatesTbl();
	createcompletionDateTable();
	
	createProgressTbl();
	createPredTurnoverTbl();
	createCostflowTbl();
	createKpiCatTbl();
	createMonthlyKPITbl();
	createMatsByCats();
	createMatsByReason();
	populateKpiTable();
	createsubConOrderVarTbl();
	createHSMonthlyAuditTbl();
	populateMonthlyKpiTbl();
	document.getElementById('_1_1_134_1_139_1').innerHTML=weeksCompleted;
	document.getElementById('_1_1_134_1_140_1').innerHTML=result.contractData.WeeksContracted;

	HSMonthlyAuditAvg();
	HSMonthlyAuditAvgPct();
	
	//Summary Section
	populateValuationInfoTbl();
	//progress
	populateProgressTbl();
	//ProjectKPIs

	populateSummaryProjectKpiTbl();
	//populateRecordOfLabourTbl();
	createTimeChart(timeGraph);
	createValueChart(ValueGraph);
	createTimeChart('timeChartGraph');
	createValueChart('valueChartGraph');
	progressSummaryGraph(sumProgressGraph);
	progressGraph(progressCardGraph);
	//currentWeekRecordOfLabourGraph();
	//recordOfLabourTotalsGraph();
	copyConsiderateContractorTbl();
	considerateContractorsGraph();
	materialsOrderedChart();
	materialsReasonChart();
	turnoverGraph();
	costflowGraph('costflowGraph');
	//totalCwdToDate();
	monthlyCwdToDate('cwdInMonthGraph');
	subContractorOrderVariations();

	tblAccidentType('ByTypeTbl');
	tblAccidentTrade('ByTradeTbl');

	tradeAccidentGraph('HsByTradeGraph');
	typeAccidentGraph();

	createDaysLostTbl();
	createAccidentReportTbl();
	addAccidentReportRow('AccidentReportTbl');
	HSMonthlyAuditGraph('middleLeftGraph');
	HSMonthlyAuditGraph('monthlyAuditGraph');
	daysLostGraph('daysLost');
}

function populateKpiTable(){
	//Adherence to Prelim Budget
	document.getElementById('_1_1_224_0_225_1').innerHTML = result.contractData.AdherenceTgtPct;
	document.getElementById('_1_1_224_0_228_1').innerHTML = result.contractData.AdherenceTarget;
	document.getElementById('_1_1_224_0_229_1').innerHTML = result.contractData.AdherenceActual;
	percentageDifference(result.contractData.AdherenceActual,result.contractData.AdherenceTarget,'_1_1_224_0_226_1');
	calculateVariance(document.getElementById('_1_1_224_0_226_1').innerHTML,result.contractData.AdherenceTgtPct, '_1_1_224_0_227_1');
	calculateVariance(result.contractData.AdherenceActual, result.contractData.AdherenceTarget, "_1_1_224_0_230_1" );
	//Monthly Predictability of Cash Flow
	document.getElementById('_1_1_224_1_225_1').innerHTML = result.contractData.MonthlyCashFlowPredTgtPct;
	document.getElementById('_1_1_224_1_228_1').innerHTML = result.contractData.QtrTurnOverMonthForeCast;//same as forecastMTurnover
	document.getElementById('_1_1_224_1_229_1').innerHTML = result.contractData.MonthlyValue;//same as valMTurnover
	calculateVariance(result.contractData.MonthlyValue, result.contractData.QtrTurnOverMonthForeCast, '_1_1_224_1_230_1' );
	percentageDifference(result.contractData.MonthlyValue,result.contractData.QtrTurnOverMonthForeCast,'_1_1_224_1_226_1')
	calculatePercentageVariance(document.getElementById('_1_1_224_1_226_1').innerHTML, result.contractData.MonthlyCashFlowPredTgtPct, '_1_1_224_1_227_1' );
	//Quarterly Predictability of Cash Flow
	document.getElementById('_1_1_224_2_225_1').innerHTML = result.contractData.QtrCashFlowPredTgtPct;
	document.getElementById('_1_1_224_2_228_1').innerHTML = result.contractData.QtrTurnOverCumForeCast;//same as forecastMTurnover
	document.getElementById('_1_1_224_2_229_1').innerHTML = result.contractData.QtrTurnOverCumActual;//same as valMTurnover
	calculateVariance(result.contractData.QtrTurnOverCumActual, result.contractData.QtrTurnOverCumForeCast, '_1_1_224_2_230_1' );
	percentageDifference(result.contractData.QtrTurnOverCumActual,result.contractData.QtrTurnOverCumForeCast,'_1_1_224_2_226_1')
	calculatePercentageVariance(document.getElementById('_1_1_224_1_226_1').innerHTML, result.contractData.QtrCashFlowPredTgtPct, '_1_1_224_2_227_1' );
	//Non-Recoverable Works
	document.getElementById('_1_1_224_3_225_1').innerHTML = result.contractData.NonRecWorksTgtPct;
	document.getElementById('_1_1_224_3_226_1').innerHTML = ((result.contractData.NonRecWorksActPct)*100).toFixed(0);
	document.getElementById('_1_1_224_3_228_1').innerHTML = '0';
	document.getElementById('_1_1_224_3_229_1').innerHTML = result.contractData.NonRecoverableWorks;
	calculateVariance(result.contractData.NonRecoverableWorks, document.getElementById('_1_1_224_3_228_1').innerHTML, '_1_1_224_3_230_1');
	calculatePercentageVariance(document.getElementById('_1_1_224_3_226_1').innerHTML, result.contractData.NonRecWorksTgtPct, '_1_1_224_3_227_1' );
	//Predicability of Programme
	document.getElementById('_1_1_224_4_225_1').innerHTML='-';
	document.getElementById('_1_1_224_4_226_1').innerHTML='-';
	document.getElementById('_1_1_224_4_227_1').innerHTML='-';
	document.getElementById('_1_1_224_4_228_1').innerHTML = '100';
	document.getElementById('_1_1_224_4_229_1').innerHTML = result.contractData.PredOfProgrammeAct;
	calculatePercentageVariance(result.contractData.PredOfProgrammeAct,document.getElementById('_1_1_224_4_228_1').innerHTML,  '_1_1_224_4_230_1' );
	//HS Audit Score
	document.getElementById('_1_1_224_5_225_1').innerHTML = result.contractData.HAuditScoreTgtPct;
	HSMonthlyAuditAvgPct();
	calculatePercentageVariance(document.getElementById('_1_1_224_5_226_1').innerHTML,document.getElementById('_1_1_224_5_225_1').innerHTML,'_1_1_224_5_227_1');
	document.getElementById('_1_1_224_5_228_1').innerHTML = '-';
	document.getElementById('_1_1_224_5_230_1').innerHTML = '-';

	//Considerate Constructor
	document.getElementById('_1_1_224_7_228_1').innerHTML=35;
	considerateConstractorsAverage('_1_1_224_7_229_1');
	document.getElementById('_1_1_224_7_225_1').innerHTML = (parseFloat(document.getElementById('_1_1_224_7_228_1').innerHTML)/50)*100;
	document.getElementById('_1_1_224_7_226_1').innerHTML = (parseFloat(document.getElementById('_1_1_224_7_229_1').innerHTML)/50)*100;
	calculatePercentageVariance(document.getElementById('_1_1_224_7_226_1').innerHTML, document.getElementById('_1_1_224_7_225_1').innerHTML, '_1_1_224_7_227_1' );
	document.getElementById('_1_1_224_7_230_1').innerHTML=document.getElementById('_1_1_224_7_229_1').innerHTML-document.getElementById('_1_1_224_7_228_1').innerHTML;
	//HS Accident Incident Rate
	document.getElementById('_1_1_224_6_225_1').innerHTML = result.contractData.HSAccidentIncidentRateTgtPct;
	document.getElementById('_1_1_224_6_226_1').innerHTML = result.contractData.HSAccidentIncidentRateActPct;
	calculatePercentageVariance(document.getElementById('_1_1_224_6_226_1').innerHTML, document.getElementById('_1_1_224_6_225_1').innerHTML, '_1_1_224_6_227_1');
	document.getElementById('_1_1_224_6_228_1').innerHTML ='-';
	document.getElementById('_1_1_224_6_229_1').innerHTML ='-';
	document.getElementById('_1_1_224_6_230_1').innerHTML ='-';
	//Percentage Recycled
	document.getElementById('_1_1_224_9_225_1').innerHTML = result.contractData.PctRecycledWasteTgt;
	document.getElementById('_1_1_224_9_226_1').innerHTML = result.contractData.PctRecycledWasteAct;
	calculatePercentageVariance(result.contractData.PctRecycledWasteAct,result.contractData.PctRecycledWasteTgt, '_1_1_224_9_227_1')
	document.getElementById('_1_1_224_9_228_1').innerHTML='-';
	document.getElementById('_1_1_224_9_229_1').innerHTML='-';
	document.getElementById('_1_1_224_9_230_1').innerHTML='-';
	//Waste per £100k
	document.getElementById('_1_1_224_10_225_1').innerHTML='-';
	document.getElementById('_1_1_224_10_226_1').innerHTML='-';
	document.getElementById('_1_1_224_10_227_1').innerHTML='-';
	document.getElementById('_1_1_224_10_228_1').innerHTML=15;
	//document.getElementById('waste100kAct').innerHTML =document.getElementById('Wstper100kM3_'+projectMonths.length).innerHTML;
	//Water m3 per £100k
	document.getElementById('_1_1_224_11_225_1').innerHTML='-';
	document.getElementById('_1_1_224_11_226_1').innerHTML='-';
	document.getElementById('_1_1_224_11_227_1').innerHTML='-';
	
	//document.getElementById('water100kAct').innerHTML =document.getElementById('waterM3Per100k_'+projectMonths.length).innerHTML;
	//Energy Kg CO2 per £100k
	document.getElementById('_1_1_224_12_225_1').innerHTML='-';
	document.getElementById('_1_1_224_12_226_1').innerHTML='-';
	document.getElementById('_1_1_224_12_227_1').innerHTML='-';
	//document.getElementById('energy100kAct').innerHTML = document.getElementById('emitFromEnergyKgCo2Per100k_'+projectMonths.length).innerHTML;
}

function populateSummaryProjectKpiTbl(){
	//Populates Project KPI Table in the summary section
	document.getElementById('_1_1_224_10_225_1').innerHTML=document.getElementById('_1_1_224_0_225_1').innerHTML;
	document.getElementById('_1_1_224_10_226_1').innerHTML=document.getElementById('_1_1_224_0_226_1').innerHTML;
	moreThanOnePct(document.getElementById('_1_1_224_10_227_1').innerHTML=document.getElementById('_1_1_224_0_227_1').innerHTML,'_1_1_224_10_227_1');	

	document.getElementById('_1_1_224_11_225_1').innerHTML=document.getElementById('_1_1_224_1_225_1').innerHTML;
	document.getElementById('_1_1_224_11_226_1').innerHTML=document.getElementById('_1_1_224_1_226_1').innerHTML;
	moreThanZero(document.getElementById('_1_1_224_11_227_1').innerHTML=document.getElementById('_1_1_224_1_227_1').innerHTML,'_1_1_224_11_227_1');

	document.getElementById('_1_1_224_12_225_1').innerHTML=document.getElementById('_1_1_224_2_225_1').innerHTML;
	document.getElementById('_1_1_224_12_226_1').innerHTML=document.getElementById('_1_1_224_2_226_1').innerHTML;
	moreThanZero(document.getElementById('_1_1_224_12_227_1').innerHTML=document.getElementById('_1_1_224_2_227_1').innerHTML,'_1_1_224_12_227_1');

	document.getElementById('_1_1_224_13_225_1').innerHTML=document.getElementById('_1_1_224_3_225_1').innerHTML;
	document.getElementById('_1_1_224_13_226_1').innerHTML=document.getElementById('_1_1_224_3_226_1').innerHTML;
	lessThanZero(document.getElementById('_1_1_224_13_227_1').innerHTML=document.getElementById('_1_1_224_3_227_1').innerHTML,'_1_1_224_13_227_1');

	document.getElementById('_1_1_224_14_228_1').innerHTML=document.getElementById('_1_1_224_4_228_1').innerHTML;
	document.getElementById('_1_1_224_14_229_1').innerHTML=document.getElementById('_1_1_224_4_229_1').innerHTML;
	lessThanZero(document.getElementById('_1_1_224_14_230_1').innerHTML=document.getElementById('_1_1_224_4_230_1').innerHTML,'_1_1_224_14_230_1');

	document.getElementById('_1_1_224_15_225_1').innerHTML=document.getElementById('_1_1_224_5_225_1').innerHTML;
	document.getElementById('_1_1_224_15_226_1').innerHTML=document.getElementById('_1_1_224_5_226_1').innerHTML;
	moreThanZero(document.getElementById('_1_1_224_15_227_1').innerHTML=document.getElementById('_1_1_224_5_227_1').innerHTML,'_1_1_224_15_227_1');

	document.getElementById('_1_1_224_16_225_1').innerHTML=document.getElementById('_1_1_224_6_225_1').innerHTML;
	document.getElementById('_1_1_224_16_226_1').innerHTML=document.getElementById('_1_1_224_6_226_1').innerHTML;
	lessThanZero(document.getElementById('_1_1_224_16_227_1').innerHTML=document.getElementById('_1_1_224_6_227_1').innerHTML,'_1_1_224_16_227_1');

	document.getElementById('_1_1_224_17_228_1').innerHTML=document.getElementById('_1_1_224_7_228_1').innerHTML;
	document.getElementById('_1_1_224_17_229_1').innerHTML=document.getElementById('_1_1_224_7_229_1').innerHTML;
	moreThanZero(document.getElementById('_1_1_224_17_230_1').innerHTML=document.getElementById('_1_1_224_7_230_1').innerHTML,'_1_1_224_17_230_1');

	document.getElementById('_1_1_224_18_225_1').innerHTML=document.getElementById('_1_1_224_11_228_1').innerHTML;
	document.getElementById('_1_1_224_18_226_1').innerHTML=document.getElementById('_1_1_224_11_229_1').innerHTML;

	document.getElementById('_1_1_224_19_225_1').innerHTML=document.getElementById('_1_1_224_12_228_1').innerHTML;
	document.getElementById('_1_1_224_19_226_1').innerHTML=document.getElementById('_1_1_224_12_229_1').innerHTML;

	document.getElementById('_1_1_224_110_225_1').innerHTML=document.getElementById('_1_1_224_9_225_1').innerHTML;
	document.getElementById('_1_1_224_110_226_1').innerHTML=document.getElementById('_1_1_224_9_226_1').innerHTML;
	moreThanZero(document.getElementById('_1_1_224_110_227_1').innerHTML=document.getElementById('_1_1_224_9_227_1').innerHTML,'_1_1_224_110_227_1');

	document.getElementById('_1_1_224_111_228_1').innerHTML=document.getElementById('_1_1_224_8_228_1').innerHTML;
	document.getElementById('_1_1_224_111_229_1').innerHTML=document.getElementById('_1_1_224_8_229_1').innerHTML;
	lessThanZero2Colours(document.getElementById('_1_1_224_111_230_1').innerHTML=document.getElementById('_1_1_224_8_230_1').innerHTML,'_1_1_224_111_230_1');
}

function populateProgressTbl(){
	var progressSize = Object.keys(result.progress).length;
	var progressInfo = result.progress;
	var positionIndex = 1;
	var progressField;
	for(var prop in progressInfo){
		if(prop != 'ContractNumber'){
			if(positionIndex<50){
				progressField = '_1_1_218_'+positionIndex+'_219_1'
			}else{
				progressField = '_1_1_220_'+positionIndex+'_221_1'
			}
			progressTrafficLight(document.getElementById(progressField).innerHTML = progressInfo[prop], progressField);
			positionIndex++;
		}
	}
}


//calculation functions
function calculateVariance(fig1, fig2, targetField){
	var difference = (parseFloat(fig1.replace(/,/g, '')) - parseFloat(fig2.replace(/,/g, ''))).toFixed(0);
	var numericVariance = addCommas(difference)
	moreThanZero(document.getElementById(targetField).innerHTML = numericVariance, targetField);
}

function calculatePercentageVariance(fig1, fig2, targetField){
	var difference = (parseFloat(fig1.replace(/,/g, '')) - parseFloat(fig2.replace(/,/g, '')));
	var variance = ((difference/fig2)*100).toFixed(1);
	var numericVariance = addCommas(variance)
	moreThanZero(document.getElementById(targetField).innerHTML = variance, targetField);
}

function percentageDifference(actualFig, targetFig, percentageField){
	var actualDifference = ((Number(actualFig)/Number(targetFig))*100).toFixed(0);
	document.getElementById(percentageField).innerHTML=actualDifference; 
}

//summary section

function progressSummaryGraph(chartLocation){
	var progressData = result.progress;
	delete progressData.ContractNumber;
	var progressKeys = Object.keys(progressData);
	var endMonth=Object.keys(result.progress).length;
	var month=endMonth-10;//Number of Months
	var graphData=[];
	for(month;month<endMonth;month++){
		var prop = 	Object.keys(result.progress)[month];
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
					bodyCell.setAttribute('class','center-align');
					bodyCell.setAttribute('id',fieldID+'_232_1'); 
					break;
				case 2:
					var bodyCell = document.createElement('td');
					bodyCell.setAttribute('class','center-align');
					bodyCell.setAttribute('id',fieldID+'_233_1'); 
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
					tblBodyRowCell.setAttribute('id',fieldID + '_235_1');
					tblBodyRowCell.setAttribute('class','center-align');
					tblBodyRow.appendChild(tblBodyRowCell);
					break;
				case 2:
					tblBodyRowCell = document.createElement('td');
					tblBodyRowCell.setAttribute('id',fieldID + '_236_1');
					tblBodyRowCell.setAttribute('class','center-align');
					tblBodyRow.appendChild(tblBodyRowCell);
					break;
			}
		}
		tblBody.appendChild(tblBodyRow);
	}	
	overheadContributionTbl.appendChild(tblBody);
	overheadContributionTblLoc.appendChild(overheadContributionTbl);
}

function createcompletionDateTable(){
	var tableLocation = document.getElementById('completionTable');
	var datesTable = document.createElement('table');
	datesTable.setAttribute('class','striped');
	var tblHeader = document.createElement('thead');
	var tblHeaderRow = document.createElement('tr');
	for (var i=0;i<2;i++){
		var tblHeaderCell = document.createElement('th');
		if(i==1){
			var tblHeaderCellTxt = document.createTextNode('Weeks');
			tblHeaderCell.appendChild(tblHeaderCellTxt);
		}
		tblHeaderRow.appendChild(tblHeaderCell);
	}
	tblHeader.appendChild(tblHeaderRow);
	datesTable.appendChild(tblHeader);

	var tblBody = document.createElement('tbody');
	for(var j=0;j<2;j++){
		tblBodyRow = document.createElement('tr');
		for(var k=0;k<2;k++){
			switch(k){
				case 0:
					var rowTitle = document.createElement('th');
					var rowTitleTxt;
					if(j==0){
						rowTitleTxt = document.createTextNode('Weeks Completed');
					}else{
						rowTitleTxt = document.createTextNode('Weeks Contracted');
					}
					rowTitle.appendChild(rowTitleTxt);
					tblBodyRow.appendChild(rowTitle);
					break;
				case 1:
					var rowContents = document.createElement('td');
					if(j==0){
						rowContents.setAttribute('id','_1_1_134_1_139_1');
					}else{
						rowContents.setAttribute('id','_1_1_134_1_140_1');
					}
					tblBodyRow.appendChild(rowContents);
					break;
			}
		}
		tblBody.appendChild(tblBodyRow);
		datesTable.appendChild(tblBody);
	}
	tableLocation.appendChild(datesTable);
}

function populateOverheadContributionTbl(){
	var tblRows=['SubContractors', 'Materials', 'Consultants', 'Stats', 'Preliminaries', 'Others', 'OHP', 'Total'];
	var rowNum = tblRows.length;
	var overheadData = result.contractData;
	var fieldID;
	for(var i=0; i<8; i++){
		for(var j=0;j<2;j++){
			var dataRef;
			switch(j){
				case 0:
					dataRef = 'Gross'+ tblRows[i];
					fieldID='_1_1_234_'+(i+1)+'_235_1'
					if(dataRef=='GrossTotal'){
						moreThanZero(document.getElementById(fieldID).innerHTML = overheadData[dataRef],fieldID);
					}else{
						document.getElementById(fieldID).innerHTML=overheadData[dataRef];
					}
					break;
				case 1:
					dataRef = 'Movement'+ tblRows[i];
					fieldID='_1_1_234_'+(i+1)+'_236_1'
					if(dataRef=='MovementTotal'){
						moreThanZero(document.getElementById(fieldID).innerHTML = overheadData[dataRef],fieldID);
					}else{
						document.getElementById(fieldID).innerHTML=overheadData[dataRef];
					}
					break;
			}
		}
	}
}

function createProjectKPITbl(){
	var projectKpiTblLoc = document.getElementById('projectKpiContent');
	var projectKpiTbl = document.createElement('table');
	projectKpiTbl.setAttribute('class','striped');
	var projectKpiHeader = document.createElement('thead');
	var projectKpiHeaderNames = ["","","Target","Acutal","Variance",];
	var kpiHeaderRow = document.createElement('tr');
	for(var i=0;i<5;i++){
		var projectKpiHeaderCell = document.createElement("th");
		projectKpiHeaderCell.setAttribute('class','center-align');
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
	
	for (var i=0; i<projectKpiTblRows.length; i++){
		var projectKpiBodyRow = document.createElement("tr");
		var cellCount;
		var cellRef;
		switch(i){
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
				cellRef="_1_1_224_1"+i;
				break;
			case 8:
			case 10:
				cellCount = 5;
				cellRef="_1_1_224_1"+i;
				break;
		}
		if(cellCount==4){
			if(i==4||i==7||i==11){
				for(var j=0; j<cellCount;j++){
					var projectKpiCellBody = document.createElement('td');
					switch(j){
						case 0:
							projectKpiCellBody.setAttribute('colspan','2');
							projectKpiCellBody.innerHTML = projectKpiTblRows[i];
							break;
						case 1:
							projectKpiCellBody.setAttribute('id', cellRef+'_228_1');
							projectKpiCellBody.setAttribute('class','center-align')
							break;
						case 2:
							projectKpiCellBody.setAttribute('id', cellRef+'_229_1')
							projectKpiCellBody.setAttribute('class','center-align')
							break;
						case 3:
							projectKpiCellBody.setAttribute('id', cellRef+'_230_1');
							projectKpiCellBody.setAttribute('class','center-align')
							break;
					}
					projectKpiBodyRow.appendChild(projectKpiCellBody);
				}
			}else if(i<=7){
				for(var k=0; k<cellCount;k++){
					var projectKpiCellBody = document.createElement('td');
					switch(k){
						case 0:
							projectKpiCellBody.setAttribute('colspan','2');
							projectKpiCellBody.innerHTML = projectKpiTblRows[i];
							break;
						case 1:
							projectKpiCellBody.setAttribute('id', cellRef+'_225_1');
							projectKpiCellBody.setAttribute('class','center-align')
							break;
						case 2:
							projectKpiCellBody.setAttribute('id', cellRef+'_226_1')
							projectKpiCellBody.setAttribute('class','center-align')
							break;
						case 3:
							projectKpiCellBody.setAttribute('id', cellRef+'_227_1');
							projectKpiCellBody.setAttribute('class','center-align')
							break;
					}
					projectKpiBodyRow.appendChild(projectKpiCellBody);
				}
			}else{
				for(var l=0; l<cellCount;l++){
					var projectKpiCellBody = document.createElement('td');
					projectKpiCellBody.setAttribute('class','center-align');
					switch(l){
						case 0:
							projectKpiCellBody.innerHTML = projectKpiTblRows[i];
							break;
						case 1:
							projectKpiCellBody.setAttribute('id', cellRef+'_225_1');
							projectKpiCellBody.setAttribute('class','center-align')
							break;

						case 2:
							projectKpiCellBody.setAttribute('id', cellRef+'_226_1');
							projectKpiCellBody.setAttribute('class','center-align')
							break;

						case 3:
							projectKpiCellBody.setAttribute('id', cellRef+'_227_1');
							projectKpiCellBody.setAttribute('class','center-align')
							break;



					}
					projectKpiBodyRow.appendChild(projectKpiCellBody);
				}
			}
		}else{
			for(var m=0; m<cellCount;m++){
					var projectKpiCellBody = document.createElement('td');
					projectKpiCellBody.setAttribute('class','center-align');
					switch(m){
						case 0:
							projectKpiCellBody.setAttribute('rowspan','2');
							projectKpiCellBody.innerHTML = projectKpiTblRows[i];
							break;
						case 1:
							if(i==8 && l==1){
								projectKpiCellBody.innerHTML = 'Water m3 per £100k';
							}else if(i==10 && l==1){
								projectKpiCellBody.innerHTML = 'Percentage Skip Waste Recycled';
							}
							projectKpiCellBody.setAttribute('class','center-align')
							break;
						case 2:
							projectKpiCellBody.setAttribute('id', cellRef+'_225_1');
							projectKpiCellBody.setAttribute('class','center-align')
							break;
						case 3:
							projectKpiCellBody.setAttribute('id', cellRef+'_226_1');
							projectKpiCellBody.setAttribute('class','center-align')
							break;

						case 4:
							projectKpiCellBody.setAttribute('id', cellRef+'_227_1');
							projectKpiCellBody.setAttribute('class','center-align')
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
	var completionDateTbl='<table><thead><tr>';
	completionDateTbl+='<th></th>';
	completionDateTbl+='<th>Date</th>';
	completionDateTbl+='</thead><tbody>';
	var row;
	var rowID;
	for(var i=0; i<2; i++){
		if(i==0){
			row = 'Contractual';
			rowID = '_1_1_134_1_141_1';
		}
		else{
			row ='Estimate';
			rowID = '_1_1_134_1_142_1' 
		}
		completionDateTbl+='<tr><td>'+row+'</td>';
		completionDateTbl+='<td id='+rowID+'></td></tr>';
	}
	completionDateTbl+='</tbody></table>';
	document.getElementById('completionTable').innerHTML=completionDateTbl;
	document.getElementById('_1_1_134_1_141_1').innerHTML = result.contractData.ConCompDate;
	document.getElementById('_1_1_134_1_142_1').innerHTML = result.contractData.EstCompDate;
}

function populateValuationInfoTbl(){
	document.getElementById('_1_1_231_1_232_1').innerHTML = '£ '+result.contractData.CumulativeValueGross;
	document.getElementById('_1_1_231_1_233_1').innerHTML = '£ '+result.contractData.CumulativeProfitGross;
	document.getElementById('_1_1_231_2_232_1').innerHTML = '£ '+ addCommas(result.contractData.MonthlyValue);
	document.getElementById('_1_1_231_2_233_1').innerHTML = '£ '+result.contractData.MonthlyProfit;
	document.getElementById('_1_1_231_3_232_1').innerHTML = '£ '+addCommas(parseInt(result.contractData.QtrTurnOverMonthForeCast));
	document.getElementById('_1_1_231_3_233_1').innerHTML = '£ '+result.contractData.QtrProfMonthForeCast;
	calculateVariance(result.contractData.MonthlyValue, result.contractData.QtrTurnOverMonthForeCast, '_1_1_231_4_232_1');
	calculateVariance(result.contractData.MonthlyProfit, result.contractData.QtrProfMonthForeCast, '_1_1_231_4_233_1');
	document.getElementById('_1_1_231_5_232_1').innerHTML = '£ '+ addCommas(result.contractData.QtrTurnOverCumActual);
	document.getElementById('_1_1_231_5_233_1').innerHTML = '£ '+ result.contractData.QtrProfCumActual;
	document.getElementById('_1_1_231_6_232_1').innerHTML = '£ '+ addCommas(result.contractData.QtrTurnOverCumForeCast);
	document.getElementById('_1_1_231_6_233_1').innerHTML = '£ '+result.contractData.QtrProfCumForecast;
	calculateVariance(result.contractData.QtrTurnOverCumActual, result.contractData.QtrTurnOverCumForeCast, '_1_1_231_7_232_1');
	calculateVariance(result.contractData.QtrProfCumActual, result.contractData.QtrProfCumForecast, '_1_1_231_7_233_1');
	
	//
	document.getElementById('_1_1_134_1_139_1').innerHTML = weeksCompleted;
	document.getElementById('_1_1_134_1_140_1').innerHTML = result.contractData.WeeksContracted;
	document.getElementById('_1_1_134_1_137_1').innerHTML = result.contractData.TimeCompleted;
	document.getElementById('_1_1_134_1_138_1').innerHTML = result.contractData.TimeRemaining;
	document.getElementById('_1_1_134_1_135_1').innerHTML = result.contractData.ValueCompleted;
	document.getElementById('_1_1_134_1_136_1').innerHTML = result.contractData.ValueRemaining;
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
	}).on('click', function(i, row){
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

function currentWeekRecordOfLabourGraph(){
	var recordOfLabourData = getRecordOfLbrFigures();
	var recOfLbrGraphData =[]
	var days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
	var dayIndex = 0;
	for(var prop in recordOfLabourData){

		recOfLbrGraphData.push({x: days[dayIndex], y: recordOfLabourData[prop]});
		dayIndex++;
	}
	Morris.Area({
		element: 'weeklyRecordOfLabour',
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

function getRecordOfLbrFigures(){
	var recOfLbrTbl = document.getElementById("recOfLbr");
	var rowNums = document.getElementById("recOfLbr").rows.length-1;
	var cellNum = recOfLbrTbl.rows[rowNums].cells.length;
	var recordOfLabourFigures = [];
	for(var i=0;i<cellNum;i++){
		if(i!=0&&i!=8)
		recordOfLabourFigures.push(document.getElementById("recOfLbr").rows[rowNums].cells[i].innerHTML);
	}
	return recordOfLabourFigures;
}

function getRecordOfLbrTotals(){
	var recOfLbrTbl = document.getElementById("recOfLbr");
	var rowNums = document.getElementById("recOfLbr").rows.length-1;
	var cellNum = recOfLbrTbl.rows[rowNums].cells.length;
	var recordOfLabourTotals = [];
	for(var i=1;i<rowNums;i++){
		recordOfLabourTotals.push(document.getElementById("recOfLbr").rows[i].cells[8].innerHTML);
	}
	return recordOfLabourTotals;
}

function recordOfLabourTotalsGraph(){
	var overallRecordOfLabourData = getRecordOfLbrTotals();
	var recOfLbrTtlGraphData =[]
	var weekNumber=1;
	for(var prop in overallRecordOfLabourData){
		recOfLbrTtlGraphData.push({x: 'Week '+weekNumber, y: overallRecordOfLabourData[prop]});
		weekNumber++;
	}
	Morris.Area({
		element: 'recordOfLabourGraph',
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


//Financial Graph Section
function turnoverGraph(){
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
		element: predTurnoverGraph,
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
	var costFlowData = tableToArray(document.getElementById('costflowTbl'));
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

function totalCwdToDate(){
	totalCwdData = tableToArray(document.getElementById('cwdToDate'));
	totalCwdGraphData = [];
	for(var subbie in totalCwdData){
		totalCwdGraphData.push({subContractor:totalCwdData[subbie][0],number:totalCwdData[subbie][1]});
	}

	Morris.Bar({
		element: 'totalCwdGraph',
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
	monthlyCwdData = tableToArray(document.getElementById('cwdMonthly'));
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


//CCS Costs Graphs Section
function copyConsiderateContractorTbl(){
	var considerateContractorTbl = document.getElementById("considerContractorTbl");
	var clone = considerateContractorTbl.cloneNode(true);
	clone.id="ccsContractorTbl"
	document.getElementById("considerateConsTbl").appendChild(clone);
}

function considerateContractorsGraph(){
	var considerateContractorsData = tableToArray(document.getElementById('ccsContractorTbl'));
	var contractorGraphData=[]
	for(var prop in considerateContractorsData){
		contractorGraphData.push({x:considerateContractorsData[prop][0], y:considerateContractorsData[prop][1]})
	}
	Morris.Area({
		element: 'considerateConsGraph',
		data: contractorGraphData,
		xkey: 'x',
		ykeys: ['y'],
		labels: ['Score'],
		fillOpacity: 0.5,
		behaveLikeLine:true,
		parseTime: false,
		resize:true
	});
}

function materialsOrderedChart(){
	var materialCatsData = tableToArray(materialsByCat);
	Morris.Donut({
	  element: 'materialSummaryGraph',
	  data: [
	    {label: materialCatsData[0][0], value: materialCatsData[0][1]},
	    {label: materialCatsData[1][0], value: materialCatsData[1][1]},
	    {label: materialCatsData[2][0], value: materialCatsData[2][1]}
	  ],
	  resize:true,
	  colors:['#B20000','#57C61C','#FFC300']
	});
}

function materialsReasonChart(){
	var materialReasonData = tableToArray(replacementsByReason);
	Morris.Donut({
	  element: 'materialReasonGraph',
	  data: [
	    {label: materialReasonData[0][0], value: materialReasonData[0][1]},
	    {label: materialReasonData[1][0], value: materialReasonData[1][1]},
	    {label: materialReasonData[2][0], value: materialReasonData[2][1]},
	    {label: materialReasonData[3][0], value: materialReasonData[3][1]}
	  ],
	  resize:true,
	  colors:['#B20000','#57C61C','#3232ad','#FFC300']
	});
}


//Sub-Contractor Finance Graphs Section
function subContractorOrderVariations(){
	subbieData = result.SubConFinData.length;
	subbieGraphData=[];
	for(var i=0;i<subbieData;i++){
		subbieGraphData.push({subContractor:result.SubConFinData[i].SubContractorName,NettOrderValue: result.SubConFinData[i].SubContractNettOrderValue,recoverableVar: result.SubConFinData[i].RecoverableVariations,site: result.SubConFinData[i].Site,package: result.SubConFinData[i].Package,designDevelopment:result.SubConFinData[i].DesignDevelopment});
	}
	Morris.Bar({
		element: 'subConGraph',
		data: subbieGraphData,
		xkey: 'subContractor',
		ykeys: ['NettOrderValue','recoverableVar','site','package','designDevelopment'],
		labels: ['Sub-Contract Nett Order Value', 'Recoverable Variations','Site','Package','Design Development'],
		xLabelAngle:35,
		stacked:true,
		resize:true
	});
}


//HS Graph Section
function tradeAccidentGraph(location){
	accidentTradeData = tableToArray(document.getElementById('accidentsTrade'));
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
	  formatter: function (value, data) { return (parseFloat(value)/count *100) + '%';}
	});
}

function typeAccidentGraph(){
	accidentTypeData = tableToArray(document.getElementById('accidentsType'));
	accidentTypeGraphData=[];
	var count = 0;
	for(var type in accidentTypeData){
		if(accidentTypeData[type][1]>0){
			accidentTypeGraphData.push({value:accidentTypeData[type][1], label:accidentTypeData[type][0]});
			count += parseInt(accidentTypeData[type][1]);
		}
	}
	Morris.Donut({
	  element: 'HsByTypeGraph',
	  data: accidentTypeGraphData,
	  resize:true,
	  formatter: function (value, data) { return (parseFloat(value)/count *100).toFixed(0) + '%';}
	});
}

function HSMonthlyAuditGraph(chartLocation){
	var auditData = tableToArray(document.getElementById('monthlyAuditTbl'));
	var auditGraphData=[]
	for(var prop in auditData){
		if(auditData[prop][0].substr(3,5)>=17){
			if(auditData[prop][1]!='undefined'){
				auditGraphData.push({x:auditData[prop][0], a:auditData[prop][1], b:80});
			}
		}	
	}
	Morris.Area({
		element: chartLocation,
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
	daysLostData = tableToArray(document.getElementById('daysLostTbl'));
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


//TimeValue Graphs
function createTimeTable(){
	var tableLocation = document.getElementById('timeTable');
	var timeTable = document.createElement('table');
	timeTable.setAttribute('class','striped');
	var tableHeader = document.createElement('thead');
	var headerRow = document.createElement('th');
	headerRow.setAttribute('colspan','2');
	var headerTxt = document.createTextNode('Time');
	headerRow.appendChild(headerTxt);
	tableHeader.appendChild(headerRow)
	timeTable.appendChild(tableHeader);
	var tableBody = document.createElement('tbody');
	for(var i=0; i<4;i++){
		var tableRow = document.createElement('tr');
		var rowHeader = document.createElement('td');
		var rowContent= document.createElement('td');
		switch(i){
			case 0:
				var rowHeaderText=document.createTextNode('Weeks Completed');
				rowContent.setAttribute('id','_1_1_134_1_139_1');
				rowHeader.appendChild(rowHeaderText);
				break;
			case 1:
				var rowHeaderText=document.createTextNode('Weeks Contracted');
				rowContent.setAttribute('id','_1_1_134_1_140_1');
				rowHeader.appendChild(rowHeaderText);
				break;
			case 2:
				var rowHeaderText=document.createTextNode('Time Completed %');
				rowContent.setAttribute('id','_1_1_134_1_137_1');
				rowHeader.appendChild(rowHeaderText);
				break;
			case 3:
				var rowHeaderText=document.createTextNode('Time Remaining %');
				rowContent.setAttribute('id','_1_1_134_1_138_1');
				rowHeader.appendChild(rowHeaderText);
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
	var tableLocation = document.getElementById('valueTable');
	var valueTable = document.createElement('table');
	valueTable.setAttribute('class','striped');
	var tableHeader = document.createElement('thead');
	var headerRow = document.createElement('th');
	headerRow.setAttribute('colspan','2');
	var headerTxt = document.createTextNode('Value');
	headerRow.appendChild(headerTxt);
	valueTable.appendChild(headerRow);
	var tableBody = document.createElement('tbody');
	for(var i=0; i<2;i++){
		var tableRow = document.createElement('tr');
		var rowHeader = document.createElement('td');
		var rowContent= document.createElement('td');
		switch(i){
			case 0:
				var rowHeaderText=document.createTextNode('Value Completed');
				rowContent.setAttribute('id','_1_1_134_1_135_1');
				rowHeader.appendChild(rowHeaderText);
				break;
			case 1:
				var rowHeaderText=document.createTextNode('Value Remaining');
				rowContent.setAttribute('id','_1_1_134_1_136_1');
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

function createTimeChart(chartLocation){
	var completedTime = document.getElementById('_1_1_134_1_137_1').innerHTML;
	var timeRemaining = document.getElementById('_1_1_134_1_138_1').innerHTML;
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
	var completedValueData = result.contractData.ValueCompleted
	var remainingValueData = result.contractData.ValueRemaining
	
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


//Project KPI section
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
	var tblRows=["Adherence to Prelim Budget", "Predictability to Cash Flow (month)", "Predictability to Cash Flow (Qtr)", "Non Recoverable Works", "Predictability of Programme", "H&S Audit Score", "H&S Accident Incident Rate", "Considerate Constructor Score", "Waste", "Percentage Recycled", "Waste per £100k", "Water m3 per £100k", "Energy KG CO2 per £100k"];
	var tblRowId=["adherence","monthlyCashflow","qtrCashflow","nonRecWorks","predOfProgram","HSAudit","HSAccidentRate","considerateConstructor","","pctRecycled","waste100k","water100k","energy100k"];
	for (var i=0; i<tblRows.length; i++){
		var bodyRow = document.createElement('tr');
		var cellRef = '_1_1_224_'+i
		for(var j=0; j<8;j++){
			var bodyCell = document.createElement('td')
			switch(j){
				case 0:
					var bodyRowText = document.createTextNode(tblRows[i]);
					bodyCell.appendChild(bodyRowText);
					break;
				case 1: 
					bodyCell.setAttribute('id',cellRef+'_225_1');
					bodyCell.setAttribute('class','center-align');
					break;
				case 2: 
					bodyCell.setAttribute('id',cellRef+'_226_1');
					bodyCell.setAttribute('class','center-align');
					break;
				case 3: 
					bodyCell.setAttribute('id',cellRef+'_227_1');
					bodyCell.setAttribute('class','center-align');
					break;
				case 5: 
					bodyCell.setAttribute('id',cellRef+'_228_1');
					bodyCell.setAttribute('class','center-align');
					break;
				case 6: 
					bodyCell.setAttribute('id',cellRef+'_229_1');
					bodyCell.setAttribute('class','center-align');
					break;
				case 7: 
					bodyCell.setAttribute('id',cellRef+'_230_1');
					bodyCell.setAttribute('class','center-align');
					break;
			}
			bodyRow.appendChild(bodyCell);
		}
		kpiBody.appendChild(bodyRow);
	}
	kpiHTMLtable.appendChild(kpiBody);
	tblLocation.appendChild(kpiHTMLtable);	
}

function createMonthlyKPITbl2(){
	var monthlyKPI='<table class="striped highlight" id="monthlyKpiTbl"><thead>';
		monthlyKPI+='<tr class="centered"><th>Month</th>';
		monthlyKPI+="<th class='center-align'>Total Skip waste m<sup>3</sup></th>";
		monthlyKPI+="<th class='center-align'>Total Cart Away Waste m<sup>3</sup></th>";
		monthlyKPI+="<th class='center-align'> % All Skip Waste Recycled</th>";
		monthlyKPI+="<th class='center-align'> Water m<sup>3</sup></th>";
		monthlyKPI+="<th class='center-align'>Emissions from Diesel KG CO<sup>2</sup></th>";
		monthlyKPI+="<th class='center-align'>Emissions from Electricity KG CO<sup>2</sup></th>";
		monthlyKPI+="<th class='center-align'>Total Emissions KG CO<sup>2</sup></th>";
		monthlyKPI+="<th class='center-align'>Waste per £100k m<sup>3</sup></th>";
		monthlyKPI+="<th class='center-align'>Emissions from Energy KG CO<sup>2</sup> per 100KG</th>";
		monthlyKPI+="<th class='center-align'>Water m<sup>3</sup> per £100k</th>";
		monthlyKPI+="<th class='center-align'>Actual T.O</th></tr></thead><tbody>";
		monthlyKPI+="</tbody></table>";
	document.getElementById("monthlyKpiTable").innerHTML=monthlyKPI;				
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

	var tblBody = document.createElement('tbody');
	var rowNum = result.projectKPI.length;
	for (var j=0; j<rowNum; j++){
		if(i<50){
			var tblRows=['_6_1','_8_1', '_10_1', '_12_1', '_14_1', '_244_1', '_16_1', '', '_18_1','_20_1','_22_1','_24_1'];
		}else{
			var tblRows=['_7_1','_9_1', '_11_1', '_13_1', '_15_1', '_245_1', '_17_1', '', '_19_1','_21_1','_23_1','_25_1'];
		}
		var tblBodyRow = document.createElement('tr');
		for(var k=0; k<headerLength; k++){
			var tblBodyRowCell;
			var tblBodyRowCellText;
			if(i<50){
				var fieldID="_1_1_2_"+j+tblRows[k];
			}else{
				var fieldID="_1_1_4_"+j+tblRows[k];
			}
			tblBodyRowCell = document.createElement('td');
			tblBodyRowCell.setAttribute('id',fieldID);
			if (k==0){
				tblBodyRowCellText = document.createTextNode(result.projectKPI[j].Date);
				tblBodyRowCell.appendChild(tblBodyRowCellText);
				tblBodyRow.appendChild(tblBodyRowCell);
			}else{
				tblBodyRowCell.setAttribute('class','center-align');
				tblBodyRow.appendChild(tblBodyRowCell);
			}
		}
		tblBody.appendChild(tblBodyRow);
	}	
	monthlyKpiTbl.appendChild(tblBody);
	monthlyKpiTblLoc.appendChild(monthlyKpiTbl);
}

function populateMonthlyKpiTbl2(){
	var rowIds=['Date','TtlSkipWasteM3', 'TtlCartAwayWasteM3', 'SkipWasteRecycled', 'WaterM3', 'emitFromDieselKgCo2', 'EmitFromElectrictyKgCo2', 'TtlEmitkgCO2', 'Wstper100kM3','emitFromEnergyKgCo2Per100k','waterM3Per100k','ActualTO'];
	var rowNum = result.projectKPI.length;
	var rowLength = rowIds.length;
	var kpiData=result.projectKPI;
	for(var Prop in kpiData){
		console.log('The Prop in kpiData is: '+Prop)
		for(var innerProp in kpiData[Prop]){
			console.log('The innerProp in kpiData is: '+innerProp);
			if(Prop<50){}
		}
	}
}

function populateMonthlyKpiTbl(){
	var rowIds=['Date','TtlSkipWasteM3', 'TtlCartAwayWasteM3', 'SkipWasteRecycled', 'WaterM3', 'emitFromDieselKgCo2', 'EmitFromElectrictyKgCo2', 'TtlEmitkgCO2', 'Wstper100kM3','emitFromEnergyKgCo2Per100k','waterM3Per100k','ActualTO'];
	var rowNum = result.projectKPI.length;
	var rowLength = rowIds.length;
	var kpiData=result.projectKPI;
	for(var Prop in kpiData){
		var sizeOfRow = Object.keys(kpiData[Prop]).length;
		var tblRowIndex = 0;
		for(var innerProp in kpiData[Prop]){
			if(parseInt(Prop)<50){
				var tblRows=['_6_1','_8_1', '_10_1', '_12_1', '_14_1', '_244_1', '_16_1', '', '_18_1','_20_1','_22_1','_24_1'];
				var fieldID="_1_1_2_"+Prop+tblRows[tblRowIndex];
			}else{
				var tblRows=['_7_1','_9_1', '_11_1', '_13_1', '_15_1', '_245_1', '_17_1', '', '_19_1','_21_1','_23_1','_25_1'];
				var fieldID="_1_1_4_"+Prop+tblRows[tblRowIndex];
			}
			if(innerProp!='ContractNumber'){
				document.getElementById(fieldID).innerHTML = kpiData[Prop][innerProp];
				if(innerProp=='Wstper100kM3'||innerProp=='emitFromEnergyKgCo2Per100k'||innerProp=='waterM3Per100k'){
					switch(innerProp){
						case 'Wstper100kM3':
							targetComparison(document.getElementById('_1_1_224_10_228_1').innerHTML,document.getElementById(fieldID).innerHTML = kpiData[Prop][innerProp], fieldID);
							break;
						case 'emitFromEnergyKgCo2Per100k':
							targetComparison(document.getElementById('_1_1_224_12_228_1').innerHTML,document.getElementById(fieldID).innerHTML = kpiData[Prop][innerProp], fieldID);
							break;
						case 'waterM3Per100k':
							targetComparison(document.getElementById('_1_1_224_11_228_1').innerHTML,document.getElementById(fieldID).innerHTML = kpiData[Prop][innerProp], fieldID);
							break;
					}
				}
				tblRowIndex++;
			}
			
		}
	}
}

function populateRecordOfLabourTbl(){
	var table = document.getElementById("recOfLbr");
	table.tBodies[0].innerHTML="";
	var queueTblBodyRow = document.getElementsByTagName("tbody");
	var RecOfLbrData = result.RecordOfLabour;
	var sqlStartingWeek = result.RecordOfLabour[0].WeekNum;
	var tblBodyCell;
	var cellText;
	for(var i=0; i<sqlStartingWeek;i++){
		var tblBodyRow=document.createElement("tr");
		for(var j=0;j<9;j++){
			if(j==0){
				tblBodyCell = document.createElement("th");
				tblBodyCell.setAttribute('id','WeekNum'+i);
				tblBodyCell.setAttribute('class','center-align');
				cellText = document.createTextNode(i);
				tblBodyCell.appendChild(cellText);
				tblBodyRow.appendChild(tblBodyCell);
			}else{
				tblBodyCell = document.createElement("td");
				cellText = document.createTextNode("0");
				tblBodyCell.setAttribute('class','center-align');
				tblBodyCell.appendChild(cellText);
				tblBodyRow.appendChild(tblBodyCell);
			}
		}
		table.tBodies[0].appendChild(tblBodyRow);
	}
	for(var Prop in RecOfLbrData){
		var tblBodyRow=document.createElement("tr");
		var weeksTotal =0;
		for(var innerProp in RecOfLbrData[Prop]){
			if(innerProp!='ContractNumber'){
				if(innerProp == 'WeekNum'){tblBodyCell = document.createElement("th")}
				else{tblBodyCell = document.createElement("td");}
				tblBodyCellId=innerProp+"_"+Prop;
				tblBodyCell.setAttribute('id',tblBodyCellId);
				tblBodyCell.setAttribute('class','center-align');
				cellText = document.createTextNode(RecOfLbrData[Prop][innerProp]);
				if(innerProp!='WeekNum'){weeksTotal += parseFloat(RecOfLbrData[Prop][innerProp])}
				tblBodyCell.appendChild(cellText);
				tblBodyRow.appendChild(tblBodyCell);
			}else{
				weeksTotal=0;
			}
		}
		tblBodyCell = document.createElement("td");
		tblBodyCell.setAttribute('id',innerProp+"_"+Prop);
		tblBodyCell.setAttribute('class','center-align');
		var cellText = document.createTextNode(weeksTotal);
		tblBodyCell.appendChild(cellText);
		tblBodyRow.appendChild(tblBodyCell);
		table.tBodies[0].appendChild(tblBodyRow);
	}
}	


//Progress Data Section
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
	for (var j=0; j<projectMonths.length; j++){
		var bodyRow = document.createElement('tr');
		for(var k=0;k<2;k++){
			var bodyCellText = document.createTextNode(projectMonths[i]);
			var bodyCell = document.createElement('td');
			if(projectMonths[i]!= '___rowNum__'){
				switch(k){
					case 0:
						if(j<50){
							bodyCell.setAttribute('id','_1_1_218_'+(j+1)+'_222_1');
							bodyCell.appendChild(bodyCellText);

						}else{
							bodyCell.setAttribute('id','_1_1_220_'+(j+1)+'_223_1');
							bodyCell.appendChild(bodyCellText);
						}
						break;
					case 1:
						if(j<50){
							bodyCell.setAttribute('id','_1_1_218_'+(j+1)+'_219_1');
						}else{
							bodyCell.setAttribute('id','_1_1_220_'+(j+1)+'_221_1')
						}
				}
			}
			bodyRow.appendChild(bodyCell);
		}
		progressBody.appendChild(bodyRow);
	}
	progressTable.appendChild(progressBody);
	tableLocation.appendChild(progressTable);
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
	 			switch(j){
	 				case 0:
	 					tblBodyText = document.createTextNode('0');
	 					break;
	 				case 1:
	 					tblBodyText = document.createTextNode('1');
	 					break;
	 				case 2:
	 					tblBodyText = document.createTextNode('0');
	 					break;
	 			}
	 			tblBodyCell.appendChild(tblBodyText);
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
	 			switch(j){
	 				case 0:
	 					tblBodyText = document.createTextNode('0');
	 					break;
	 				case 1:
	 					tblBodyText = document.createTextNode('1');
	 					break;
	 				case 2:
	 					tblBodyText = document.createTextNode('0');
	 					break;
	 				case 3:
	 					tblBodyText = document.createTextNode('0');
	 					break;
	 			}
	 			tblBodyCell.appendChild(tblBodyText);
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
	labourTable.setAttribute('id','recofLbr');
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
	for(var i=0;i<weeksCompleted; i++){
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

function recordOfLabourRows2(startOfFieldID, identifier, endOfFieldID){
	var fieldRow='';
	var fieldEnd = endOfFieldID;
	for(var i=0;i<8;i++){
		fieldRow+='<td id="'+startOfFieldID+'_'+identifier+'_'+fieldEnd+'_1"></td>';
		fieldEnd++;
	}
	return fieldRow;
}

function recordOfLabourRows(startOfFieldID, identifier, endOfFieldID, weekNumber){
	var rowOfFields=document.createElement('tr');
	var weekNumberCell = document.createElement('th');
	var weekNumber = document.createTextNode(weekNumber+1);
	var fieldEnd = endOfFieldID;
	for(var i=0;i<9;i++){
		var singleField = document.createElement('td');
		var fieldID = startOfFieldID+'_'+identifier+'_'+fieldEnd+'_1';
		singleField.setAttribute('id',fieldID);
		rowOfFields.appendChild(singleField);
		fieldEnd++;
	}
	return rowOfFields;
}

function createConsiderateConstructorsTable(location){
	var tableLocation = document.getElementById(location)
	var considerateConsTable = document.createElement('table');
	considerateConsTable.setAttribute('id','considerContractorTbl')
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
	var tableBody = document.createElement('tbody');
	for(var j=0;j<3;j++){
		var bodyRow = document.createElement('tr');
		for(var k=0;k<2;k++){
			var bodyCell = document.createElement('td');
			if(i==0){
				bodyCell.setAttribute('id','_1_1_215_x_1_216_1');
			}else{
				bodyCell.setAttribute('id','_1_1_215_x_1_217_1');
			}
			bodyRow.appendChild(bodyCell);
		}
		tableBody.appendChild(bodyRow);
	}
	considerateConsTable.appendChild(tableBody);
	tableLocation.appendChild(considerateConsTable);
}



//Financial Data Section
function createPredTurnoverTbl(){
	var predTurnoverTbl='<h5>Predictability (Turnover)</h5><table class="striped"><thead><tr><th>Month</th><th>Original Cum T.O</th><th>Current Cum T.O</th><th>Actual Cum T.O</th></tr></thead><tbody>';
	for (var i=0; i<projectMonths.length; i++){
		if(projectMonths[i]!= '___rowNum__'){
			if(i<50){
				var startOfFieldID='_1_1_144_'
				predTurnoverTbl+='<tr><td>'+projectMonths[i]+'</td>';
				predTurnoverTbl+='<td id="'+startOfFieldID+(i+1)+'_145_1"> £ '+addCommas(result.financialData[2][projectMonths[i]])+'</td>';
				predTurnoverTbl+='<td id="'+startOfFieldID+(i+1)+'_146_1"> £ '+addCommas(result.financialData[0][projectMonths[i]])+'</td>';
				predTurnoverTbl+='<td id="'+startOfFieldID+(i+1)+'_147_1"> £ '+addCommas(result.financialData[1][projectMonths[i]])+'</td></tr>';
			}else{
				var startOfFieldID='_1_1_148_'
				predTurnoverTbl+='<tr><td>'+projectMonths[i]+'</td>';
				predTurnoverTbl+='<td id="'+startOfFieldID+((i+1)-50)+'_149_1"> £ '+addCommas(result.financialData[2][projectMonths[i]])+'</td>';
				predTurnoverTbl+='<td id="'+startOfFieldID+((i+1)-50)+'_150_1"> £ '+addCommas(result.financialData[0][projectMonths[i]])+'</td>';
				predTurnoverTbl+='<td id="'+startOfFieldID+((i+1)-50)+'_151_1"> £ '+addCommas(result.financialData[1][projectMonths[i]])+'</td></tr>';
			}
		}
	}
	predTurnoverTbl+='</body></table>';
	document.getElementById('predTurnover').innerHTML=predTurnoverTbl;
}

function createCostflowTbl(){
	var CostflowTbl='<h5>Costflow</h5><table id="costflowTbl" class="striped"><thead><tr><th>Month</th>';
	CostflowTbl+='<th>Cum Certified Cash</th>';
	CostflowTbl+='<th>Current Cum T.O</th>';
	CostflowTbl+='<th>Actual Cum T.O</th>';
	CostflowTbl+='</tr></thead><tbody>';
	for (var i=0; i<projectMonths.length; i++){
		if(projectMonths[i]!= '___rowNum__'){
			if(i<50){
				var startOfFieldID='_1_1_152_'
				CostflowTbl+='<tr><td>'+projectMonths[i]+'</td>';
				CostflowTbl+='<td id="'+startOfFieldID+(i+1)+"_153_1'>"+result.financialData[0][projectMonths[i]]+'</td>';
				var cumTgtCostflow=(result.financialData[0][projectMonths[i]]*(1-0.1)).toFixed(0);
				CostflowTbl+='<td id="'+startOfFieldID+(i+1)+"_154_1'>"+cumTgtCostflow+"</td>";
				CostflowTbl+='<td id="'+startOfFieldID+(i+1)+"_155_1'>"+result.financialData[3][projectMonths[i]]+"</td></tr>";
			}else{
				var startOfFieldID='_1_1_157_'
				CostflowTbl+='<tr><td>'+projectMonths[i]+'</td>';
				CostflowTbl+='<td id="'+startOfFieldID+((i+1)-50)+"_158_1'>"+result.financialData[0][projectMonths[i]]+'</td>';
				var cumTgtCostflow=(result.financialData[0][projectMonths[i]]*(1-0.1)).toFixed(0);
				CostflowTbl+='<td id="'+startOfFieldID+((i+1)-50)+"_159_1'>"+cumTgtCostflow+"</td>";
				CostflowTbl+='<td id="'+startOfFieldID+((i+1)-50)+"_160_1'>"+result.financialData[3][projectMonths[i]]+"</td></tr>";
			}
		}
	}
	CostflowTbl+="</body></table>";
	document.getElementById("costflow").innerHTML=CostflowTbl;
}

//Subcontractor Financial Data Section			
function createsubConOrderVarTbl(){
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


	var tblLength = result.SubConFinData.length;

	var subConBody = document.createElement('tbody');
	
	for (var j=0; j<tblLength; j++){
		var bodyRow = document.createElement('tr');
		if(middleOfFieldID==51){middleOfFieldID=1};
		for(var k=0; k<6;k++){
			var bodyCell = document.createElement('td');
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
			bodyCell.setAttribute('id',bodyCellId);
			bodyRow.appendChild(bodyCell)
			endOfFieldID++;
		}
		subConBody.appendChild(bodyRow);
		middleOfFieldID++;
	}
	subConOrderTable.appendChild(subConBody)


	tableLocation.appendChild(subConOrderTable);
}



//HS Data Section
function getProjectMonths(){
	projectMonths = Object.getOwnPropertyNames(result.progress);
	projectMonths.shift();
	projectMonths.shift();
}

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
	for(var j=0;j<projectMonths.length;j++){
		var bodyRow = document.createElement('tr');
		if(projectMonths[j]!='___rowNum__'){
			var currentMonth = projectMonths[j];
			var	percentage =result.HSData[1][currentMonth];
			var	score = result.HSData[0][currentMonth];
			if(percentage==undefined){percentage=0};
			if(score==undefined){score=0};
			var HSAuditMonth = document.createElement('td');
			var HSAuditPercentage = document.createElement('td');
			var HSAuditScore = document.createElement('td');
			HSAuditMonth.appendChild(document.createTextNode(currentMonth));
			HSAuditPercentage.appendChild(document.createTextNode(percentage));
			HSAuditScore.appendChild(document.createTextNode(score));
			HSAuditMonth.setAttribute('class','center-align');
			HSAuditPercentage.setAttribute('class','center-align');
			HSAuditScore.setAttribute('class','center-align');
			if(j<50){
				HSAuditPercentage.setAttribute('id','_1_1_161_'+(j+1)+'_163_1');
				HSAuditScore.setAttribute('id','_1_1_161_'+(j+1)+'_164_1');
			}else{
				HSAuditPercentage.setAttribute('id','_1_1_162_'+((j+1)-50)+'_165_1');
				HSAuditScore.setAttribute('id', '_1_1_162_'+((j+1)-50)+'_166_1');
			}
		}
		bodyRow.appendChild(HSAuditMonth);
		bodyRow.appendChild(HSAuditPercentage);
		bodyRow.appendChild(HSAuditScore);
		tableBody.appendChild(bodyRow);
		
	}
	HSAuditTable.appendChild(tableBody);
	tableLocation.appendChild(HSAuditTable);
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
	document.getElementById("_1_1_224_5_229_1").innerHTML = (HSsum/numberOfMonths).toFixed(0);
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
	document.getElementById("_1_1_224_5_226_1").innerHTML = (HSsum/numberOfMonths).toFixed(0);
}

function createAccidentReportTbl(){
	var tableLocation = document.getElementById('tblAccidentReport');
	var accidentReportTable = document.createElement('table');
	accidentReportTable.setAttribute('class','striped');
	accidentReportTable.setAttribute('id','AccidentReportTbl');
	var tblHead = document.createElement('thead');
	var tblHeadRow = document.createElement('tr');
	for(var i=0;i<=4;i++){
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
	accidentReportTable.appendChild(tblBody);
	tableLocation.appendChild(accidentReportTable);
}

function addAccidentReportRow(tableName){
	var tbl = tableName;
	var tableLength = document.getElementById(tableName).rows[0].cells.length;
	var newTableRow = document.createElement("tr");
	for(var i = 0; i<tableLength;i++){
		var tblRowCell = document.createElement("td");
		var tblBodyRowcellTxt;
			switch(i){
				case 0:
					tblBodyRowcellTxt=document.createElement('input'); 
					tblBodyRowcellTxt.setAttribute('type','text');
					tblBodyRowcellTxt.setAttribute('class','datepicker');
					break;
				case 1:
					tblBodyRowcellTxt=document.createElement('input');
					tblBodyRowcellTxt.setAttribute('type','text');
					break
				case 2:
					tblBodyRowcellTxt=document.createElement('input');
					tblBodyRowcellTxt.setAttribute('type','number');
					break;
				case 3:
					tblBodyRowcellTxt=document.createElement('input');
					tblBodyRowcellTxt.setAttribute('type','number');
					break;
				case 4:
					tblBodyRowcellTxt=document.createElement('input');
					tblBodyRowcellTxt.setAttribute('type','number');
					break;
			}
			tblRowCell.appendChild(tblBodyRowcellTxt);
		newTableRow.appendChild(tblRowCell);
	}
	document.getElementById(tbl).tBodies[0].appendChild(newTableRow);
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
	tableLength=projectMonths.length;
	for(var j=0;j<tableLength;j++){
		var bodyRow = document.createElement('tr');
		for(var k=0;k<3;k++){
			var bodyRowCell = document.createElement('td');
			bodyRowCell.setAttribute('class','center-align');
			var bodyRowCellTxt;
			switch(k){
				case 0:
					bodyRowCellTxt = document.createTextNode(projectMonths[j]);
					break;
				case 1:
					bodyRowCellTxt = document.createTextNode('1');
					break;
				case 2:
					bodyRowCellTxt = document.createTextNode('0');
					break;
			}
			bodyRowCell.appendChild(bodyRowCellTxt);
			bodyRow.appendChild(bodyRowCell);
		}
		tableBody.appendChild(bodyRow);
	}
	DaysLostTable.appendChild(tableBody);
	tblLocation.appendChild(DaysLostTable);
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
	var typeData = result.TypeAccidents[0]
	var rowNum = Object.keys(typeData).length;
	for(var elem in typeData){
		if(elem != 'ContractNumber'){
			var tableBodyRow = document.createElement('tr');
			for(var j=0; j<2;j++){
				var bodyRowCell =document.createElement('td');
				var bodyRowCellText;
				switch(j){
					case 0:
						bodyRowCellText = document.createTextNode(elem);
						break;
					case 1:
						bodyRowCellText = document.createTextNode(typeData[elem]);
						break;
				}
				bodyRowCell.appendChild(bodyRowCellText);
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
	var tradeData = result.TradeAccidents[0]
	var rowNum = Object.keys(tradeData).length;
	for(var elem in tradeData){
		if(elem != 'ContractNumber'){
			var tableBodyRow = document.createElement('tr');
			for(var j=0; j<2;j++){
				var bodyRowCell =document.createElement('td');
				var bodyRowCellText;
				switch(j){
					case 0:
						bodyRowCellText = document.createTextNode(elem);
						break;
					case 1:
						bodyRowCellText = document.createTextNode(tradeData[elem]);
						break;
				}
				bodyRowCell.appendChild(bodyRowCellText);
				tableBodyRow.appendChild(bodyRowCell);
			}
			tableBody.appendChild(tableBodyRow);
		}
	}
	tradeTable.appendChild(tableBody);
	accidentTradeTblLoc.appendChild(tradeTable);
}