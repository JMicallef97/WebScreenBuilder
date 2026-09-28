// updates the number of columns or rows in a table (specified as 'rows' or 'columns' provided to the 'updateDimensionName' parameter, respectively) by the absolute value of what is provided for newCount.
function updateTableDimension(tableControlRef, newCount, updateDimensionName) {
	// error checks
	if (!tableControlRef) {
		console.log("Can't update table dimensions, table reference is null");
		return;
	}
	if (!Number.isInteger(newCount)) {
		console.log("Can't update table dimensions, new dimension value is not an integer.");
	}

	let newDimensionSizeAbs = Math.abs(newCount);
	
	switch (updateDimensionName) {
		case "columns":
			// check if column count (of row 1) is larger or smaller than requested amount
			if (newDimensionSizeAbs > tableControlRef.rows[0].cells.length) {
				// add cell(s) to each row
				for (let c = 0; c < Math.abs(newCount - tableControlRef.rows[0].cells.length); c++) {
					addColumnToTable(tableControlRef);	
				}
			} else if (newDimensionSizeAbs < tableControlRef.rows[0].cells.length) {
				// remove cells
				for (let c = tableControlRef.rows[0].cells.length; c > Math.abs(newCount - tableControlRef.rows[0].cells.length); c--) {
					// remove columns
					removeColumnFromTable(tableControlRef);
				}
			}
			// otherwise is fine
			break;

		case "rows":
			// check if row count is larger or smaller than requested amount
			if (newDimensionSizeAbs > tableControlRef.rows.length) {
				// add rows to table
				for (let c = 0; c < Math.abs(newCount - tableControlRef.rows.length); c++) {
					addRowToTable(tableControlRef);	
				}
			} else if (newDimensionSizeAbs < tableControlRef.rows.length) {
				// remove cells
				for (let c = tableControlRef.rows.length; c > Math.abs(newCount - tableControlRef.rows.length); c--) {
					// remove row
					removeRowFromTable(tableControlRef);
				}
			}
			// otherwise is fine			

			break;
	
		default:
		   	console.log("Can't update table dimensions, dimension name is invalid.");
		   	break;
	}
}



// this function adds a row to the table referenced by tableControlRef, handling ID assignment to make table management easier
function addRowToTable(tableControlRef) {
	// error checks
	if (!tableControlRef || !tableControlRef.tagName === "TABLE") {
		console.log("Can't add row to table, table reference is null or referenced element isn't a table.");
		return;
	}

	// add a row to the table
	tableControlRef.insertRow();

	// add cells to match the existing row count (of row 0)
	for (let r = 0; r < tableControlRef.rows[0].cells.length; r++) {
		let newCell = tableControlRef.rows[tableControlRef.rows.length - 1].insertCell();

		// apply default styling to make the cell visible
		applyNewTableCellProperties(newCell);
	}

	// since the table elements were modified, iterate through the other rows in the table to update the IDs to match the index
	updateTableRowAndCellIndices(tableControlRef);
}



// this function adds a column to the table referenced by tableControlRef at the index specified by columnIndex, handling ID assignment to make table management easier. If columnIndex is Infinity, the row is added to the end of the table
function addColumnToTable(tableControlRef, columnIndex = Infinity) {
	// error checks
	if (!tableControlRef || !tableControlRef.tagName === "TABLE") {
		console.log("Can't add column to table, table reference is null or referenced element isn't a table.");
		return;
	}

	// adjust columnIndex to the end of the table row if it is infinity
	if (columnIndex == Infinity) {
		columnIndex = Math.max(tableControlRef.rows.length - 1, 0);
	}

	if (columnIndex < 0) {
		console.log("Can't add column to table, column index " + columnIndex + " is out of bounds for the table.");
		return;
	}

	// check if table has at least 1 row (since at least 1 row is needed to add a column)
	if (tableControlRef.rows.length == 0) {
		// need to add 1 row before a column can be added
		addRowToTable(tableControlRef);
	}

	// add a cell to all rows (thus creating a column)
	for (let r = 0; r < tableControlRef.rows.length; r++) {
		let newCell = tableControlRef.rows[r].insertCell(columnIndex);

		// apply default styling to make the cell visible
		applyNewTableCellProperties(newCell);
	}

	// since the table elements were modified, iterate through the other rows in the table to update the IDs to match the index
	updateTableRowAndCellIndices(tableControlRef);
}



