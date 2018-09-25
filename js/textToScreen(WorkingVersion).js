
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
				for(var j=0;j<totalSubConData.length;j++)
				{
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
				for(var i=0;i<roa.length;i++)
				{
					if(roa[i].ContractNumber===con)
						{
							result[sheetName] = roa[i];
							break;
						}
				}
			}
		}
	});
	createSummarySections();
	createProjectKpiSection();
	createProgressSection('progress');
	createSubContractorSection('subContractorData');
	createFinancialDataSection();
	createHSDataSection('hsData');
	hideInput();
	createRecordOfLabourTable();
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
	var section = ['summary-page', 'progressGraphs','financialGraph','subcontractorGraphs','hsGraphs','progress', 'ccsCosts','subContractorData','financialData','hsData','projectKPIs','timeValueGraphs'];
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

//traffic light filters

function moreThanZero(figure, location){
	if(parseInt(figure)>0){
		document.getElementById(location).setAttribute('class','green-text center-align');
	}
	else if(parseInt(figure)<0){
		document.getElementById(location).setAttribute('class','red-text center-align');
	}else{
		document.getElementById(location).setAttribute('class','orange-text center-align');
	}
}

//Populating tables

function populateTables(){
	weeksCompleted = result.valueInformation.WeeksCompleted;
	getProjectMonths();
	createValuationInfoTbl();
	createOverheardContributionTbl();
	createProjectKPITbl();
	createCompletionDatesTbl();
	createProgressTbl();
	createPredTurnoverTbl();
	createCostflowTbl();
	createKpiCatTbl();
	createMonthlyKPITbl();
	createsubConOrderVarTbl();
	createHSMonthlyAuditTbl();
	populateMonthlyKpiTbl();
	document.getElementById('weeksComp').innerHTML=weeksCompleted;
	document.getElementById('weeksCon').innerHTML=result.contractData.WeeksContracted;

	HSMonthlyAuditAvg();
	//Summary Section
	document.getElementById("valTurnover").innerHTML = "£ "+result.contractData.CumulativeValueGross;
	document.getElementById("valMargin").innerHTML = "£ "+result.contractData.CumulativeProfitGross;
	document.getElementById("valMTurnover").innerHTML = "£ "+ addCommas(result.contractData.MonthlyValue);
	document.getElementById("valMMargin").innerHTML = "£ "+result.contractData.MonthlyProfit;
	document.getElementById("forecastMTurnover").innerHTML = "£ "+addCommas(result.contractData.QtrTurnOverMonthForeCast);
	document.getElementById("forecastMMargin").innerHTML = "£ "+result.contractData.QtrProfMonthForeCast;
	calculateVariance(result.contractData.MonthlyValue, result.contractData.QtrTurnOverMonthForeCast, "monthlyVarianceTurnover");
	calculateVariance(result.contractData.MonthlyProfit, result.contractData.QtrProfMonthForeCast, "monthlyVarianceMargin");
	document.getElementById("qtrValueTurnover").innerHTML = "£ "+result.contractData.QtrTurnOverCumActual;
	document.getElementById("qtrValueMargin").innerHTML = "£ "+result.contractData.QtrProfCumActual;
	document.getElementById("qtrForecastTurnover").innerHTML = "£ "+result.contractData.QtrTurnOverCumForeCast;
	document.getElementById("qtrForecastMargin").innerHTML = "£ "+result.contractData.QtrProfCumForecast;
	calculateVariance(result.contractData.QtrTurnOverCumActual, result.contractData.QtrTurnOverCumForeCast, "qtrVarianceTurnover");
	calculateVariance(result.contractData.QtrProfCumActual, result.contractData.QtrProfCumForecast, "qtrVarianceMargin");
	
	document.getElementById("completedWeeks").innerHTML = weeksCompleted;
	document.getElementById("contractedWeeks").innerHTML = result.contractData.WeeksContracted;
	document.getElementById("timeCompleted").innerHTML = result.contractData.TimeCompleted;
	document.getElementById("remainingTime").innerHTML = result.contractData.TimeRemaining;
	document.getElementById("completedValue").innerHTML = result.contractData.ValueCompleted;
	document.getElementById("valueRemaining").innerHTML = result.contractData.ValueRemaining;
	//progress
	populateProgressTbl();
	//ProjectKPIs
	populateKpiTable();

	populateSummaryProjectKpiTbl();
	populateRecordOfLabourTbl();
	createTimeChart(timeChartSum);
	createValueChart(valueChartSum);
	createTimeChart(timeChart);
	createValueChart(valueChart);
	progressGraph(sumProgressGraph);
	progressGraph(mainProgressGraph);
	currentWeekRecordOfLabourGraph();
	recordOfLabourTotalsGraph();
	copyConsiderateContractorTbl();
	considerateContractorsGraph();
	materialsOrderedChart();
	materialsReasonChart();
	turnoverGraph();
	costflowGraph();
	totalCwdToDate();
	monthlyCwdToDate();
	subContractorOrderVariations();

	tblAccidentType();
	tblAccidentTrade();

	tradeAccidentGraph();
	typeAccidentGraph();

	createDaysLostTbl();
	createAccidentReportTbl();
	addAccidentReportRow('AccidentReportTbl');
	HSMonthlyAuditGraph();
	daysLostGraph();
}

