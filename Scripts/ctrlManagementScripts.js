    /*
     * Reads the embedded controlPropertiesJSON and returns
     * the parsed JavaScript object.
     */
    function getControlPropertiesDefinition() {
        const jsonElement =
            document.getElementById("controlPropertiesJSON");

        if (!jsonElement) {
            throw new Error(
                "controlPropertiesJSON script element was not found."
            );
        }

        return JSON.parse(jsonElement.textContent);
    }

// this function inserts a custom control into the currently selected container
function insertCustomElement(controlType, selectedContainer) {
	const controlCreationButton = document.getElementById(controlType + " Toolbar Creation Button");
	const customElementHTML = controlCreationButton.dataset.elementHTML;

	// ensure the new HTML elements will have unique ID values
	let validatedCustomElementHTML = applyUniqueIDsToHTMLElements(customElementHTML);

	// insert the custom HTML into the selected container (or control canvas if no container is selected)
    	const container = selectedContainer || document.getElementById("controlCanvas");
	
	// insert the HTML
	container.insertAdjacentHTML('beforeend', validatedCustomElementHTML);
}


function createControl(
    controlType,
    isRedoingAction = false
) {

    /*
     * Use the selected container, or fall back
     * to controlCanvas.
     */
    const container =
        selectedContainer ||
        document.getElementById(
            "controlCanvas"
        );

    console.log("SELECTED CONTAINER: " + selectedContainer);

    if (!container) {

        console.error(
            "No control container found."
        );

        return null;
    }

    console.log("CONTROL TYPE: " + controlType);

    /*
     * Create the HTML element.
     */
    const tagName =
        getHTMLTagForControlType(
            controlType
        );

    // generate the control type based on the tag
    const control = document.createElement(tagName);

    // configure special properties based on the element type
    switch (tagName) {
	case "h1":
	case "h2":
	case "h3":
	case "h4":
	case "label":
		// enable editing of the text in-document, as well as allowing the insertion of rich text.
		control.contentEditable = true;
		break;

	case "p":
		// enable editing of the text in-document, as well as allowing the insertion of rich text.
		control.contentEditable = true;

		// set the 'whiteSpace' property to 'pre-wrap' to allow pre-formatted text to be preserved.
		control.style.whiteSpace = "pre-wrap";

		break;

	case "a":
		// disable the hyperlink from opening the target link since that will interfere with editing the control (since clicking on the link object is required to pull up settings and edit it)
		control.addEventListener("click", function(event) {
    			event.preventDefault();
		});
		break;
	case "table":
		// add at least 1 row and column (both handled by the function)
		addColumnToTable(control);
		break;

	case "ul":
	case "ol":
		// add 1 item to ensure control is visible & selectable
		addItemToList(control, "list item 1");
		break;

	case "select":
		// add an event handler to disable opening the combobox (since it is a bit annoying when trying to select/deselect the control)
		control.addEventListener("mousedown", (event) => {
  			event.preventDefault();
		});
		break;
    }

    /*
     * Configure input controls.
     */
    if (tagName === "input") {

        control.type =
            getInputTypeForControlType(
                controlType
            );
    }

    /*
     * Identify the element as an editor-created
     * control.
     */
    control.classList.add(
        "created-control"
    );

    /*
     * Store the control type.
     */
    control.dataset.controlType =
        controlType;

    /*
     * Apply the default properties from
     * controlPropertiesJSON.
     */
    applyDefaultControlProperties(
        control,
        controlType
    );


    /*
     * Add the control to the selected container.
     */
    container.appendChild(
        control
    );

    // auto-generate an ID for the control
    control.id = autoGenerateControlID(controlType);

    // configure properties based on controlType
    switch(controlType) {
	case "Listbox":
		// configure the control to be a listbox by setting the 'multiple' field
		control.multiple = true;
		// set the default height to 45 pixels (ensure scrollbar looks acceptable)
		control.style.height = "45px";
		break;
	case "Searchable Dropdown List":

		// configure control options
		control.autocomplete = "off";

		// set up search controls (a div to store a list of items, and an unordered list to store the items)
		const dropdownContainerDiv = document.createElement("div");
		const searchableItemList = document.createElement("ul");

		// set the dropdownContainerDiv properties
		dropdownContainerDiv.style.position = "fixed";
		dropdownContainerDiv.style.border = "1px solid #ccc";
		dropdownContainerDiv.style.zIndex = "999999";
		dropdownContainerDiv.style.boxSizing = "border-box";
		dropdownContainerDiv.style.display = "none";
		dropdownContainerDiv.style.backgroundColor = "white";
		dropdownContainerDiv.style.paddingLeft = "5px";

		// set the searchableItemList properties
		searchableItemList.style.margin = "0";
		searchableItemList.style.padding = "0";
		searchableItemList.style.listStyle = "none";
		searchableItemList.style.maxHeight = "200px";
		searchableItemList.style.overflowY = "auto";
		//searchableItemList.style.border = "1px solid #ccc";

		// add ID fields to child controls to be able to find them later
		searchableItemList.id = control.id + "SearchableItemList";
		dropdownContainerDiv.id = control.id + "DropdownDiv";

		// add the list ID to the control so it can be found/updated later
		control.setAttribute('backingListID', searchableItemList.id);
		control.setAttribute('dropdownDivID', dropdownContainerDiv.id);
		control.isDropdownPositioned = "false";

		// add a reference to the dropdown div

		// (for testing) add an item to the list
		searchableItemList.appendChild(new Option("Apple"));

		// add the controls to the page to allow their use
		dropdownContainerDiv.appendChild(searchableItemList);
		container.appendChild(dropdownContainerDiv);

		// bind event handlers to the textbox (control)
		control.addEventListener("input", () => { filterOptionsOnUserInput(document.getElementById(control.id)); });
		control.addEventListener("focus", () => { filterOptionsOnUserInput(document.getElementById(control.id)); });

		// closes the dropdown (should fire if the user no longer has selected the combobox
		control.addEventListener("blur", () => { 
	closeDropdown(document.getElementById(dropdownContainerDiv.id), document.getElementById(control.id));
});
		control.addEventListener("mousedown", () => { openDropdown(document.getElementById(dropdownContainerDiv.id), document.getElementById(control.id)); });

		// bind event handlers to the list
		searchableItemList.addEventListener("mousedown", event => { stb_SelectItem(document.getElementById(control.id), event.target.textContent); } );

		//console.log(document.getElementById(control.backingListID).querySelectorAll("option"));

		// position dropdown
		positionDropdown(document.getElementById(dropdownContainerDiv.id), document.getElementById(control.id));

		break;
    }

    console.log("Newly created control type: " + controlType);
    // increment the number of created controls
    createdControlCount += 1;
    // run the 'control changed' event (since control count just changed)
    onControlCountChanged();

    /*
     * Automatically select the newly-created
     * control.
     */
    selectControl(
        control,
        controlType
    );


    if (typeof isRedoingAction != "boolean") {
    	// add a 'create control' event to the undo/redo stack to enable undoing/redoing the event
    	addCreateCtrl_URS(control.id, controlType, container.id);
    }

    return control;
}