// this function remove a column from the table referenced by tableControlRef at the index specified by columnIndex, handling ID assignment to make table management easier. If columnIndex is Infinity, the last row is deleted (default behavior)
function removeColumnFromTable(tableControlRef, columnIndex = Infinity) {
	// error checks
	if (!tableControlRef || !tableControlRef.tagName === "TABLE") {
		console.log("Can't remove column from table, table reference is null or referenced element isn't a table.");
		return;
	}

	// adjust columnIndex to work with the rest of the function
	if (columnIndex == Infinity) {
		columnIndex = -1;
	}

	// check if the column to delete is outside the bounds
	if (columnIndex >= tableControlRef.rows.length) {
		console.log("Can't remove column from table, column index " + columnIndex + " is out of bounds for the table.");
		return;
	}

	// check if table has at least 1 row (since at least 1 row is needed to add a column)
	if (tableControlRef.rows.length == 0) {
		// no columns to delete, so return
		return;
	}

	// remove a cell from the end of each row (thus removing a column)
	for (let r = 0; r < tableControlRef.rows.length; r++) {
		tableControlRef.rows[r].deleteCell(columnIndex);
	}

	// since the table elements were modified, iterate through the other rows in the table to update the IDs to match the index
	updateTableRowAndCellIndices(tableControlRef);
}



// this function remove a row from the table referenced by tableControlRef at the index specified by rowIndex, handling ID assignment to make table management easier. If rowIndex is Infinity, the last row is deleted (default behavior)
function removeRowFromTable(tableControlRef, rowIndex = Infinity) {
	// error checks
	if (!tableControlRef || !tableControlRef.tagName === "TABLE") {
		console.log("Can't remove row from table, table reference is null or referenced element isn't a table.");
		return;
	}

	// adjust rowIndex to work with the rest of the function
	if (rowIndex == Infinity) {
		rowIndex = -1;
	}

	// check if the row to delete is outside the bounds
	if (rowIndex >= tableControlRef.rows.length) {
		console.log("Can't remove row from table, row index " + rowIndex + " is out of bounds for the table.");
		return;
	}

	// check if table has at least 1 row
	if (tableControlRef.rows.length == 0) {
		// no rows to delete, so return
		return;
	}

	// remove a row from the table
	tableControlRef.deleteRow(rowIndex);

	// since the table elements were modified, iterate through the other rows in the table to update the IDs to match the index
	updateTableRowAndCellIndices(tableControlRef);
}



// updates the ID values of the cells and rows of a table (referenced by the 'tableControlRef' parameter)
function updateTableRowAndCellIndices(tableControlRef) {
	// error checks
	if (!tableControlRef || !tableControlRef.tagName === "TABLE") {
		console.log("Can't update table element ids, table reference is null or referenced element isn't a table.");
		return;
	}

	// iterate through the other rows in the table, updating the IDs to match the index
	let rowCounter = 0;
	let rowCellCounter = 0;

	for (let r = 0; r < tableControlRef.rows.length; r++) {
		tableControlRef.rows[r].id = "tr" + r;

		// reset rowCellCounter to ensure starting at correct index
		rowCellCounter = 0;

		for (let c = 0; c < tableControlRef.rows[r].cells.length; c++) {
			tableControlRef.rows[r].cells[c].id = 
				tableControlRef.rows[r].id + "c" + c;
		}
	}
}

// This function applies default styling & properties to newly created table cells
function applyNewTableCellProperties(tableCellRef) {
	if (!tableCellRef || tableCellRef.tagName != "TD") {
		console.log("Can't apply default styling to table cell, table cell reference is null or referenced element isn't a table cell.");
		return;
	}

	// apply default styling
	tableCellRef.style.border = "1px solid black";

	// apply properties identifying the cell as a clickable control (as a container)
	tableCellRef.classList.add("created-control");
	tableCellRef.dataset.controlType = "tableCell";	

	console.log("TODO; APPLY SETTINGS TO MAKE CELLS SELECTABLE AS CONTAINERS");
}