function populateKpiTable(){
	document.getElementById("adherenceTgtPct").innerHTML = result.contractData.AdherenceTgtPct;
	document.getElementById("adherenceTgt").innerHTML = result.contractData.AdherenceTarget;
	document.getElementById("adherenceAct").innerHTML = result.contractData.AdherenceActual;
	percentageDifference(result.contractData.AdherenceActual,result.contractData.AdherenceTarget,"adherenceActPct");
	calculateVariance(document.getElementById("adherenceActPct").innerHTML,result.contractData.AdherenceTgtPct,"adherenceVarPct");
	calculateVariance(result.contractData.AdherenceActual, result.contractData.AdherenceTarget, "adherenceVar" );
	document.getElementById("monthlyCashflowTgtPct").innerHTML = result.contractData.MonthlyCashFlowPredTgtPct;
	document.getElementById("monthlyCashflowTgt").innerHTML = result.contractData.QtrTurnOverMonthForeCast;//same as forecastMTurnover
	document.getElementById("monthlyCashflowAct").innerHTML = result.contractData.MonthlyValue;//same as valMTurnover
	calculateVariance(result.contractData.MonthlyValue, result.contractData.QtrTurnOverMonthForeCast, "monthlyCashflowVar" );
	percentageDifference(result.contractData.MonthlyValue,result.contractData.QtrTurnOverMonthForeCast,"monthlyCashflowActPct")
	calculateVariance(document.getElementById("monthlyCashflowActPct").innerHTML, result.contractData.MonthlyCashFlowPredTgtPct, "monthlyCashflowVarPct" );
	document.getElementById("qtrCashflowTgtPct").innerHTML = result.contractData.QtrCashFlowPredTgtPct;
	document.getElementById("qtrCashflowTgt").innerHTML = result.contractData.QtrTurnOverCumForeCast;//same as forecastMTurnover
	document.getElementById("qtrCashflowAct").innerHTML = result.contractData.QtrTurnOverCumActual;//same as valMTurnover
	calculateVariance(result.contractData.QtrTurnOverCumActual, result.contractData.QtrTurnOverCumForeCast, "qtrCashflowVar" );
	percentageDifference(result.contractData.QtrTurnOverCumActual,result.contractData.QtrTurnOverCumForeCast,"qtrCashflowActPct")
	calculateVariance(document.getElementById("monthlyCashflowActPct").innerHTML, result.contractData.QtrCashFlowPredTgtPct, "qtrCashflowVarPct" );
	document.getElementById("nonRecWorksTgtPct").innerHTML = result.contractData.NonRecWorksTgtPct;
	document.getElementById("nonRecWorksActPct").innerHTML = ((result.contractData.NonRecWorksActPct)*100).toFixed(0);
	document.getElementById("nonRecWorksTgt").innerHTML = "0";
	document.getElementById("nonRecWorksAct").innerHTML = result.contractData.NonRecoverableWorks;
	calculateVariance(result.contractData.NonRecoverableWorks, document.getElementById("nonRecWorksTgt").innerHTML, "nonRecWorksVar" );
	calculateVariance(document.getElementById("nonRecWorksActPct").innerHTML, result.contractData.NonRecWorksTgtPct, "nonRecWorksVarPct" );
	document.getElementById('predOfProgramTgtPct').innerHTML='-';
	document.getElementById('predOfProgramActPct').innerHTML='-';
	document.getElementById('predOfProgramVarPct').innerHTML='-';
	document.getElementById("predOfProgramTgt").innerHTML = "100";
	document.getElementById("predOfProgramAct").innerHTML = result.contractData.PredOfProgrammeAct;
	calculateVariance(result.contractData.PredOfProgrammeAct,document.getElementById("predOfProgramTgt").innerHTML,  "predOfProgramVar" );
	document.getElementById("HSAuditTgtPct").innerHTML = result.contractData.HAuditScoreTgtPct;
	document.getElementById("HSAuditTgt").innerHTML = "-";
	document.getElementById("considerateConstructorTgt").innerHTML=35;
	document.getElementById("considerateConstructorTgtPct").innerHTML=(parseFloat(considerateConstructorTgt.innerHTML)/50)*100;
	document.getElementById("HSAccidentRateTgtPct").innerHTML = result.contractData.HSAccidentIncidentRateTgtPct;
	document.getElementById("HSAccidentRateActPct").innerHTML = result.contractData.HSAccidentIncidentRateActPct;
	calculateVariance(document.getElementById("HSAccidentRateActPct").innerHTML, document.getElementById("HSAccidentRateTgtPct").innerHTML, "HSAccidentRateVarPct");
	document.getElementById("HSAccidentRateVarPct").innerHTML=parseFloat(document.getElementById("HSAccidentRateVarPct").innerHTML)*100
	document.getElementById("pctRecycledTgtPct").innerHTML = result.contractData.PctRecycledWasteTgt;
	document.getElementById("pctRecycledActPct").innerHTML = result.contractData.PctRecycledWasteAct;
	calculateVariance(result.contractData.PctRecycledWasteAct,result.contractData.PctRecycledWasteTgt, "pctRecycledVarPct")
	document.getElementById("waste100kAct").innerHTML =document.getElementById("Wstper100kM3_"+projectMonths.length).innerHTML;
	document.getElementById("water100kAct").innerHTML =document.getElementById("waterM3Per100k_"+projectMonths.length).innerHTML;
	document.getElementById("energy100kAct").innerHTML = document.getElementById("emitFromEnergyKgCo2Per100k_"+projectMonths.length).innerHTML;
}