// this function deletes the selected control
function deleteControl(isCreateCtrlActionBeingUndone = false) {

   if (!selectedControl) {
        return;
    }

    /*
     * Don't delete the control if the user is actually
     * typing into a text field.
     */
    const activeElement =
        document.activeElement;

    const isTextEditingField =
        activeElement &&
        (
            activeElement.tagName === "TEXTAREA" ||
            (
                activeElement.tagName === "INPUT" &&
                (
                    activeElement.type === "text" ||
                    activeElement.type === "number" ||
                    activeElement.type === "search" ||
                    activeElement.type === "url" ||
                    activeElement.type === "email"
                )
            )
        );

    if (isTextEditingField) {
        return;
    }


    /*
     * Prevent the browser's default Delete behavior.
     */
    event.preventDefault();
    event.stopPropagation();


    /*
     * Keep a reference to the control before
     * clearing the selection.
     */
    const controlToDelete =
        selectedControl;

    // create a 'delete control' action for the undo/redo list (if this control deletion isn't being driven by an 'undo create control' action
    if (typeof isCreateCtrlActionBeingUndone == "boolean" && !isCreateCtrlActionBeingUndone) {

	if (selectedControl.previousElementSibling != null) {
		addDeleteCtrl_URS(selectedControl.id, selectedControl.dataset.controlType, selectedControl.outerHTML, selectedControl.previousElementSibling.id, selectedControl.parentElement.id);
	} else {
		addDeleteCtrl_URS(selectedControl.id, selectedControl.dataset.controlType, selectedControl.outerHTML, "", selectedControl.parentElement.id);		
	}
    }


    /*
     * Deselect the control.
     */
    deselectControl();

    console.log("CONTROL TYPE BEING DELETED: " + controlToDelete.dataset.controlType);

    /*
     * Remove it from the DOM.
     */
    if (controlToDelete && controlToDelete.parentNode) {
	// check if the selected control is a table cell
	if (controlToDelete.dataset.controlType == "tableCell") {
		// delete inner HTML; table cell can't be deleted except by adjusting the table row/column count in the table
		// 1. Record the number of child elements in the table cell
		let tableCellChildControlCount = controlToDelete.childElementCount;
		// 2. Clear out the inner HTML (delete all contained controls)
		controlToDelete.innerHTML = "";
		// 3. Update the control count
		createdControlCount -= tableCellChildControlCount;
    		// run the 'control changed' event (since control count just changed)
    		onControlCountChanged();

		//console.log("TODO; DELETE INNER TABLE ELEMENTS");
	} else {

		// check if control is a specific type (i.e., contains multiple child elements)
		if (controlToDelete.dataset.controlType == "Searchable Dropdown List") {
			// delete dropdown div and list
			// 1. Get references to controls
			const ctrlDropdownDivRef = document.getElementById(controlToDelete.getAttribute('dropdownDivID'));
			const ctrlSearchListRef = document.getElementById(controlToDelete.getAttribute('backingListID'));
		
			// 2. Remove controls from their parent containers
			ctrlDropdownDivRef.parentNode.removeChild(ctrlDropdownDivRef);
			ctrlSearchListRef.parentNode.removeChild(ctrlSearchListRef);
		}

		// delete selected control
        	controlToDelete.parentNode.removeChild(
            		controlToDelete);

    		// increment the number of created controls
    		createdControlCount -= 1;
    		// run the 'control changed' event (since control count just changed)
    		onControlCountChanged();
	}
    }
}



