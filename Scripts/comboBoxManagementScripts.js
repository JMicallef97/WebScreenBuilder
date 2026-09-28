// This function returns a list of items contained in the reference combobox item as an LSV (line-separated value) string. If the combobox has no items, an empty string will be returned
function getDropdownItemsAsLSV(comboBoxRef) {
	// error checks
	if (!comboBoxRef && (comboBoxRef.tagName != "SELECT" && comboBoxRef.tagName != "TEXT")) {
		console.log("Can't get items from combobox, combobox reference is null or not actually a list.");
		return;
	}

	// retrieve items from list & store them in the LSV string
	let lsvItemString = "";
	let comboBoxItemList = [];

	// check if the item is a combobox or a searchable textbox
	if (comboBoxRef.tagName == "SELECT") {
		comboBoxItemList = comboBoxRef.querySelectorAll("option");
	} else if (comboBoxRef.tagName == "TEXT") {
		comboBoxItemList = comboBoxRef.list.querySelectorAll("option");
	}

	for (let i = 0; i < comboBoxItemList.length; i++) {
		lsvItemString += (comboBoxItemList[i].textContent);
		if (i < comboBoxItemList.length - 1) {
			lsvItemString += "\n";
		}
	}

	return lsvItemString;
}

// this function sets items in a combobox from an LSV (line-separated value) string
function setDropdownItemsFromLSVStr(comboBoxRef, lsvStr) {

	console.log("TODO; IMPLEMENT SEARCHABLE DROPDOWN ITEM SETTING");

	// error checks
	if (!comboBoxRef || comboBoxRef.tagName != "SELECT") {
		console.log("Can't get items from combobox, combobox reference is null or not actually a list.");
		return;
	}

	// parse LSV items and set them in the list
	if (lsvStr) {

		// parse items (from each line) and add them to the list
		// -get reference to item list for convenience
		const itemList = comboBoxRef.querySelectorAll("option");

		// 1. Arrange items (lines of text) into an array
		const lsvItemArray = lsvStr.split(/\r?\n/).filter(line => line.trim() !== '');

		// 2. Check if items need to be added or removed
		if (itemList.length > lsvItemArray.length) {
			// remove items from the end of the list
			for (let i = 0; i < itemList.length - lsvItemArray.length; i++) {
				comboBoxRef.lastElementChild.remove();
			}

		} else if (itemList.length < lsvItemArray) {
			// add items to the end of the list
			for (let i = 0; i < itemList.length - lsvItemArray.length; i++) {
				let newItem = document.createElement("option");
				newItem.textContent = "placeHolder";
				comboBoxRef.appendChild(newItem);
			}			
		}

		// apply list values
		for (let i = 0; i < lsvItemArray.length; i++) {
			if (!itemList[i]) {
				let newItem = document.createElement("option");
				newItem.textContent = lsvItemArray[i];
				comboBoxRef.appendChild(newItem);
			} else {
				itemList[i].textContent = lsvItemArray[i];
			}
		}

	} else {
		// string is blank; clear out all items
		comboBoxRef.innerHTML = "";
	}
}