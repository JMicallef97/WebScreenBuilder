function handleControlPointerDown(
    event
) {

    const control =
        event.target.closest(
            ".created-control"
        );

    if (!control) {
        return;
    }


    if (control.id === "controlCanvas") {
        return;
    }

    selectControl(
        control,
        control.dataset.controlType
    );
}


/*
         * Called when a control type is clicked.
         *
         * The controlType parameter contains the control type
         * specified in controlInfoDoc.json.
         */
        function controlTypeClicked(controlType) {
            console.log("Control type clicked:", controlType);

            /*
             * Example behavior:
             * Update the properties panel with information
             * about the selected control.
             */
            const propertiesContent =
                document.getElementById("propertiesContent");

            propertiesContent.textContent =
                "Selected control: " + controlType;

            /*
             * Application-specific behavior can be added here.
             */
        }

    /*
     * Called when a control is selected from the toolbar.
     */
    function controlTypeClicked(controlType) {

        console.log(
            "Control type clicked:",
            controlType
        );

        updateVisibleProperties(controlType);
    }

function controlTypeClicked(controlType) {

    if (document.getElementById(controlType + " Toolbar Creation Button").dataset.isCustomControl == "false") {
    	createControl(
        	controlType,
		selectedContainer
    	);
    } else {
	console.log("CREATE CUSTOM CONTROL");
	insertCustomElement(controlType, selectedContainer);
    }
}

function containerClicked(container, event) {
    /*
     * Don't select a container when the click originated
     * from an existing control inside it.
     */
    if (event.target !== container) {
        return;
    }

    event.stopPropagation();

    selectContainer(container);
}


function onKeyPress(event) {
	if (event.key == "Delete") {
		onDeleteKeyPress(event);
	} else if (event.key == "Escape") {
		onEscapeKeyPress(event);
	}
}

function onEscapeKeyPress(event) {
    // check if the user is in the process of moving a control to another container (the escape key cancels it)
    if (isControlContainerBeingAdjusted) {
	// cancel the process
	// 1. Reset fields
	isControlContainerBeingAdjusted = false;
	movingContainerControl = null;

	// 2. Reset the action label to clear instructions, since the process is no longer active
	resetInstructionLabel();
    }

    // exit if the escape key wasn't pressed, or no control is selected (as escape's purpose is to deselect the currently selected control)
    if (event.key !== "Escape" || !selectedControl) {
        return;
    }

    /*
     * Prevent the browser's default 'escape key pressed' behavior.
     */
    event.preventDefault();
    event.stopPropagation();

    // deselect the currently selected control
    deselectControl();
}

// 
function onDeleteKeyPress(event) {
    if (event.key !== "Delete") {
        return;
    }

    // run the event
    deleteControl();
}

function handlePropertyEditorEvent(event) {

    // check if the 'suppress' flag is set to true
    if (suppressPropertyUpdate) {
	suppressPropertyUpdate = false;
	return;
    }

    if (!selectedControl) {
        return;
    }

    /*
     * Find the property editor associated
     * with the element that generated the event.
     */
    let editor =
        event.target.closest(
            ".property-editor"
        );

    /*
     * If this is a unit selector, find its
     * containing number-property-editor.
     */
    if (
        !editor &&
        event.target.classList.contains(
            "property-unit-editor"
        )
    ) {

        editor =
            event.target.closest(
                ".number-property-editor"
            );
    }


    /*
     * If the event came from a number-property
     * wrapper, use the wrapper.
     */
    if (event.target.closest(".number-property-editor")) {
        editor =
            event.target.closest(
                ".number-property-editor"
            );
    }

    if (!editor) {
        return;
    }

    const propertyName =
        editor.dataset.property;

    // check if the 'property enabled' checkbox is not set (property disabled)
    if (!document.getElementById(propertyName + "ApplyCB").checked) {
	// skip applying the update since the setting is disabled
	return;
    }

    const value =
        getPropertyEditorValue(
            editor
        );

    if (value === "") {
        return;
    }

    applyPropertyToControl(
        selectedControl,
        propertyName,
        value
    );
}

