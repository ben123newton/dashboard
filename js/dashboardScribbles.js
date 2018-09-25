//Unknown NUmber of rows but can be more than 50

recordOfLabour

Progress
MonthlyData

TotalCWDs
MonthCWDs


PredictabilityTurnover
CostFlow

SubcontractorOrdersAndVariations

MonthlyAudit
AccidentReport
DaysLost

//Fixed number of Rows
ContractNumber

ValueInformation
SummaryOfOverheadContributions

ProjectKPIs
TimeValue
ConsiderateConstructors

MaterialControls
Trade
Type
EnforcementActionNotices
MajorComplianceAuditScores


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
			var tblBodyRow = document.createElement('tr');
			for(var k=0; k<headerLength; k++){
				var tblBodyRowCell;
				var tblBodyRowCellText;
				var fieldID="_1_1_2_"+j+tblRows[k];
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
	}	
	monthlyKpiTbl.appendChild(tblBody);
	monthlyKpiTblLoc.appendChild(monthlyKpiTbl);
}



function populateMonthlyKpiTbl(){
	
	var rowNum = result.projectKPI.length;
	var rowLength = rowIds.length;
	var kpiData=result.projectKPI;
	for(var Prop in kpiData){
		if(Prop<50){
			var rowIds=['_6_1','_8_1', '_10_1', '_12_1', '_14_1', '_244_1', '_16_1', '', '_18_1','_20_1','_22_1','_24_1'];
			var rowIndex=0;
			for(var innerProp in kpiData[Prop]){
				var TblBodyCellId=innerProp+"_"+Prop;
				if(innerProp!='ContractNumber'){
					document.getElementById(TblBodyCellId).innerHTML = kpiData[Prop][innerProp];
					if(innerProp=='Wstper100kM3'||innerProp=='emitFromEnergyKgCo2Per100k'||innerProp=='waterM3Per100k'){
						switch(innerProp){
							case 'Wstper100kM3':
								targetComparison(document.getElementById('waste100kTgt').innerHTML,document.getElementById(TblBodyCellId).innerHTML = kpiData[Prop][innerProp], TblBodyCellId);
								break;
							case 'emitFromEnergyKgCo2Per100k':
								targetComparison(document.getElementById('energy100kTgt').innerHTML,document.getElementById(TblBodyCellId).innerHTML = kpiData[Prop][innerProp], TblBodyCellId);
								break;
							case 'waterM3Per100k':
								targetComparison(document.getElementById('water100kTgt').innerHTML,document.getElementById(TblBodyCellId).innerHTML = kpiData[Prop][innerProp], TblBodyCellId);
								break;
						}
						
					}
				}
			}
		}




	}
}