function populateSummaryProjectKpiTbl(){
	document.getElementById("adherence_Tgt").innerHTML=document.getElementById("adherenceTgtPct").innerHTML;
	document.getElementById("adherence_Act").innerHTML=document.getElementById("adherenceActPct").innerHTML;
	document.getElementById("adherence_Var").innerHTML=document.getElementById("adherenceVarPct").innerHTML;

	document.getElementById("monthlyCashflow_Tgt").innerHTML=document.getElementById("monthlyCashflowTgtPct").innerHTML;
	document.getElementById("monthlyCashflow_Act").innerHTML=document.getElementById("monthlyCashflowActPct").innerHTML;
	document.getElementById("monthlyCashflow_Var").innerHTML=document.getElementById("monthlyCashflowVarPct").innerHTML;

	document.getElementById("qtrCashflow_Tgt").innerHTML=document.getElementById("qtrCashflowTgtPct").innerHTML;
	document.getElementById("qtrCashflow_Act").innerHTML=document.getElementById("qtrCashflowActPct").innerHTML;
	document.getElementById("qtrCashflow_Var").innerHTML=document.getElementById("qtrCashflowVarPct").innerHTML;

	document.getElementById("nonRecWorks_Tgt").innerHTML=document.getElementById("nonRecWorksTgtPct").innerHTML;
	document.getElementById("nonRecWorks_Act").innerHTML=document.getElementById("nonRecWorksActPct").innerHTML;
	document.getElementById("nonRecWorks_Var").innerHTML=document.getElementById("nonRecWorksVarPct").innerHTML;

	document.getElementById("predOfProgram_Tgt").innerHTML=document.getElementById("predOfProgramTgt").innerHTML;
	document.getElementById("predOfProgram_Act").innerHTML=document.getElementById("predOfProgramAct").innerHTML;
	document.getElementById("predOfProgram_Var").innerHTML=document.getElementById("predOfProgramVar").innerHTML;

	document.getElementById("HSAudit_Tgt").innerHTML=document.getElementById("HSAuditTgtPct").innerHTML;
	document.getElementById("HSAudit_Act").innerHTML=document.getElementById("HSAuditActPct").innerHTML;
	document.getElementById("HSAudit_Var").innerHTML=document.getElementById("HSAuditVarPct").innerHTML;

	document.getElementById("HSAccidentRate_Tgt").innerHTML=document.getElementById("HSAccidentRateTgtPct").innerHTML;
	document.getElementById("HSAccidentRate_Act").innerHTML=document.getElementById("HSAccidentRateActPct").innerHTML;
	document.getElementById("HSAccidentRate_Var").innerHTML=document.getElementById("HSAccidentRateVarPct").innerHTML;

	document.getElementById("considerateConstructor_Tgt").innerHTML=document.getElementById("considerateConstructorTgt").innerHTML;
	document.getElementById("considerateConstructor_Act").innerHTML=document.getElementById("considerateConstructorAct").innerHTML;
	document.getElementById("considerateConstructor_Var").innerHTML=document.getElementById("considerateConstructorVar").innerHTML;

	document.getElementById("water100k_Tgt").innerHTML=document.getElementById("water100kTgt").innerHTML;
	document.getElementById("water100k_Act").innerHTML=document.getElementById("water100kAct").innerHTML;

	document.getElementById("energy100k_Tgt").innerHTML=document.getElementById("energy100kTgt").innerHTML;
	document.getElementById("energy100k_Act").innerHTML=document.getElementById("energy100kAct").innerHTML;

	document.getElementById("pctSkipWaste_Tgt").innerHTML=document.getElementById("pctRecycledTgtPct").innerHTML;
	document.getElementById("pctSkipWaste_Act").innerHTML=document.getElementById("pctRecycledActPct").innerHTML;
	document.getElementById("pctSkipWaste_Var").innerHTML=document.getElementById("pctRecycledVarPct").innerHTML;

	document.getElementById("waste100k_Tgt").innerHTML=document.getElementById("waste100kTgt").innerHTML;
	document.getElementById("waste100k_Act").innerHTML=document.getElementById("waste100kAct").innerHTML;
	document.getElementById("waste100k_Var").innerHTML=document.getElementById("waste100kVar").innerHTML;
}