function getApplicableProperties(
    controlType
) {

    const definition =
        getControlPropertiesDefinition();


    const applicableProperties =
        new Set();


    /*
     * Common properties apply to every control.
     */
    definition.commonProperties.forEach(
        function(propertyName) {

            applicableProperties.add(
                propertyName
            );
        }
    );


    /*
     * Add control-specific properties.
     */
    const binding =
        definition.controlPropertyBindings.find(
            function(entry) {

                return (
                    entry[0].toLowerCase() ===
                    controlType.toLowerCase()
                );
            }
        );


    if (binding) {

        binding[1].forEach(
            function(propertyName) {

                applicableProperties.add(
                    propertyName
                );
            }
        );
    }


    return applicableProperties;
}


function applyDefaultProperties(
    control,
    controlType
) {

    const applicableProperties =
        getApplicableProperties(
            controlType
        );


    applicableProperties.forEach(
        function(propertyName) {

            const definition =
                propertyDefinitions[
                    propertyName
                ];


            if (!definition) {
                return;
            }


            applyPropertyToControl(
                control,
                propertyName,
                definition.defaultValue
            );
        }
    );
}




function selectControl(control, controlType) {

    // check if the user clicked on the control itself (supposed to toggle selection)
    if (selectedControl === control) {
	// check if the selected control is a table cell; if so, correct behavior is to select the table (since otherwise there's no way to select the table) 
	if (controlType == "tableCell") {
		selectControl(control.closest('table'), "table");
	}
	else {
        	deselectControl();
	}
        return;
    }

    // check if a selected control already exists
    if (selectedControl != null) {
    	if (selectedControl === control) {
        	deselectControl();
        	return;
    	} else {
		deselectControl();
		// suppress the property update to avoid applying the update to the newly selected control (which is not what the user intends)
		suppressPropertyUpdate = true;
	}
    }

    if (selectedControl) {
        selectedControl.style.outline = "";
    }


    // check if the user is moving a control into another container
    if (isContainerControl(controlType) && isControlContainerBeingAdjusted) {
    	// store moving control ID
	movingContainerCtrlID = movingContainerControl.id;

	// move the control
	moveElementToContainer(control, movingContainerControl);

	// update the refence
	movingContainerControl = document.getElementById(movingContainerCtrlID);

	// 2. Reset the action label to clear instructions, since the process is no longer active
	resetInstructionLabel();

	// update display order buttons based on the control's position in the container it was moved to
	updateCtrlDisplayOrderAdjustmentBtns();

	// end the process
	// 1. Reset fields
	isControlContainerBeingAdjusted = false;

	// select the control
/*
	selectControl(movingContainerControl, movingContainerControl.dataset.controlType);
*/
	
	// select control (simulate a click)
	// -get an X and Y value to click on the control
	const ctrlBoundingRect = movingContainerControl.getBoundingClientRect();
	const ctrlClickX = (ctrlBoundingRect.left + (ctrlBoundingRect.width / 2));
	const ctrlClickY = (ctrlBoundingRect.top + (ctrlBoundingRect.height / 2));

	// simulate a click on the control to select it
	movingContainerControl.dispatchEvent(
		new PointerEvent("pointerdown", {
        		bubbles: true,
        		cancelable: true,
        		pointerId: 1,
        		pointerType: "mouse",
        		isPrimary: true,
        		clientX: ctrlClickX,
        		clientY: ctrlClickY
    		})
	);

	// depending on control type, move child controls
	switch (movingContainerControl.dataset.controlType) {
		case "Searchable Dropdown List":
			// force dropdown to reposition
			movingContainerControl.isDropdownPositioned = "false";

			// reposition the dropdown
			positionDropdown(document.getElementById(movingContainerControl.getAttribute('dropdownDivID')), movingContainerControl);
			break;
	}

	// clear the reference
	movingContainerControl = null;

	// don't continue with selecting the container, since the control being moved is what is supposed to be selected
	return;
    }



    selectedControl =
        control;

    console.log("Newly selected control ID: " + selectedControl.id);

    selectedControlType =
        controlType;

    // enable relevant control action buttons
    document.getElementById("deleteSelectedCtrlBtn").disabled = false;
    document.getElementById("moveCtrlToContainerBtn").disabled = false;

    // check if control type is a container or not (to run the 'selectContainer' function) to ensure containers can be selected to control where new controls get placed
    if (isContainerControl(controlType)) {
	// run the 'selectContainer' function
	selectContainer(control);
    } else {
	// check if the user is moving a control between containers
    	if (isControlContainerBeingAdjusted) {
		// user was moving a control between containers, but they clicked on a non-container element
		// -proper behavior is that this will cancel the 'move control' action (since the user didn't click on a container)
		// cancel the process
		// 1. Reset fields
		isControlContainerBeingAdjusted = false;
		movingContainerControl = null;

		// 2. Reset the action label to clear instructions, since the process is no longer active
		resetInstructionLabel();
	}
	// otherwise nothing to do
    }

    /*
     * Highlight the selected control.
     */
    const parent =
        control.parentElement;

    const parentColor =
        parent
            ? getElementBackgroundColor(
                parent
            )
            : "rgb(255, 255, 255)";

    control.style.outline =
        "3px solid " +
        getContrastingRandomColor(
            parentColor
        );


    /*
     * Load the Name, ID and Class fields.
     */
    loadElementIdentityValues(
        control
    );

    /*
     * Show applicable control properties.
     */
    updateVisibleProperties(
        controlType
    );

    // update the display order adjustment buttons for the new control
    updateCtrlDisplayOrderAdjustmentBtns();

    /*
     * Load the selected control's
     * property values.
     */
    loadControlPropertyValues(
        control
    );

    // reset the color of the ID textbox (should only be marked red when it is being edited)
    document.getElementById("elementId").style.backgroundColor = "";

    // switch to the properties panel to show the selected control's properties
    itemPropertiesTabButton_Clicked();

    // enable the 'export selected element' button (since something is selected)
    document.querySelector('#exportElementBtn').disabled = false;
}


