// This function returns a list of items contained in the reference searchable textbox item as an LSV (line-separated value) string. If the searchable textbox has no items, an empty string will be returned
function getSearchableTextboxItemsAsLSV(stbRef) {
	// error checks
	if (!stbRef && stbRef.tagName != "INPUT") {
		console.log("Can't get items from searchable textbox, searchable textbox reference is null or not actually a list.");
		return;
	}

	// retrieve items from list & store them in the LSV string
	let lsvItemString = "";

	if (document.getElementById(stbRef.getAttribute('backingListID')) != null) {
	// get a reference to the searchable textbox item list
	const stbItemList = document.getElementById(stbRef.getAttribute('backingListID')).querySelectorAll("option");

	for (let i = 0; i < stbItemList.length; i++) {
		lsvItemString += (stbItemList[i].textContent);
		if (i < stbItemList.length - 1) {
			lsvItemString += "\n";
		}
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
		const itemList = document.getElementById(stbBoxRef.getAttribute('backingListID')).querySelectorAll("option");

		// 1. Arrange items (lines of text) into an array
		const lsvItemArray = lsvStr.split(/\r?\n/).filter(line => line.trim() !== '');

		// 2. Check if items need to be added or removed
		if (itemList.length > lsvItemArray.length) {
			// remove items from the end of the list
			for (let i = 0; i < itemList.length - lsvItemArray.length; i++) {
				document.getElementById(stbBoxRef.getAttribute('backingListID')).lastElementChild.remove();
			}

		} else if (itemList.length < lsvItemArray) {
			// add items to the end of the list
			for (let i = 0; i < itemList.length - lsvItemArray.length; i++) {
				document.getElementById(stbBoxRef.getAttribute('backingListID')).appendChild(new Option(lsvItemArray[i]));
			}			
		}

		// apply list values
		for (let i = 0; i < lsvItemArray.length; i++) {
			if (!itemList[i]) {
				document.getElementById(stbBoxRef.getAttribute('backingListID')).appendChild(new Option(lsvItemArray[i]));
			} else {
				itemList[i].textContent = lsvItemArray[i];
			}
		}

	} else {
		// string is blank; clear out all items
		// -check if the list is null - if it is, no need to do anything
		if (document.getElementById(stbBoxRef.getAttribute('backingListID')) != null) {
			document.getElementById(stbBoxRef.getAttribute('backingListID')).innerHTML = "";
		}
	}
}


// event handlers to enable the filtering

// filters visible options based on the user's text input. 
// *Apply to the 'input' and 'focus' events of the control's textbox
function filterOptionsOnUserInput(stbBoxRef) {
    const search = stbBoxRef.value.toLowerCase();
    const listRef = document.getElementById(stbBoxRef.getAttribute('backingListID'));
    let visibleCount = 0;

    for (const li of listRef.children) {

        const matches = li.textContent
	    .trim()
            .toLowerCase()
            .startsWith(search);

        li.hidden = !matches;

        if (matches) {
            visibleCount++;
        }
    }

    // set a property in the control
    stbBoxRef.doMatchesExist = (visibleCount > 0).toString();
//console.log("RESULT: " + stbBoxRef.doMatchesExist);
//console.log("Search:", JSON.stringify(search));
//console.log("Matches:", visibleCount);
//console.log("Dropdown:", document.getElementById(stbBoxRef.dropdownDivID))

    console.log("MATCHES: " + visibleCount);

    if ((visibleCount > 0 || stbBoxRef.doMatchesExist == "true")) {

	console.log("SHOWING RESULT");

	// clear the flag to allow the dropdown's position to update
        stbBoxRef.isDropdownPositioned = "false";

	// manually open the dropdown
	document.getElementById(stbBoxRef.getAttribute('dropdownDivID')).style.display = "block";
        openDropdown(
		document.getElementById(stbBoxRef.getAttribute('backingListID')),
		document.getElementById(stbBoxRef.getAttribute('dropdownDivID'))
	);
    } else {
	console.log("Closed via path 1");
        closeDropdown(document.getElementById(stbBoxRef.getAttribute('dropdownDivID')), stbBoxRef);
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
    closeDropdown(document.getElementById(stbBoxRef.getAttribute('dropdownDivID')), stbBoxRef);
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



// this function binds event handlers to a searchable dropdown textbox, referenced by the 'control' parameter
function bindSDTBEvents(control) {
	// error checks
	if (control == null || control.dataset.controlType != "Searchable Dropdown List") {
		console.log("Can't bind event handler to control; reference is null or not type 'searchable dropdown list'");
		return;
	}

	// initialize the flag to 'false' to ensure the dropdown gets positioned properly on first click
	control.isDropdownPositioned = "false";

	// get control references
	const searchableItemList = document.getElementById(control.getAttribute('backingListID'));
	const dropdownContainerDiv = document.getElementById(control.getAttribute('dropdownDivID'));

	// bind event handlers to the textbox (control)
	control.addEventListener("input", () => { filterOptionsOnUserInput(document.getElementById(control.id)); });
	control.addEventListener("focus", () => { filterOptionsOnUserInput(document.getElementById(control.id)); });

	// closes the dropdown (should fire if the user no longer has selected the combobox
	control.addEventListener("blur", () => { 
		closeDropdown(document.getElementById(dropdownContainerDiv.id), document.getElementById(control.id));
	});
		
	control.addEventListener("mousedown", () => { openDropdown(document.getElementById(dropdownContainerDiv.id), document.getElementById(control.id)); });

	// close the dropdown when scrolling (to avoid visual bugs)
	window.addEventListener("scroll", () => { 
	closeDropdown(document.getElementById(dropdownContainerDiv.id), document.getElementById(control.id));
});

	// reposition the dropdown after scrolling (to ensure correct placement)
	window.addEventListener("scrollend", () => {
		control.isDropdownPositioned = "false";
		positionDropdown(document.getElementById(dropdownContainerDiv.id), document.getElementById(control.id));
});

	// bind event handlers to the list
	searchableItemList.addEventListener("mousedown", event => { stb_SelectItem(document.getElementById(control.id), event.target.textContent); } );

	// position dropdown
	positionDropdown(document.getElementById(dropdownContainerDiv.id), document.getElementById(control.id));
}

// this function binds searchable dropdown textbox event handler code (necessary for control operation) to all SDTB elements in the page
function bindSDTBEventsToPageControl() {
	const stbElems = document.querySelectorAll(
	'[data-control-type="Searchable Dropdown List"]'
	);

	for (let i = 0; i < stbElems.length; i++) { 
		bindSDTBEvents(stbElems[i]);
	}
}

// misc functions

// this function exports the javascript code necessary to bind event handlers to controls that require javascript for necessary functionality. It's meant to be placed inside the 'on page load' event handler
function exportSDTEHBindingJSCode() {
	return getFunctionBodyAsString(bindSDTBEventsToPageControl);
/*
	return `const stbElems = document.querySelectorAll(
	'[data-control-type="Searchable Dropdown List"]'
	);

	for (let i = 0; i < stbElems.length; i++) { 
		bindSDTBEvents(stbElems[i]);
}
`;
*/

}

// This function exports the javascript code needed to provide the functionality of this control
// *This function should be run when exporting the page code, to get the code necessary to run the page. Event handler-binding code should be included in the page's startup script
function exportSearchableTextboxJSCode() {
	var stbJSCode = "";

	stbJSCode += filterOptionsOnUserInput.toString() + "\n";
	stbJSCode += stb_SelectItem.toString() + "\n";
	stbJSCode += openDropdown.toString() + "\n";
	stbJSCode += closeDropdown.toString() + "\n";
	stbJSCode += positionDropdown.toString() + "\n";
	stbJSCode += bindSDTBEvents.toString() + "\n";

	return stbJSCode;
}