function handleElementIdentityChange(
    event
) {
    if (!selectedControl) {
        return;
    }

    switch (event.target.id) {
        case "elementName":
            if (event.target.value === "") {
                selectedControl.removeAttribute(
                    "name"
            );

            } else {
		selectedControl.setAttribute("name", event.target.value);
            }

            break;


        case "elementId":
	    // check if the element ID is a duplicate
	    if (document.getElementById(event.target.value) && selectedControl.id != event.target.value) {
		// change the textbox backcolor to red (visually indicating the ID can't be changed)
		event.target.style.backgroundColor = "red";
	    } else {
		// return textbox backcolor to the default value
		event.target.style.backgroundColor = "";
		// update the control ID
            	selectedControl.id = event.target.value;
	    }

            break;


        case "elementClass":

            setElementClass(
        	selectedControl,
        	event.target.value);
            break;
    }
}

// tab control buttons

// go to the last-viewed tab
function goToLastSidebarTab() {
	switch (lastViewedSidebarClassID) {
		case ".toolbar":
			toolbarTabButton_Clicked();
			break;

		case ".properties-panel":
			itemPropertiesTabButton_Clicked()
			break;
	}
}

function toolbarTabButton_Clicked() {
	// hide all sidebar divs (reset the view)
	hideSidebarDivs();

	// show the toolbar div
	document.querySelector('.toolbar').style.display = "flex";

	// disable the toolbar button (since the tab is open)
	document.querySelector('#toolbarTabBtn').disabled = true;

	// update sidebar view class ID variables
	lastViewedSidebarClassID = currentViewedSidebarClassID;
	currentViewedSidebarClassID = ".toolbar";
}

function itemPropertiesTabButton_Clicked() {
	// hide all sidebar divs (reset the view)
	hideSidebarDivs();

	// show the item properties div
	document.querySelector('.properties-panel').style.display = "flex";

	// disable the toolbar button (since the tab is open)
	document.querySelector('#itemPropertyTabBtn').disabled = true;

	// update sidebar view class ID variables
	lastViewedSidebarClassID = currentViewedSidebarClassID;
	currentViewedSidebarClassID = ".properties-panel";
}

// hides all divs that make up the sidebar part of the page
function hideSidebarDivs() {

	// hide divs
	document.querySelector('.toolbar').style.display = "none";
	document.querySelector('.properties-panel').style.display = "none";

	// enable all tab buttons (active tab's button will be disabled by the calling event handler)
	document.querySelector('#toolbarTabBtn').disabled = false;
	document.querySelector('#itemPropertyTabBtn').disabled = false;
	
}


// executes whenever an event changing the number of controls created changes
function onControlCountChanged() {
	// check if control count is 0 (adjust the save/export-related IO function button state based on if there is actually data to save or export)
	if (createdControlCount > 0) {
		// enable the related I/O buttons
		document.querySelector('#savePageToFileBtn').disabled = false;
		document.querySelector('#exportPageBtn').disabled = false;
	} else {
		// disable the related I/O buttons (since no data exist to save)
		document.querySelector('#savePageToFileBtn').disabled = true;
		document.querySelector('#exportPageBtn').disabled = true;
	}
}

// this function should be executed whenever HTML/CSS is loaded from an external source (such as the browser or a wpe file)
function onPageLoaded() {
	// apply settings:

	// 1. Register all hyperlinks with a 'click' event to prevent them from being clicked and redirecting the user to the link (since they have to click the links to edit them, which is irritating)
	document.getElementById("controlCanvas").querySelectorAll("a").forEach(link => {
    		link.addEventListener("click", function(event) {
    			event.preventDefault();
		});
	});
}


//=======CONTROL ACTION BUTTON EVENT HANDLERS=========