function deselectControl() {
if (!selectedControl) {
        return;
    }

    // perform cleanup/deselection events for certain control types
    switch (selectedControl.dataset.controlType) {
	case "Searchable Dropdown List":
		// manually run the 'close dropdown' function to ensure the dropdown is closed (since clicking onto another control after selecting the dropdown list won't cause the control to close)

		closeDropdown(document.getElementById(selectedControl.getAttribute('backingListID')), document.getElementById(selectedControl.getAttribute('dropdownDivID')));
		break;
    }

    selectedControl.style.outline =
        "";

    /*
     * Clear and disable Name, ID and Class.
     */
    loadElementIdentityValues(
        null
    );

    // disable action buttons (since no control is selected)
    document.getElementById("changeElemDivOrderUpBtn").disabled = true;
    document.getElementById("changeElemDivOrderDownBtn").disabled = true;
    document.getElementById("deleteSelectedCtrlBtn").disabled = true;
    document.getElementById("moveCtrlToContainerBtn").disabled = true;

    // check if the selected control is a container (which requires deselecting the current container in order to avoid controls ending up in the wrong place)
    if (isContainerControl(selectedControlType)) {
	selectedContainer = null;
    }

    // switch back to the last viewed sidebar tab
    goToLastSidebarTab();

    /*
     * Hide the control properties.
     */
    hideAllPropertyControls();

    /*
     * Reset the property editor values.
     */
    resetPropertyEditorValues();

    // when the user deselects a control, there may still be an unrecorded property update
    addCtrlPropertyModifyStepToURSList();


    // print log file explaining what happened
    console.log("Deselecting control '" + selectedControl.id + "'.");

    selectedControl =
        null;

    selectedControlType =
        null;

    // disable the 'export selected element' button (since now nothing is selected)
    document.querySelector('#exportElementBtn').disabled = true;
}