function populateProgressTbl(){
	document.getElementById("progressApr15").innerHTML = result.progress.Apr15;
	document.getElementById("progressMay15").innerHTML = result.progress.May15;
	document.getElementById("progressJun15").innerHTML = result.progress.Jun15;
	document.getElementById("progressJul15").innerHTML = result.progress.Jul15;
	document.getElementById("progressAug15").innerHTML = result.progress.Aug15;
	document.getElementById("progressSep15").innerHTML = result.progress.Sep15;
	document.getElementById("progressOct15").innerHTML = result.progress.Oct15;
	document.getElementById("progressNov15").innerHTML = result.progress.Nov15;
	document.getElementById("progressDec15").innerHTML = result.progress.Dec15;
	document.getElementById("progressJan16").innerHTML = result.progress.Jan16;
	document.getElementById("progressFeb16").innerHTML = result.progress.Feb16;
	document.getElementById("progressMar16").innerHTML = result.progress.Mar16;
	document.getElementById("progressApr16").innerHTML = result.progress.Apr16;
	document.getElementById("progressMay16").innerHTML = result.progress.May16;
	document.getElementById("progressJun16").innerHTML = result.progress.Jun16;
	document.getElementById("progressJul16").innerHTML = result.progress.Jul16;
	document.getElementById("progressAug16").innerHTML = result.progress.Aug16;
	document.getElementById("progressSep16").innerHTML = result.progress.Sep16;
	document.getElementById("progressOct16").innerHTML = result.progress.Oct16;
	document.getElementById("progressNov16").innerHTML = result.progress.Nov16;
	document.getElementById("progressDec16").innerHTML = result.progress.Dec16;
	document.getElementById("progressJan17").innerHTML = result.progress.Jan17;
	document.getElementById("progressFeb17").innerHTML = result.progress.Feb17;
	document.getElementById("progressMar17").innerHTML = result.progress.Mar17;
}

