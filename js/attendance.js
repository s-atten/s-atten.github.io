var barchart;
var piechart;
var attendata = [9, 15, 8, 2017, 12, 15, 9, 2017, 1, 15, 10, 2017, 14, 15, 11, 2017, 3, 15, 12, 2017, 12, 15, 1, 2018, 9, 16, 2, 2018, 7, 15, 3, 2018, 9, 15, 4, 2018, 12, 15, 5, 2018, 1, 15, 6, 2018, 14, 15, 7, 2018, 3, 15, 8, 2018, 12, 15, 9, 2018, 9, 12, 10, 2018, 34, 36, 13, 2018]
var options = {
	chart:{
		color: '#B0BEC5',
		altcolor: '#ECEFF1',
		backgroundColor: '#FFFFFF',
		pieAccent: '#2196f3'
	}
}

// Drawing Part, expects a array, each element of which contains a week's attendance records added up
function dateFromWeekNumber(year, week) {
  var d = new Date(year, 0, 1);
  var dayNum = d.getDay();
  var diff = --week * 7;
  var retstr;

  // If 1 Jan is Friday to Sunday, go to next week
  if (!dayNum || dayNum > 4) {
    diff += 7;
  }

  // Add required number of days
  d.setDate(d.getDate() - d.getDay() + ++diff);
  retstr = d.getDate() + '/' + (d.getMonth()+1) + '/' +(d.getYear()+1900);
  retstr += ' - ';
  var numberOfWeekdays = 6;
  d.setDate(d.getDate() + numberOfWeekdays);
  retstr += d.getDate() + '/' + (d.getMonth()+1) + '/' +(d.getYear()+1900)
  return retstr;
}

