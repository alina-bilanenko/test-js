var fileReader = new FileReader;
var fileTest = document.getElementById('file_test');
var divTable = document.getElementById('table');
var myError = document.getElementById('myError');
var filterInput = document.getElementById('filter');
var paging = document.getElementById('paging');
var pageList = document.getElementById('pageList');


fileTest.addEventListener('change', function(event){
	var fileJson;
	myError.innerText = "";
	divTable.innerHTML = "";

	if(event.target.files.length){
		fileJson = event.target.files[0];
		fileReader.readAsText(fileJson);
	}
});

fileReader.onload = function(event) {
	var data;
	var tableHeader = "";
	var tableContent = "";
	var html = "";
	var tableHeaderLength = 0;
	var dataJson = event.target.result;

	try {
		data = JSON.parse(dataJson);
	}
	catch(error) {
		myError.innerText = "Ошибка данных файла!";
		return;
	}

	tableHeader = data.data[0];
	tableContent = data.data.slice(1);
	html += "<tr>";

	for(var key in tableHeader){
		html += "<th>" + tableHeader[key] + "</th>";
		tableHeaderLength++;
	}

	html += "<th>Действия</th>";
	html += "</tr>";

	for(var i = 0; i<tableContent.length; i++){
		html += "<tr>";

		for(var j=0; j<tableHeaderLength; j++){
			html += "<td>" + tableContent[i][j] + "</td>"; 
		}

		html += '<td><span class="plus"><i class="fas fa-plus"></i></span><span class="pensil-alt"><i class="fas fa-pencil-alt"></i></span><span class="times"><i class="fas fa-times"></i></span></td>';
		html += "</tr>"; 
	}

	divTable.innerHTML = "<table id = 'ourTable' class = 'table'>" + html + "</table>";
	var table = document.getElementById("ourTable");

	//обрабатываем клики
	table.onclick = function(event){
		var nameButton = "";
		var activeRow = "";
		var target = event.target;

		//sort
		if (target.tagName == 'TH' && target.cellIndex != table.rows[0].cells.length - 1) {
			var elems = document.getElementsByClassName("th-sorted");
			Array.prototype.forEach.call(elems, function(elem) {
				elem.classList.remove("th-sorted");
			});
			target.classList.add("th-sorted");
			sortTable(table, target.cellIndex);
			return;
		}

		//CRUD
		while(target != table){

			if (target.tagName == 'TR') {
				activeRow = target;
				break;
			}
			if (target.tagName === 'SPAN') {
				nameButton = target;
			}
			target = target.parentElement;
		}
		actions(nameButton, activeRow);
	}

	document.getElementById("paging").value = tableContent.length; 
	buildPages(tableContent.length);
};

fileReader.onerror = function(event) {
	myError.innerText = "Ошибка чтения файла!";
};

function actions(nameButton, activeRow){
	var table = document.getElementById("ourTable");
	var numberRow = activeRow.rowIndex; 

	switch(nameButton.className){
			//добавить строку
		case "plus":
			var newRow = table.insertRow(numberRow+1);
			var newCell;
			for(var i=1; i<=table.rows[0].cells.length; i++){
				newCell = document.createElement('td');
				newRow.appendChild(newCell);
				if (i == table.rows[0].cells.length){
					newCell.innerHTML = '<span class="plus"><i class="fas fa-plus"></i></span><span class="pensil-alt"><i class="fas fa-pencil-alt"></i></span><span class="times"><i class="fas fa-times"></i></span>';
				}
			}
			break;
			//редактировать строку
		case  "pensil-alt":
			if(activeRow.hasAttribute("contenteditable")){
				activeRow.removeAttribute("contenteditable");
			} else{
				activeRow.setAttribute("contenteditable", "true");
			}
			break;
			//удалить строку
		case "times":
			table.deleteRow(numberRow);
			break;
	} 		
}


function sortTable(table, index){
	var arrayTable = new Array();
	var tr = table.getElementsByTagName("tr");
	for(var i=0; i<tr.length; i++){
		var td = tr.item(i).getElementsByTagName("td");
		arrayTable[i] = new Array();
		for(var j=0; j<td.length-1; j++)
		{
			arrayTable[i][j] = td.item(j).innerText;
		}
	}

	var newArrayForSort = arrayTable.slice(1);

	newArrayForSort.sort(function(a, b){
		if(!isNaN(a[index]) && !isNaN(b[index])){
			return a[index] - b[index];	
		} else{
			return (a[index].toString().toLocaleLowerCase() > b[index].toString().toLocaleLowerCase()) ? 1 : -1;
		}
	});

	var trNew = table.getElementsByTagName("tr");
	for(var i=0; i<newArrayForSort.length; i++){

		var tdNew = trNew.item(i + 1).getElementsByTagName("td");
		for(var j=0; j<td.length - 1; j++) {
			tdNew.item(j).innerText = newArrayForSort[i][j];
		}
	}

	filterTable(document.getElementById("filter").value);
}

filterInput.addEventListener("change", function(event){
	filterTable(event.target.value);
});

function filterTable(filterString){
	var table = document.getElementById("ourTable");

	if(!table) return;

	var tr = table.getElementsByTagName("tr");

	for(var i=1; i<tr.length; i++){
		var td = tr.item(i).getElementsByTagName("td");
		var findFilter = false;

		for(var j=0; j<td.length-1; j++)
		{
			if(td.item(j).innerText.indexOf(filterString) == -1){
				findFilter = false;
			} else{
				findFilter = true;
				break;
			}
		}

		if(findFilter){
			tr.item(i).classList.remove("hidden");
		}else{
			tr.item(i).classList.add("hidden");
		}
	}

	buildPages(document.getElementById('paging').value);
}

paging.addEventListener("change", function(event){
	var dataPaging = event.target.value;
	//if(isNaN(dataPaging) || dataPaging < 1) return;
	buildPages(dataPaging);	
});

pageList.addEventListener("click", function(event){
	if(event.target.tagName != "SPAN") return;
	var page = event.target.innerText;
	selectPage(page);
});

function buildPages(dataPaging){
	var table = document.getElementById("ourTable");
	var numberRows = 0;
	var numberPages = 1;

	pageList.innerHTML = "";

	if(!table) return;

	numberRows = document.querySelectorAll("tr:not(.hidden)").length -1; 
	if(!dataPaging || dataPaging < 1 || isNaN(dataPaging)) dataPaging = numberRows;
	numberPages = Math.ceil(numberRows/dataPaging);

	for(var i=1; i<=numberPages; i++){
		pageList.innerHTML += "<span class='page-buttons'>" + i + "</span>";
	}

	selectPage(1);
}

function selectPage(page){
	var table = document.getElementById("ourTable");
	if(!table) return;

	var numberRows = document.querySelectorAll("tr:not(.hidden)"); 
	var numberRowsLength = numberRows.length;
	var dataInput = document.getElementById('paging').value;
	if(!dataInput || dataInput < 1 || isNaN(dataInput)) dataInput = numberRows;

	for(var i=1; i< numberRowsLength; i++){

		if(i <= page*dataInput-dataInput || i>page*dataInput){
			numberRows.item(i).classList.add("hidden-row-page");
		} else {
			numberRows.item(i).classList.remove("hidden-row-page");
		}
	}

	var allPages = document.querySelectorAll("#pageList span");
	Array.prototype.forEach.call(allPages, function(elem) {
		if(elem.innerText == page) {
			elem.classList.add("highlight-page");
		} else {
			elem.classList.remove("highlight-page");
		}		

	});
}