function calculateVariance(fig1, fig2, targetField){
	var difference = parseFloat(fig1.replace(/,/g, '')) - parseFloat(fig2.replace(/,/g, ''));
	var numericVariance = addCommas(difference)
	moreThanZero(document.getElementById(targetField).innerHTML = numericVariance, targetField);
}

function percentageDifference(actualFig, targetFig, percentageField){
	var actualDifference = ((Number(actualFig)/Number(targetFig))*100).toFixed(0);
	document.getElementById(percentageField).innerHTML=actualDifference; 
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
//summary section

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

function createValuationInfoTbl(){
	var valInfoTable="<table class='striped'>";
	valInfoTable+="<thead><tr class='centered'><th></th><th>Turnover</th><th>Margin</th></thead>";
	var valInfoRowIds=["val","valM","forecastM","monthlyVariance","qtrValue","qtrForecast","qtrVariance"];
	var valInfoRows=["Valuation to Date","Value in Month", "Forecast for Month", "Variance","Value in Quarter","Forecast for Quarter","Variance"];
	for(var i=0; i<valInfoRows.length;i++){
		valInfoTable+="<tr>"
		for(var j=0;j<3;j++){
			switch(j){
				case 0:
					valInfoTable+="<th>"+valInfoRows[i]+"</th>";
				case 1:
					valInfoTable+="<td id='"+valInfoRowIds[i]+"Turnover'</td>";
				case 2:
					valInfoTable+="<td id='"+valInfoRowIds[i]+"Margin'</td>";
			}
		}
		valInfoTable+="</tr>";
	}
	valInfoTable+="</tbody></table>";
	document.getElementById("ValueInformationTbl").innerHTML=valInfoTable;
}

function createOverheardContributionTbl(){
	var overheadTbl="<table class='striped responsive'><thead><tr class='centered'><th></th>";
		overheadTbl+="<th>Gross</th>";
		overheadTbl+="<th>Movement</th>";;
		overheadTbl+="</tr></thead><tbody>"
	var overheadData = result.contractData;
	var tblRows=["SubContractors", "Materials", "Consultants", "Stats", "Preliminaries", "Others", "OHP", "Total"];
	for (var i=0; i<tblRows.length; i++){
		var grossValue = "Gross"+tblRows[i];
		var movementValue = "Movement"+tblRows[i]; 
		overheadTbl+="<tr><th>"+tblRows[i]+"</th>";
		overheadTbl+="<td id='"+tblRows[i]+"Gross'>"+overheadContribution[grossValue]+"</td>";
		overheadTbl+="<td id='"+tblRows[i]+"Movement'>"+overheadContribution[movementValue]+"</td></tr>";
	}
	overheadTbl+="</tbody></table>";
	document.getElementById("SummaryofOverheadContributionTbl").innerHTML = overheadTbl;
}

function createProjectKPITbl(){
	var projectKpiTblLoc = document.getElementById('projectKPISummary');
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
	var completionDateTbl="<table><thead><tr>";
	completionDateTbl+="<th></th>";
	completionDateTbl+="<th>Day</th>";
	completionDateTbl+="<th>Month</th>";
	completionDateTbl+="<th>Year</th>";
	completionDateTbl+="</thead><tbody>";
	for(var i=0; i<2; i++){
		if(i==0){
			var row="Contractual";
		}
		else{
			var row="Estimate";
		}
		var abbreviation=row.substring(0,3)+"Comp";
		completionDateTbl+="<tr><td>"+row+"</td>";
		completionDateTbl+="<td id="+abbreviation+"Day></td>";
		completionDateTbl+="<td id="+abbreviation+"Mth></td>";
		completionDateTbl+="<td id="+abbreviation+"Yr></td></tr>";
	}
	completionDateTbl+="</tbody></table>";
	document.getElementById("completionTable").innerHTML=completionDateTbl;
	document.getElementById("ConCompDay").innerHTML = result.contractData.ConCompDay;
	document.getElementById("ConCompMth").innerHTML = result.contractData.ConCompMth;
	document.getElementById("ConCompYr").innerHTML = result.contractData.ConComYr;
	document.getElementById("EstCompDay").innerHTML = result.contractData.EstCompDay;
	document.getElementById("EstCompMth").innerHTML = result.contractData.EstCompMth;
	document.getElementById("EstCompYr").innerHTML = result.contractData.EstCompYr;
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

function costflowGraph(){
	var costFlowData = tableToArray(document.getElementById('costflowTbl'));
	var costFlowGraphData=[];
	var lengthValue = 0;
	var propertyKeys=[];
	for(var a in costFlowData){
		let costFlowDate = getProgressDate(costFlowData[a][0]);
		costFlowGraphData.push({x:costFlowDate,val1:costFlowData[a][1],val2:costFlowData[a][2],val3:costFlowData[a][3]});
	}
	Morris.Area({
		element: costflowGph,
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
function monthlyCwdToDate(){
	monthlyCwdData = tableToArray(document.getElementById('cwdMonthly'));
	monthlyCwdGraphData = [];
	for(var subbie in monthlyCwdData){
		monthlyCwdGraphData.push({value:monthlyCwdData[subbie][1], label:monthlyCwdData[subbie][0]});
	}
	Morris.Donut({
	  element: 'monthlyCwdGraph',
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
	  element: 'replacementReasonGraph',
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


//HS Graph Section
function tradeAccidentGraph(){
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
	  element: 'accidentTradeGraph',
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
	  element: 'accidentTypeGraph',
	  data: accidentTypeGraphData,
	  resize:true,
	  formatter: function (value, data) { return (parseFloat(value)/count *100).toFixed(0) + '%';}
	});
}

function HSMonthlyAuditGraph(){
	var auditData = tableToArray(document.getElementById('monthlyAuditTbl'));
	var auditGraphData=[]
	for(var prop in auditData){
		if(auditData[prop][1]!='undefined'){
			auditGraphData.push({x:auditData[prop][0], a:auditData[prop][1], b:80});
		}	
	}
	Morris.Area({
		element: 'HSAudit',
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

function daysLostGraph(){
	daysLostData = tableToArray(document.getElementById('daysLostTbl'));
	daysLostGraphData=[];
	for(var prop in daysLostData){
		daysLostGraphData.push({dateYear:daysLostData[prop][0],riddor7days: daysLostData[prop][1],nonRiddorLostTime06Days: daysLostData[prop][2]});
	}
	Morris.Bar({
		element: 'accidentalDays',
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

function createTimeChart(chartLocation){
	var completedTime = document.getElementById('timeCompleted').innerHTML;
	var timeRemaining = document.getElementById('remainingTime').innerHTML;
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
		var bodyRow = document.createElement("tr");
		for(var j=0; j<8;j++){
			var bodyCell = document.createElement("td")
			switch(j){
				case 0:
					var bodyRowText = document.createTextNode(tblRows[i]);
					bodyCell.appendChild(bodyRowText);
					break;
				case 1: 
					bodyCell.setAttribute('id',tblRowId[i]+'TgtPct');
					break;
				case 2: bodyCell.setAttribute('id',tblRowId[i]+'ActPct');break;
				case 3: bodyCell.setAttribute('id',tblRowId[i]+'VarPct');break;
				case 5: bodyCell.setAttribute('id',tblRowId[i]+'Tgt');break;
				case 6: bodyCell.setAttribute('id',tblRowId[i]+'Act');break;
				case 7: bodyCell.setAttribute('id',tblRowId[i]+'Var');break;
			}
			bodyCell.setAttribute('class','center-align');
			bodyRow.appendChild(bodyCell);
		}
		kpiBody.appendChild(bodyRow);
	}
	kpiHTMLtable.appendChild(kpiBody);
	tblLocation.appendChild(kpiHTMLtable);	
}

function createMonthlyKPITbl(){
	var monthlyKPI="<table class='striped highlight' id='monthlyKpiTbl'><thead><tr class='centered'><th>Month</th>";
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

function populateMonthlyKpiTbl(){
	var table = document.getElementById("monthlyKpiTbl");
	table.tBodies[0].innerHTML="";
	var queueTblBodyRow = document.getElementsByTagName("tbody");
	var kpiData=result.projectKPI;
	for(var Prop in kpiData){
		var tblBodyRow=document.createElement("tr");
		for(var innerProp in kpiData[Prop]){
			
			if(innerProp!='ContractNumber'){
				var tblBodyCell = document.createElement("td");
				tblBodyCellId=innerProp+"_"+Prop;
				tblBodyCell.setAttribute('id',tblBodyCellId);
				tblBodyCell.setAttribute('class','center-align');
				var cellText = document.createTextNode(kpiData[Prop][innerProp]);
				tblBodyCell.appendChild(cellText);
				tblBodyRow.appendChild(tblBodyCell);
			}
		}
		table.tBodies[0].appendChild(tblBodyRow);
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
//Progress Data Section
function createRecordOfLabourTable(){
	var tableCode = "<table class='striped' id='recOfLbr'><thead>"
	tableCode += "<tr><th class='center-align'>Week</th>"
	tableCode += "<th class='center-align'>Mon</th>"
	tableCode += "<th class='center-align'>Tues</th>"
	tableCode += "<th class='center-align'>Wed</th>"
	tableCode += "<th class='center-align'>Thurs</th>"
	tableCode += "<th class='center-align'>Fri</th>"
	tableCode += "<th class='center-align'>Sat</th>"
	tableCode += "<th class='center-align'>Sun</th>"
	tableCode += "<th class='center-align'>Total</th></thead><tbody>"
	for(var i=1;i<=weeksCompleted; i++){
		tableCode+="<tr><th>"+i+"</th>";
		tableCode+="<td></td>";
		tableCode+="<td></td>";
		tableCode+="<td></td>";
		tableCode+="<td></td>";
		tableCode+="<td></td>";
		tableCode+="<td></td>";
		tableCode+="<td></td>";
		tableCode+="<td></td></tr>";
	}
	tableCode+="</tbody></table>"
	document.getElementById("recordOfLabourContent").innerHTML=tableCode;
}

function createProgressTbl(){
	var progressTable="<table class='striped'><thead><tr><th>Month</th><th>Progress</th></tr></thead><tbody>";
	for (var i=0; i<projectMonths.length; i++){
		if(projectMonths[i]!= "___rowNum__"){
			progressTable+="<tr><td>"+projectMonths[i]+"</td><td id='progress"+projectMonths[i]+"'></td></tr>";
		}
	}
	progressTable+="</body></table>";
	document.getElementById("progressTbl").innerHTML=progressTable;
}

//Financial Data Section - Structure
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

//Financial Data Section
function createPredTurnoverTbl(){
	var predTurnoverTbl="<h5>Predictability (Turnover)</h5><table class='striped'><thead><tr><th>Month</th><th>Original Cum T.O</th><th>Current Cum T.O</th><th>Actual Cum T.O</th></tr></thead><tbody>";
	for (var i=0; i<projectMonths.length; i++){
		if(projectMonths[i]!= "___rowNum__"){
			predTurnoverTbl+="<tr><td>"+projectMonths[i]+"</td>";
			predTurnoverTbl+="<td id='originalCumTO"+projectMonths[i]+"'> £ "+addCommas(result.financialData[2][projectMonths[i]])+"</td>";
			predTurnoverTbl+="<td id='currentCumTO"+projectMonths[i]+"'> £ "+addCommas(result.financialData[0][projectMonths[i]])+"</td>";
			predTurnoverTbl+="<td id='actualCumTO"+projectMonths[i]+"'> £ "+addCommas(result.financialData[1][projectMonths[i]])+"</td></tr>";
		}
	}
	predTurnoverTbl+="</body></table>";
	document.getElementById("predTurnover").innerHTML=predTurnoverTbl;
}

function createCostflowTbl(){
	var CostflowTbl="<h5>Costflow</h5><table id='costflowTbl'class='striped'><thead><tr><th>Month</th>";
	CostflowTbl+="<th>Cum Certified Cash</th>";
	CostflowTbl+="<th>Current Cum T.O</th>";
	CostflowTbl+="<th>Actual Cum T.O</th>";
	CostflowTbl+="</tr></thead><tbody>";
	for (var i=0; i<projectMonths.length; i++){
		if(projectMonths[i]!= "___rowNum__"){
			CostflowTbl+="<tr><td>"+projectMonths[i]+"</td>";
			CostflowTbl+="<td id='cumCertCash"+projectMonths[i]+"'>"+result.financialData[0][projectMonths[i]]+"</td>";
			var cumTgtCostflow=(result.financialData[0][projectMonths[i]]*(1-0.1)).toFixed(0);
			CostflowTbl+="<td id='cumTargetCostflow"+projectMonths[i]+"'>"+cumTgtCostflow+"</td>";
			CostflowTbl+="<td id='actualCumCostflow"+projectMonths[i]+"'>"+result.financialData[3][projectMonths[i]]+"</td></tr>";
		}
	}
	CostflowTbl+="</body></table>";
	document.getElementById("costflow").innerHTML=CostflowTbl;
}

//Subcontractor Financial Data Section
function createSubContractorSection(location){
	var sectionLocation = document.getElementById(location);
	var section= createDiv('subContractorContainer','row');
	var subContractorDiv = createDataCard('col s12 l12', 'subContractor', 'subConOrderVariations', 'Subcontractor Orders and Variations');
	section.appendChild(subContractorDiv);
	sectionLocation.appendChild(section);
}

//Subcontractor Financial Data Section			
function createsubConOrderVarTbl(){
	var subConOrderVar = "<table class='striped' id='subbieOrders'><thead><tr>";
	subConOrderVar += "<th>Trade</th>";
	subConOrderVar += "<th>Sub-Contract Nett order Value</th>";
	subConOrderVar += "<th>Design Development</th>";
	subConOrderVar += "<th>Package</th>";
	subConOrderVar += "<th>Site</th>";
	subConOrderVar += "<th>Recoverable Variations</th>";
	subConOrderVar += "</tr></thead><tbody>";
	var tblLength = result.SubConFinData.length;
	for (var i=0; i<tblLength; i++){
		subConOrderVar +="<tr>";
		subConOrderVar +="<td id='trade"+i+"'>"+result.SubConFinData[i].SubContractorName+"</td>";
		subConOrderVar +="<td id='subConNettOrderVal"+i+"'>£ "+addCommas(result.SubConFinData[i].SubContractNettOrderValue)+"</td>";
		subConOrderVar +="<td id='designDev"+i+"'>£ "+addCommas(result.SubConFinData[i].DesignDevelopment)+"</td>";
		subConOrderVar +="<td id='package"+i+"'>£ "+addCommas(result.SubConFinData[i].Package)+"</td>";
		subConOrderVar +="<td id='site"+i+"'>£ "+addCommas(result.SubConFinData[i].Site)+"</td>";
		subConOrderVar +="<td id='recVar"+i+"'>£ "+addCommas(result.SubConFinData[i].RecoverableVariations)+"</td>";					
	}
	subConOrderVar+="</tr></tbody></table>"
	document.getElementById("subConOrderVariations").innerHTML=subConOrderVar;
}


//HS Data Section

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

function createHSMonthlyAuditTbl(){
	var HSAudit="<table id='monthlyAuditTbl' class='striped'><thead><tr class='centered'><th>Month</th>";
	HSAudit+="<th>%</th>"
	HSAudit+="<th>Score</th></tr></thead><tbody>"
	for(var i=0;i<projectMonths.length;i++){
		if(projectMonths[i]!="___rowNum__"){
			var currentMonth = projectMonths[i];
			HSAudit+="<tr><td>"+currentMonth+"</td>";
			HSAudit+="<td id='"+currentMonth+"pct'>"+result.HSData[1][currentMonth]+"</td>";
			HSAudit+="<td id='"+currentMonth+"Score'>"+result.HSData[0][currentMonth]+"</td></tr>";
		}
	}
	HSAudit+="</tbody></table>";
	document.getElementById("HSMonthlyAudit").innerHTML=HSAudit;
}

function HSMonthlyAuditAvg(){
	var HSsum=0;
	var numberOfMonths=0;
	for(var i=0;i<projectMonths.length;i++){
		if(projectMonths[i]!="___rowNum__"){
			var currentMonth = projectMonths[i];
			if(currentMonth.includes("17")==true){
				if(result.HSData[0][currentMonth]!=undefined){
					HSsum+=parseInt(result.HSData[0][currentMonth]);
					numberOfMonths+=1;
				}else{
					HSsum+=0;
				}
			}
		}
	}
	document.getElementById("HSAuditAct").innerHTML = (HSsum/numberOfMonths).toFixed(0);
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
	var tblLocation = document.getElementById('daysLost');
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
	DaysLostTable.appendChild(headerRow);

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


//HS Data Section
function tblAccidentType(){
	var accidentTypeTblLoc=document.getElementById('tblAccidentType');
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

function tblAccidentTrade(){
	var accidentTradeTblLoc=document.getElementById('tblAccidentTrade');
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