// event handler that fires when the user clicks the 'move display order up' button (which moves the control 1 step up in its containing control's display order/hierarchy)
function mdouBtn_OnClick(
	isExecutingUndoRedoStep = false
) {
	// check for errors (i.e., no control selected) to avoid exceptions
	if (!selectedControl) { return; }

	// check if a 'modify control property' step needs to be added
	if (editingProperty_IsModifyingProperty) {
		addCtrlPropertyModifyStepToURSList();
	}

	// record the selectd control id
	const selCtrlID = selectedControl.id;

	// get the previous control (to move the selected control(s) before)
	const previousCtrl = getPreviousDisplayOrderedElement(selectedControl);

	// move the selected control
	selectedControl.parentNode.insertBefore(selectedControl, previousCtrl);

	// move child control(s) (based on control type)
	switch (selectedControl.dataset.controlType) {
		case "Searchable Dropdown List":
			// move the dropdown div in order as well (to ensure everything is properly arranged)
			selectedControl.parentNode.insertBefore(document.getElementById(selectedControl.dropdownDivID), previousCtrl);
			break;
	}

	// update the movement button enabled state (since control display order changed)
	updateCtrlDisplayOrderAdjustmentBtns();

	if (!isExecutingUndoRedoStep) {

		console.log("ADDING MOVE CTRL ORDER STEP");

		// add step
		addChangeCtrlDisplayOrder_URS(selCtrlID, "up");
	}
}

// event handler that fires when the user clicks the 'move display order down' button (which moves the control 1 step down in its containing control's display order/hierarchy)
function mdodBtn_OnClick(
	isExecutingUndoRedoStep = false
) {
	// check for errors (i.e., no control selected) to avoid exceptions
	if (!selectedControl) { return; }

	// check if a 'modify control property' step needs to be added
	if (editingProperty_IsModifyingProperty) {
		addCtrlPropertyModifyStepToURSList();
	}

	// record the selectd control id
	const selCtrlID = selectedControl.id;

	// get the next control (to move the selected control(s) after)
	const nextCtrl = getNextDisplayOrderedElement(selectedControl);

	// move the selected control
	selectedControl.parentNode.insertBefore(nextCtrl, selectedControl);

	// move child control(s) (based on control type)
	switch (selectedControl.dataset.controlType) {
		case "Searchable Dropdown List":
			// move the dropdown div in order as well (to ensure everything is properly arranged)
			selectedControl.parentNode.insertBefore(selectedControl, document.getElementById(selectedControl.dropdownDivID));
			break;
	}

	// update the movement button enabled state (since control display order changed)
	updateCtrlDisplayOrderAdjustmentBtns();

	if (!isExecutingUndoRedoStep) {

		console.log("ADDING MOVE CTRL ORDER STEP");
		
		// add step
		addChangeCtrlDisplayOrder_URS(selCtrlID, "down");
	}
}

// event handler that fires when the user clicks the 'move to next selected container' button (which moves the selected control into the next container the user clicks. If the user clicks a non-container control, the action is canceled. If the user clicks the button twice, the action will be canceled)
function moveCtrlToSelectedContainerBtn_OnClick() {
	// check for errors (i.e., no control selected) to avoid exceptions
	if (!selectedControl) { return; }

	// expected behavior:
	// 1. User clicks on control, then on this button
	// 2. The button changes color (visually indicating the change) and so does a label at the top of the page
	// 3. If user clicks the button again, the action is canceled
	// 4. If user clicks on a different container control than the selected control's current container, the control will be moved into that selected container and the flag will be cleared

	// check the state of the action flag
	if (!isControlContainerBeingAdjusted) {
		// update fields
		isControlContainerBeingAdjusted = true;
		movingContainerControl = selectedControl;

		// set instruction label
		updateInstructionLabel("(Cancel with esc key) Click on a container to move '" + movingContainerControl.id + "'.", "orange");

		// deselect control (so user can select a container)
		deselectControl();
	}
}

// event handler that fires when the user clicks the 'delete control' button (which deletes the currently selected control)
function deleteSelectedCtrlBtn_OnClick() {
	// check for errors (i.e., no control selected) to avoid exceptions
	if (!selectedControl) { return; }

	// generate an 'onDeleteKeyPress' event
	onDeleteKeyPress(new KeyboardEvent("keypress", {
    key: "Delete",
    code: "Delete"
}));
}