// This function returns a list of items contained in the reference searchable textbox item as an LSV (line-separated value) string. If the searchable textbox has no items, an empty string will be returned
function getSearchableTextboxItemsAsLSV(stbRef) {
	// error checks
	if (!stbRef && stbRef.tagName != "INPUT") {
		console.log("Can't get items from searchable textbox, searchable textbox reference is null or not actually a list.");
		return;
	}

	// retrieve items from list & store them in the LSV string
	let lsvItemString = "";

	// get a reference to the searchable textbox item list
	const stbItemList = document.getElementById(stbRef.backingListID).querySelectorAll("option");

	for (let i = 0; i < stbItemList.length; i++) {
		lsvItemString += (stbItemList[i].textContent);
		if (i < stbItemList.length - 1) {
			lsvItemString += "\n";
		}
	}

	return lsvItemString;
}


// this function sets items in a searchable textbox from an LSV (line-separated value) string
function setSearchableTextboxItemsFromLSVStr(stbBoxRef, lsvStr) {
	// error checks
	if (!stbBoxRef || stbBoxRef.tagName != "INPUT") {
		console.log("Can't get items from searchable textbox, control reference is null or not actually a list.");
		return;
	}

	// parse LSV items and set them in the list
	if (lsvStr) {

		// parse items (from each line) and add them to the list
		// -get reference to item list for convenience
		const itemList = document.getElementById(stbBoxRef.backingListID).querySelectorAll("option");

		// 1. Arrange items (lines of text) into an array
		const lsvItemArray = lsvStr.split(/\r?\n/).filter(line => line.trim() !== '');

		// 2. Check if items need to be added or removed
		if (itemList.length > lsvItemArray.length) {
			// remove items from the end of the list
			for (let i = 0; i < itemList.length - lsvItemArray.length; i++) {
				document.getElementById(stbBoxRef.backingListID).list.lastElementChild.remove();
			}

		} else if (itemList.length < lsvItemArray) {
			// add items to the end of the list
			for (let i = 0; i < itemList.length - lsvItemArray.length; i++) {
				document.getElementById(stbBoxRef.backingListID).appendChild(new Option(lsvItemArray[i]));
			}			
		}

		// apply list values
		for (let i = 0; i < lsvItemArray.length; i++) {
			if (!itemList[i]) {
				document.getElementById(stbBoxRef.backingListID).appendChild(new Option(lsvItemArray[i]));
			} else {
				itemList[i].textContent = lsvItemArray[i];
			}
		}

	} else {
		// string is blank; clear out all items
		// -check if the list is null - if it is, no need to do anything
		if (document.getElementById(stbBoxRef.backingListID) != null) {
			document.getElementById(stbBoxRef.backingListID).innerHTML = "";
		}
	}
}


// event handlers to enable the filtering

// filters visible options based on the user's text input. 
// *Apply to the 'input' and 'focus' events of the control's textbox
function filterOptionsOnUserInput(stbBoxRef) {
    const search = stbBoxRef.value.toLowerCase();
    const listRef = document.getElementById(stbBoxRef.backingListID);
    let visibleCount = 0;

    for (const li of listRef.children) {
        const matches = li.textContent
            .toLowerCase()
            .startsWith(search);

        li.hidden = !matches;

        if (matches) {
            visibleCount++;
        }
    }

    // set a property in the control
    stbBoxRef.doMatchesExist = (visibleCount > 0).toString();
	console.log("RESULT: " + stbBoxRef.doMatchesExist);

console.log("Search:", JSON.stringify(search));
console.log("Matches:", visibleCount);
//console.log("Dropdown:", document.getElementById(stbBoxRef.dropdownDivID))

    if ((visibleCount > 0 || stbBoxRef.doMatchesExist == "true")) {

	// clear the flag to allow the dropdown's position to update
        stbBoxRef.isDropdownPositioned = "false";

	// manually open the dropdown
	document.getElementById(stbBoxRef.dropdownDivID).style.display = "block";
        openDropdown(
		document.getElementById(stbBoxRef.backingListID),
		document.getElementById(stbBoxRef.dropdownDivID)
	);
    } else {
	console.log("Closed via path 1");
        closeDropdown(document.getElementById(stbBoxRef.dropdownDivID), stbBoxRef);
    }
}

// handles opening the dropdown
// *Apply to the 'mousedown' event of the control's textbox
function openDropdown(dropdownDivRef, stbRef) {

    console.log("Opening dropdown for control " + stbRef.id);

    positionDropdown(dropdownDivRef, stbRef);
    dropdownDivRef.style.display = "block";
}

// handles closing the dropdown
function closeDropdown(dropdownDivRef, stbRef) {
    dropdownDivRef.style.display = "none";
}

// selects the item the user clicked
// *Apply to the 'mousedown' event of the control's list (display inside the div)
function stb_SelectItem(stbBoxRef, selectedItem) {
    // close the dropdown
    closeDropdown(document.getElementById(stbBoxRef.dropdownDivID), stbBoxRef);
    // populate the clicked value into the textbox
    stbBoxRef.value = selectedItem;
}

// handles positioning the dropdown div
function positionDropdown(dropdownDivRef, stbRef) {
    // check if dropdownRef has already been positioned (to avoid repeated updates which could cause positioning errors)
    if (stbRef.isDropdownPositioned == "false") {
	// get positioning rect of parent to base the dropdown div around
    	const rect = stbRef.getBoundingClientRect();

	// set the dropdown div ref)
    	dropdownDivRef.style.position = "fixed";
    	dropdownDivRef.style.left = `${rect.left}px`;
    	dropdownDivRef.style.top = `${(rect.top + rect.height).toFixed(1)}px`;
    	dropdownDivRef.style.width = `${rect.width}px`;

	// update the flag to avoid repeated unnecessary positioning changes
    	stbRef.isDropdownPositioned = "true";
    }
}


// misc functions

// This function exports the javascript code needed to provide the functionality of this control
// *This function should be run when exporting the page code, to get the code necessary to run the page. Event handler-binding code should be included in the page's startup script
function exportSearchableTextboxJSCode() {
	var stbJSCode = "";

	stbJSCode += filterOptionsOnUserInput.toString() + "\n";
	stbJSCode += stb_SelectItem.toString() + "\n";
	stbJSCode += openDropdown.toString() + "\n";
	stbJSCode += closeDropdown.toString() + "\n";
	stbJSCode += positionDropdown.toString();
}