function selectContainer(
    container
) {

    if (!container) {
        return;
    }


    /*
     * Remove the previous container's
     * selection highlight.
     */
    if (
        selectedContainer &&
        selectedContainer !== container
    ) {

        selectedContainer.style.outline =
            "";
    }


    selectedContainer =
        container;

    console.log("New selected contaner: " + selectedContainer.id);

    // check if the user is moving a control between containers
    if (isControlContainerBeingAdjusted) {
	// store moving control ID
	movingContainerCtrlID = movingContainerControl.id;

	// move the control
	moveElementToContainer(selectedContainer, movingContainerControl);

	// update the refence
	movingContainerControl = document.getElementById(movingContainerCtrlID);

	// 2. Reset the action label to clear instructions, since the process is no longer active
	resetInstructionLabel();

	// deselect the selected div
	deselectControl();

	// update display order buttons based on the control's position in the container it was moved to
	updateCtrlDisplayOrderAdjustmentBtns();

	// depending on control type, move child controls
	switch (movingContainerControl.dataset.controlType) {
		case "Searchable Dropdown List":
			// reposition the dropdown
			positionDropdown(document.getElementById(movingContainerControl.getAttribute('dropdownDivID')), movingContainerControl);
			break;
	}

	// end the process
	// 1. Reset fields
	isControlContainerBeingAdjusted = false;
	movingContainerControl = null;

	// cancel rest of selection process (since the user moved a control)
	return;
    }


	//console.log("REACHED THIS AREA");

    /*
     * The canvas gets a random color.
     * Other containers get a color that
     * contrasts with their parent.
     */
    if (
        container.id ===
        "controlCanvas"
    ) {

        container.style.outline =
            "3px solid " +
            getRandomColor();

    } else {

        const parent =
            container.parentElement;

        const parentColor =
            parent
                ? getElementBackgroundColor(
                    parent
                )
                : "rgb(255, 255, 255)";


        container.style.outline =
            "3px solid " +
            getContrastingRandomColor(
                parentColor
            );
    }
}

