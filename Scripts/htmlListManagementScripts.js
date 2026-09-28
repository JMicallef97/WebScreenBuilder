// This function adds an item to an unordered list
function addItemToList(listRef, newItem) {
	// error checks
	if (!listRef && (listRef.tagName != "OL" && listRef.tagName != "UL")) {
		console.log("Can't add item to list, list reference is null or not actually a list.");
		return;
	}
	if (!newItem) {
		console.log("Can't add item to list, item is blank or empty.");
		return;
	}
	
	// add an item to the list
	const newListItem = document.createElement("li");
	newListItem.textContent = newItem;
	listRef.append(newListItem);
}

// This function returns a list of items contained in the reference list item (either an ordered or unordered list) as an LSV (line-separated value) string. If the list has no items, an empty string will be returned
function getListItemsAsLSV(listRef) {
	// error checks
	if (!listRef && (listRef.tagName != "OL" && listRef.tagName != "UL")) {
		console.log("Can't get items from list, list reference is null or not actually a list.");
		return;
	}

	// retrieve items from list & store them in the LSV string
	let lsvItemString = "";

	for (let i = 0; i < listRef.querySelectorAll("li").length; i++) {
		lsvItemString += (listRef.querySelectorAll("li")[i].textContent);
		if (i < listRef.querySelectorAll("li").length - 1) {
			lsvItemString += "\n";
		}
	}

	return lsvItemString;
}

// this function sets items in a list from an LSV (line-separated value) string
function setListItemsFromLSVStr(listRef, lsvStr) {
	// error checks
	if (!listRef && (listRef.tagName != "OL" && listRef.tagName != "UL")) {
		console.log("Can't set items in list from an LSV, list reference is null or not actually a list.");
		return;
	}

	// parse LSV items and set them in the list
	if (lsvStr) {
		// parse items (from each line) and add them to the list
		// -get reference to item list for convenience
		const itemList = listRef.querySelectorAll("li");

		// 1. Arrange items (lines of text) into an array
		const lsvItemArray = lsvStr.split(/\r?\n/).filter(line => line.trim() !== '');

		// 2. Check if items need to be added or removed
		if (itemList.length > lsvItemArray.length) {
			// remove items from the end of the list
			for (let i = 0; i < itemList.length - lsvItemArray.length; i++) {
				listRef.lastElementChild.remove();
			}

		} else if (itemList.length < lsvItemArray) {
			// add items to the end of the list
			for (let i = 0; i < itemList.length - lsvItemArray.length; i++) {
				let newItem = document.createElement("li");
				newItem.textContent = "placeHolder";
				listRef.appendChild(newItem);
			}			
		}

		// apply list values
		for (let i = 0; i < lsvItemArray.length; i++) {
			if (!itemList[i]) {
				let newItem = document.createElement("li");
				newItem.textContent = lsvItemArray[i];
				listRef.appendChild(newItem);
			} else {
				itemList[i].textContent = lsvItemArray[i];
			}
		}

	} else {
		// string is blank; clear out all items
		listRef.innerHTML = "";
	}
}