function getCurrentWeekNo(){
  var _date = new Date;
  var d = new Date(Date.UTC(_date.getFullYear(), _date.getMonth(), _date.getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};

function getCurrentYear() {
	return (new Date()).getFullYear();
}

function flattenArray(array) {
	var ret = [];
	for(var i = 0; i<array.length; ++i)
		for(var j=0; j<array[i].length; ++j)
			ret.push(array[i][j]);
	return ret;
}

function restructureArray(array) {
	if(array.length%4 != 0)
		return false;

	var ret = [];
	for(var i=0; i<array.length; i+=4){
		var temp = [];
		for(var j=0; j<=3; ++j){
			temp.push(array[i+j]);
		}
		ret.push(temp);
	}
	return ret;
}

function formatData(array) {
	var prep = [], temp, pres;
	var obj = {
		labels: [],
		present: [],
		absent: []
	};

	for(var i = 0; i<array.length; ++i) {
		obj.labels.push(dateFromWeekNumber(array[i][3], array[i][2]));
		obj.present.push(array[i][0]);
		obj.absent.push(array[i][1] - array[i][0]);
	}

	return obj;
}

function drawChart (dataObj) {
	var target = document.getElementById('columnchart');
	var dataObj = formatData(dataObj);
	console.log(dataObj);
	if(barchart!=null){
        barchart.destroy();
    }
	barchart = new Chart(target, {
		type: 'bar',
	    data: {
	        labels: dataObj.labels,
	        datasets: [{
	            label: 'Present',
	            stack: 'Stack 0',
	            data: dataObj.present,
	            backgroundColor: options.chart.color,
	        }, {
	        	label: 'Absent',
	        	stack: 'Stack 0',
	        	data: dataObj.absent,
	        	backgroundColor: options.chart.altcolor,
	        }]
	    },
	    options: {
	    	maintainAspectRatio: false,
	    	legend: {
	    		display: false
	    	},
	        title: {
				display: false
			},
			tooltips: {
				mode: 'index',
				intersect: false
			},
			responsive: true,
			scales: {
				xAxes: [{
					display: false,
					stacked: true,
					categoryPercentage: 1.0,
            		barPercentage: 1.0
				}],
				yAxes: [{
					display: false,
					stacked: true
				}]
			}
	    }
	})
}

function drawPiChart (dual) {
	var target = document.getElementById('pachart');
	if(piechart!=null){
        piechart.destroy();
    }
	piechart = new Chart(target, {
			type: 'pie',
			data: {
				datasets: [{
					data: [
						dual[0], dual[1] - dual[0]
					],
					backgroundColor: [
						'#2196f3', options.altcolor
					],
					label: 'Dataset 1'
				}],
				labels: [
					'Present',
					'Absent'
				]
			},
			options: {
				legend: {
					display: false
				},
				responsive: true,
				maintainAspectRatio: false
			}
		});
}

function drawLineChart(x, y) {
	document.getElementById('lineChartBack').style.width = '100%';
	document.getElementById('lineChartTop').style.width = '' + ((x/y)*100) + '%';
	document.getElementById('lineChartTop').textContent = '' + precisionRound(((x/y)*100), 2) + '%'
	return true;
}

function storeAttendance(userID, attArray) {
	var qr = db.collection('users').doc(currentUser.uid);
	qr.set({
		attendanceArray : flattenArray(attArray)
	}).then(function(){
		console.log('Write Successful!');
	}).catch(function(error){
		showError('Cannot reach network. Try again later');
		console.log(error);
	});
}

function updateAttendance(pres, total, atArray) {
	var arr = restructureArray(userData.attendanceArray);
	var weekNo = getCurrentWeekNo();
	var year = getCurrentYear();
	if(atArray.length != 0 && arr[arr.length-1][2] == weekNo && arr[arr.length-1][3] == year) {
		arr[arr.length-1][0] += pres;
		arr[arr.length-1][1] += total;
	} else {
		var temp = [];
		temp.push(pres);
		temp.push(total);
		temp.push(weekNo);
		temp.push(year);
		arr.push(temp);
	}
	storeAttendance(currentUser.uid, arr);
	return arr[arr.length - 1];
}

function getTotalAttendance(atArray) {
	var pres = 0, total = 0;
	for(var i=0; i<atArray.length; ++i) {
		pres += atArray[i][0];
		total += atArray[i][1];
	}
	var ret = [];
	ret.push(pres);
	ret.push(total);
	return ret;
}

function getPercentage(dualArray) {
	return (dualArray[0]/dualArray[1]) * 100;
}

function getLastEnteredAttendance(atArray) {
	return atArray[atArray.length - 1];
}

function getThisWeekAtten (atArray) {
	var week = getCurrentWeekNo();
	var yr = getCurrentYear();
	var ret = [];
	if(atArray[atArray.length - 1][2] == week && atArray[atArray.length - 1][3] == yr){
		ret.push(atArray[atArray.length - 1][0]);
		ret.push(atArray[atArray.length - 1][1]);
		return ret;
	}
	return false;
}

function calcDTG(p, t, target, max){
	var steps = 100 | max;
	var i = 0, flag = false, temp, ret = [];
	while(i<steps) {
		temp = (p + i)/(t + i);
		if(temp >= target){
			ret.push(i); ret.push(temp);
			return ret;
		}
		++i;
	}
	return false;
}

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}


/* Default behaviour: If the text value is greater than the slider's value
** use the text value. Else, if the slider value == text value, use slider value
** If total is zero, don't bother updating attendance. It'll save a write.
*/
document.getElementById('submit-button').onclick = function() {
	var total = parseInt(document.getElementById('att-tc-textfield').value);
	var present = parseInt(document.getElementById('att-atc-textfield').value);

	if((total >= present)&&(total != 0)){
		updateAttendance(present, total, userData.attendanceArray);
		Modal.mhide();
		return true;
	} else {
		return false;
	}
	
}

document.getElementById('cancel-button').onclick = function() {
	Modal.mhide();
}

function initListener(){

	var qr = firebase.firestore().collection('users').doc(currentUser.uid);
	qr.onSnapshot(function(doc){
		if(doc.exists){
			userData = doc.data()
			console.log('Data refreshed by listener')
			initUI()
		} else {
			qr.set({
				attendanceArray: []
			}).then(function(){
				console.log('Written UID::attendanceArray[]');
			})
		}
	})
}

function initUI(){

	//check for new user w/o data
	if(userData == null) {
		showNewUserUI();
		return true;
	}

	//shouldn't happen, but if for some reason auth missed creating array, create a temp one
	//till atleast storeAttendance bulldozes (overwrites) it
	if(userData.attendanceArray == undefined){
		userData.attendanceArray = [];
	}

	if(userData.attendanceArray.length == 0){
		showNewUserUI();
		return true;
	}
	
	//Initiaing data structs*/
	var atten = restructureArray(userData.attendanceArray);
	var total = getTotalAttendance(atten);
	var percent = getPercentage(total);
	var dtg = calcDTG(total[0], total[1], 0.75, 200);
	var thisWeek = getThisWeekAtten(atten);

	var percentObj = {};

	percentObj['percent'] = precisionRound(percent, 2) + '%';
	if(percent < 60) {
		percentObj['state'] = 'Hang on, you\'ll get there';
		percentObj['col'] = 'att-state-red';
	} else if(percent < 75) {
		percentObj['state'] = 'Almost there';
		percentObj['col'] = 'att-state-yellow';
	} else {
		percentObj['state'] = 'In the clear!';
		percentObj['col'] = 'att-state-green';
	}

	document.getElementById('atten-state').textContent = percentObj['state'];
	document.getElementById('atten-percent-text').textContent = percentObj['percent'];
	document.getElementById('atten-state').classList = 'mdc-typography--button';
	document.getElementById('atten-percent-text').classList = '';
	document.getElementById('atten-state').classList.add(percentObj['col']);
	document.getElementById('atten-percent-text').classList.add(percentObj['col']);

	if(percent >= 75)
		document.getElementById('atten-dtg').textContent = 'You have more than 75% attendance. Keep it up!';
	else if(dtg == false)
		document.getElementById('atten-dtg').textContent = 'You need to attend classes for more than 200 classes to get 75% attendance';
	else
		document.getElementById('atten-dtg').textContent = 'You need to attend classes for atleast ' + dtg[0] + ' classes to get 75% attendance';

	// Draw Charts
	drawChart(atten);
	drawPiChart(total);

	//Create This Week info
	if(thisWeek == false) {
		drawLineChart(0,1);
	} else {
		document.getElementById('tw-classes').textContent = 'Attended ' + thisWeek[0] + ' of ' + thisWeek[1] + ' classes'; 
		drawLineChart(thisWeek[0], thisWeek[1]);
	}

	//Create History List
	console.log(atten);
	for(var i = 0; i<atten.length; ++i){
		createAndAddHistoryElement(atten[atten.length - i - 1]);
	}
}

function createAndAddHistoryElement(details) {
	_percentage = (details[0] / details[1]) * 100;

	var parent = document.createElement('span');
	parent.classList.add('history-item');

	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.classList.add('history-piechart');
	svg.setAttribute('viewBox', '0 0 32 32');


	var svgNS = svg.namespaceURI;

	var bCircle = document.createElementNS(svgNS,'circle');
	bCircle.setAttribute('r', '16');
	bCircle.setAttribute('cx', '16');
	bCircle.setAttribute('cy', '16');
	bCircle.classList.add('history-piechart--background');
	svg.appendChild(bCircle);

	var fCircle = document.createElementNS(svgNS,'circle');
	fCircle.setAttribute('r', '16');
	fCircle.setAttribute('cx', '16');
	fCircle.setAttribute('cy', '16');
	fCircle.classList.add('history-piechart--foreground');
	fCircle.style.strokeDasharray = _percentage + ' 100';
	svg.appendChild(fCircle);

	parent.appendChild(svg);


	var text = document.createElement('span');
	text.textContent = dateFromWeekNumber(details[3], details[2]) + ': Attended ' + details[1] + ' of ' + details[2] + ' classes' ;
	parent.appendChild(text);


	document.getElementById('History').appendChild(parent);
}

function showNewUserUI() {
	drawChart(restructureArray([1,1,1,1]));
	drawPiChart([0,1]);
	drawLineChart(0,1);
	document.getElementById('atten-state').textContent = 'Hello!';
	document.getElementById('atten-percent-text').textContent = '--%';
	document.getElementById('atten-state').classList = 'mdc-typography--button';
	document.getElementById('atten-percent-text').classList = '';
	document.getElementById('atten-state').classList.add('att-state-green');
	document.getElementById('atten-percent-text').classList.add('att-state-green');
	document.getElementById('atten-dtg').textContent = 'Add your first attendance by pressing +';
	document.getElementById('tw-classes').textContent = 'No classes yet';
}