/*
 * Registers a container as a selectable container.
 */
function registerContainer(
    container
) {

    container.addEventListener(
        "click",
        function (event) {

            containerClicked(
                container,
                event
            );
        }
    );
}

function loadElementIdentityValues(
    control
) {

    const nameField =
        document.getElementById(
            "elementName"
        );

    const idField =
        document.getElementById(
            "elementId"
        );

    const classField =
        document.getElementById(
            "elementClass"
        );


    if (
        !nameField ||
        !idField ||
        !classField
    ) {
        return;
    }


    if (!control) {

        nameField.value =
            "";

        idField.value =
            "";

        classField.value =
            "";

        setElementIdentityFieldsEnabled(
            false
        );

        return;
    }


    /*
     * HTML elements don't have a universal
     * "name" property, so use the name attribute.
     */
    nameField.value =
        control.getAttribute(
            "name"
        ) || "";


    idField.value =
        control.id || "";

    classField.value =
        control.className || "";

    setElementIdentityFieldsEnabled(
        true
    );
}

function applyDefaultControlProperties(
    control,
    controlType
) {

    if (!control) {
        return;
    }


    /*
     * Make sure the property definitions
     * have been loaded.
     */
    if (
        !propertyDefinitions ||
        Object.keys(propertyDefinitions).length === 0
    ) {
        console.warn(
            "Property definitions have not been loaded."
        );

        return;
    }


    /*
     * Get the common properties.
     */
    const definition =
        getControlPropertiesDefinition();


    const commonProperties =
        definition.commonProperties || [];


    /*
     * Find the properties that apply to
     * this particular control type.
     */
    const controlBindings =
        definition.controlPropertyBindings || [];


    let controlProperties = [];

    console.log(controlProperties);

    controlBindings.forEach(
        function(binding) {

            if (
                !Array.isArray(binding) ||
                binding.length < 2
            ) {
                return;
            }


            const bindingControlType =
                binding[0];


            if (
                bindingControlType.toLowerCase() ===
                controlType.toLowerCase()
            ) {

                controlProperties =
                    binding[1] || [];
            }
        }
    );


    /*
     * Combine common and control-specific
     * properties.
     */
    const propertiesToApply =
        [
            ...commonProperties,
            ...controlProperties
        ];


    /*
     * Remove duplicates.
     */
    const uniqueProperties =
        [
            ...new Set(
                propertiesToApply
            )
        ];


    /*
     * Apply each property's default value.
     */
    uniqueProperties.forEach(
        function(propertyName) {

            const definition =
                propertyDefinitions[
                    propertyName
                ];


            if (!definition) {
                console.warn(
                    "No property definition found for:",
                    propertyName
                );

                return;
            }


            const defaultValue =
                definition.defaultValue;


            if (
                defaultValue === undefined ||
                defaultValue === null
            ) {
                return;
            }


            applyPropertyToControl(
                control,
                propertyName,
                defaultValue,
		true
            );
        }
    );
}