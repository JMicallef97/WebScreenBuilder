/* ===UNDO/REDO SYSTEM BEHAVIOR===
 * Do an action: Add a URS (undo-redo step) to the stack
 * Undo action: Perform the undo step on the current action and decrement the current URS index. Disable button when index is 0.
 * Redo Action: Perform the redo step on the current action and increment the current URS index. Disable button if incremented index is stack length - 1 (last index)
 * Do a new action after undoing/redoing (start/middle of stack): Remove rest of items in stack, and add new action to the end of the stack
 */

// defines the maximum number of undo/redo records
const URS_LIST_MAX_SIZE = 50;

// a list containing undo-redo record objects, implemented as a circular list
let URSList = new Array(URS_LIST_MAX_SIZE);
// stores the index of the current step in the undo/redo step list, used to keep track of what action to undo/redo when the user does that action
let currentURSIndex = 0;
// the index in undoRedoStepList which is the end of the list (since the list is implemented as a circular list - that is, indices wrap around)
let URSListEndIndex = 0;
// the index in URSList which is the start of the list (since the list is implemented as a circular list - that is, indices wrap around)
let URSListStartIndex = 0;
// counts the number of elements created in the list (used to ensure circular list management logic works properly)
let newURSRecordCounter = 0;
// stores the value of the next index to insert new URS records into
let newURSInsertIndex = 0;
let URSCounter = 0;

// a boolean indicating if a URS is being inserted (in the middle of the URS list) or not
let isURSBeingInserted = false;


//=====UI INTERACTION FUNCTIONS=====
// -this function is called by undo-redo execution functions when there are no more actions to redo
function updateEnabledStatus_RedoActionUIElement(newEnabledStatus) {

	// get a reference to the button
	btnRef = document.getElementById("redoActionBtn");

	// update the 'disabled' status
	btnRef.disabled = !newEnabledStatus;

	// change opacity/bkgd color based on state
	if (!newEnabledStatus) {
		btnRef.style.opacity = "50%";
		btnRef.style.backgroundColor = "gray";
	} else {
		btnRef.style.opacity = "100%";
		btnRef.style.backgroundColor = "";
	}
}

// -this function is called by undo-redo execution functions when there are no more actions to undo
function updateEnabledStatus_UndoActionUIElement(newEnabledStatus) {

	// get a reference to the button
	btnRef = document.getElementById("undoActionBtn");

	// update the 'disabled' status
	btnRef.disabled = !newEnabledStatus;

	// change opacity/bkgd color based on state
	if (!newEnabledStatus) {
		btnRef.style.opacity = "50%";
		btnRef.style.backgroundColor = "gray";
	} else {
		btnRef.style.opacity = "100%";
		btnRef.style.backgroundColor = "";
	}
}


//=====UNDO-REDO ACTION EXECUTION FUNCTIONS=====

// executes the current undo/redo action (based on the 'direction' parameter value).
// -to redo an action, pass the string 'redo'
// -to undo an action, pass the string 'undo'
function executeUndoRedoAction(direction) {
	if (direction == null) {
		console.log("Can't execute undo/redo action, 'direction' parameter is null.");
		return;
	}

	// check if there is a step to add
	if (editingProperty_IsModifyingProperty) {
		addCtrlPropertyModifyStepToURSList();
		return;
	}
	
	// perform error checks (ensure 'direction' is valid)
	const normalizedURSDirStr = direction.toString().toLowerCase();

	switch (normalizedURSDirStr) {
		case "undo":
			// perform the undo action on the current record
			executeUndoAction();
			break;

		case "redo":
			// perform the redo action on the current record
			executeRedoAction();
			break;

		default:
			console.log("Can't execute undo/redo action, 'direction' string ('" + normalizedUSRDirStr + "') is not valid.");
			return;
			break;
	}
}

// performs an 'undo' action using information from the URS (undo-redo step) object referenced in the 'URSToUndo' parameter
function executeUndoAction() {

	// get a reference to the current action
	let URSToUndo = URSList[currentURSIndex];

	// execute 'undo' on the current step
	switch (URSToUndo.stepType) {
		case "createControl":
			undoCreateCtrlAction(URSToUndo);
			break;
		case "deleteControl":
			undoDeleteCtrlAction(URSToUndo);
			break;
		case "modifyControlProperty":
			undoModifyCtrlPropertyAction(URSToUndo);
			break;
		case "changeControlDisplayOrder":
			undoChangeCtrlDisplayOrderAction(URSToUndo);
			break;
		case "changeControlContainer":
			undoChangeCtrlContainerAction(URSToUndo);
			break;
	}

	console.log(currentURSIndex + " current index; " + "\n" + " list start index: " + URSListStartIndex);

	// adjust undo button status based on action
	if (currentURSIndex == URSListStartIndex) {
		// disable the undo button (since there are no more actions to undo)
		updateEnabledStatus_UndoActionUIElement(false);
	} else {
		// update currentURSIndex using circular arithmetic to go the next action to undo
		currentURSIndex -= 1;
		if (currentURSIndex < 0) { currentURSIndex = URS_LIST_MAX_SIZE-1; }

		console.log("NEXT STEP INDEX: " + currentURSIndex);
		
		// enable the button
		updateEnabledStatus_UndoActionUIElement(true);
	}

	// increment URSCounter to keep track of the position of the counter
	URSCounter--;

	// enable the 'redo action' button (since undoing an action must logically allow for it to be redone)
	updateEnabledStatus_RedoActionUIElement(true);
}



// performs a 'redo' action using information from the URS (undo-redo step) object referenced in the 'URSToRedo' parameter
function executeRedoAction() {
	// get a reference to the current action
	let URSToRedo = URSList[currentURSIndex];

	// execute 'redo' on the current step
	switch (URSToRedo.stepType) {
		case "createControl":
			redoCreateCtrlAction(URSToRedo);
			break;
		case "deleteControl":
			redoDeleteCtrlAction(URSToRedo);
			break;
		case "modifyControlProperty":
			redoModifyCtrlPropertyAction(URSToRedo);
			break;
		case "changeControlDisplayOrder":
			redoChangeCtrlDisplayOrderAction(URSToRedo);
			break;
		case "changeControlContainer":
			redoChangeCtrlContainerAction(URSToRedo);
			break;
	}

	// increment URSCounter to keep track of the position of the counter
	URSCounter++;

	console.log(currentURSIndex + " current index; " + "\n" + " list start index: " + URSListStartIndex);

	// manage redo button
	if (currentURSIndex == URSListEndIndex) {
		// disable the redo button (since there are no more actions to redo)
		updateEnabledStatus_RedoActionUIElement(false);
	} else {
		// update currentURSIndex using circular arithmetic to go the next action to redo
		currentURSIndex = (currentURSIndex + 1) % URS_LIST_MAX_SIZE;
		
		// enable the button
		updateEnabledStatus_RedoActionUIElement(true);
	}

	// enable the 'undo action' button (since redoing an action must logically allow for it to be undone)
	updateEnabledStatus_UndoActionUIElement(true);	
}

// =====UNDO-REDO LIST MANAGEMENT FUNCTIONS======

// this function adds the undo-redo step record referenced by the 'URSRecord' parameter to the undo redo list. If the parameter is null, or the value of its 'stepType' parameter doesn't match any of the supported step types, it won't be added to the list
function undoRedoList_AddURS(URSRecord) {
	// error checks

	// check if parameter is null
	if (URSRecord == null) {
		console.log("Can't add URS record; referenced record is null");
		return;
	}
	
	// check if object doesn't have a 'stepType' property
	if (!Object.hasOwn(URSRecord, "stepType")) {
		console.log("Can't add URS record; referenced record doesn't have a 'stepType' property");
		return;
	}

	// check if step name is supported
	if (URSRecord.stepType != "createControl" &&
	    URSRecord.stepType != "deleteControl" &&
	    URSRecord.stepType != "modifyControlProperty" &&
	    URSRecord.stepType != "changeControlDisplayOrder" &&
	    URSRecord.stepType != "changeControlContainer") {
		console.log("Can't add URS record; step type '" + URSRecord.stepType + "' is not supported");
		return;
	}

	// check if currentURSIndex != URSListEndIndex
	//console.log("CREATION TIME: curIndex = " + currentURSIndex + "\n" + " insertIndex: " + URSListEndIndex);

	isURSBeingInserted = !(currentURSIndex == URSListEndIndex);
	console.log(isURSBeingInserted);

	// update newURSInsertIndex to be after currentURSindex
	if (isURSBeingInserted) {
		newURSInsertIndex = (currentURSIndex + 1) % URS_LIST_MAX_SIZE;
	
		// disable the 'redo' button
		updateEnabledStatus_RedoActionUIElement(false);
	}

	// update the entry in the list
	URSList[newURSInsertIndex] = URSRecord;

	// update currentURSIndex
	currentURSIndex = newURSInsertIndex;
	// update URSListEndIndex with the list's new ending index
	URSListEndIndex = currentURSIndex;

	// update newURSInsertIndex after the insertion (since the record is being added at the end of the list)
	if (!isURSBeingInserted) {
		// update newURSInsertIndex
		newURSInsertIndex = (currentURSIndex + 1) % URS_LIST_MAX_SIZE;
	}

	// increment URSCounter to keep track of the position of the counter
	URSCounter++;

	// update list start index if list wraps around
	if (URSCounter >= URS_LIST_MAX_SIZE) {s
		URSListStartIndex = (URSListEndIndex + 1) % URS_LIST_MAX_SIZE;
	}

	console.log("\nLIST START INDEX: " + URSListStartIndex +
		    "\nLIST END INDEX: " + URSListEndIndex +
		    "\nCURRENT STEP INDEX: " + currentURSIndex +
		    "\nNEW INSERT INDEX: " + newURSInsertIndex);  

	// enable the 'undo' button (since there is at least 1 undo-redo step)
	updateEnabledStatus_UndoActionUIElement(true);

	// disable the 'redo' button (since a new action was created, there's nothing to undo yet)
	updateEnabledStatus_RedoActionUIElement(false);
}

// this function tries adding a control property modify undo-redo step to the undo-redo list. Should be called whenever the user does an action that indicates they have possibly ended the 'update property' input phase
function addCtrlPropertyModifyStepToURSList() {
    // check if the user was editing a control
    if (editingProperty_IsModifyingProperty) {
	// user modified a property and then deselected the control; need to record the edit as an undo/redo step
	addModifyCtrlProperty_URS(selectedControl.id, editingProperty_PropName, editingProperty_NewPropValue, editingProperty_OldPropValue);
    }

    // reset editingProperty values to avoid old values leaking through to new changes
    editingProperty_PropName = "";
    editingProperty_NewPropValue = "";
    editingProperty_OldPropValue = false;
    editingProperty_IsModifyingProperty = false;
}





// =====UNDO-REDO RECORD CREATION FUNCTIONS=====

// adds an undo-redo object for a 'create control' event to the URS list
function addCreateCtrl_URS(createdControlID, createdControlType, parentControlID) {
	console.log("ADDING UNDO/REDO EVENT");

	// ===STEP FLOW===
	// undo: remove control by ID from parent
	// redo: create the control of the specified type in the parent control (accessed via ID)

	// declare the object
	const createCtrlURS = {
		stepType: "createControl",
		createdCtrlID: createdControlID,
		createdCtrlType: createdControlType,
		parentControlID: parentControlID
	};

	// add the record to the list
	undoRedoList_AddURS(createCtrlURS);
}

// this function undoes a 'create control' action by removing the control
function undoCreateCtrlAction(actionURS) {
	console.log("Undoing 'create control' [ID: " + 
		actionURS.createdCtrlID + "] [Type: " + 
		actionURS.createdCtrlType + "] [Parent Container ID: " +
		actionURS.parentControlID + "]");

	// run the 'delete control' event handler using the created control ID in actionURS
	// 1. Get control reference
	const ctrlToDelete = document.getElementById(actionURS.createdCtrlID);

	// 2. Select the control (if it isn't already)
	if (selectedControl != ctrlToDelete) {
		selectControl(ctrlToDelete, actionURS.createdCtrlType);
	}

	// 3. Run the 'delete control' function
	deleteControl(true);
}

// this function redoes a 'create control' action by adding the control
function redoCreateCtrlAction(actionURS) {
	console.log("Redoing 'create control' [ID: " + 
		actionURS.createdCtrlID + "] [Type: " + 
		actionURS.createdCtrlType + "] [Parent Container ID: " +
		actionURS.parentControlID + "]");

	// 1. Get a reference to the container via ID
	const parentContainerRef = document.getElementById(actionURS.parentControlID);
	// 2. Select the container (so the created control gets placed in the proper place)
	selectControl(parentContainerRef, parentContainerRef.dataset.controlType);
	// 3. Crate the control via controlTypeClicked
	createControl(
        	actionURS.createdCtrlType,
		true
    	);

	// set the control ID to match the step (to ensure it will properly delete the step)
	selectedControl.id = actionURS.createdCtrlID;
}






// adds an an undo-redo object for a 'delete control' event
function addDeleteCtrl_URS(deletedControlID, deletedControlType, deletedControlHTML, deletedControlPrevElemID, parentControlID) {
	// ===STEP FLOW===
	// undo: insert the deleted control HTML into the parent control (accessed via ID)
	// redo: remove the deleted control (accessed by ID) from the parent control

	// declare the object
	const deleteCtrlURS = {
		stepType: "deleteControl",
		deletedCtrlID: deletedControlID,
		deletedCtrlType: deletedControlType,
		deletedCtrlHTML: deletedControlHTML,
		deletedCtrlPrevElemID: deletedControlPrevElemID,
		parentCtrlID: parentControlID
	};

	// return the record
	undoRedoList_AddURS(deleteCtrlURS);
}

// this function undoes a 'delete control' action by adding the control HTML back
function undoDeleteCtrlAction(actionURS) {

	// insert the control's HTML into the parent
	// 1. Get a reference to the parent control
	const ctrlParent = document.getElementById(actionURS.parentCtrlID);
	const ctrlRef = document.getElementById(actionURS.deletedCtrlID);

	// 2. Insert the element before the previous element
	// -if previous element is null, insert at the top; otherwise, insert before the parent element
	if (actionURS.deletedCtrlPrevElemID == "") {
		// prepend the control
		ctrlParent.insertAdjacentHTML('afterbegin', actionURS.deletedCtrlHTML);
	} else {
		// insert the HTML before the previous control
		// *get a reference to the previous control
		prevCtrlRef = document.getElementById(actionURS.deletedCtrlPrevElemID);
		// *insert the HTML after the reference
		prevCtrlRef.insertAdjacentHTML('afterend', actionURS.deletedCtrlHTML);
	}

	// 3. Select the control
	selectControl(ctrlRef, actionURS.deletedControlType);
}

// this function redoes a 'delete control' action by removing the control from the page
function redoDeleteCtrlAction(actionURS) {
	// run the 'delete control' event handler using the created control ID in actionURS
	// 1. Get control reference
	const ctrlToDelete = document.getElementById(actionURS.deletedCtrlID);

	// 2. Select the control (if it isn't already)
	if (selectedControl != ctrlToDelete) {
		selectControl(ctrlToDelete, actionURS.deletedCtrlType);
	}

	// 3. Run the 'delete control' function
	deleteControl(true);
}





// adds an an undo-redo object for a 'modify control property' event
function addModifyCtrlProperty_URS(affectedControlID, modifiedPropertyName, newValue, originalValue) {
	// ===STEP FLOW===
	// undo: set the control property to the original value
	// redo: set the control property to the new value

	// declare the object
	const modifyCtrlPropertyURS = {
		stepType: "modifyControlProperty",
		modifiedCtrlID: affectedControlID,
		modifiedPropName: modifiedPropertyName,
		newPropValue: newValue,
		oldPropValue: originalValue
	};

	console.log("Affected Control ID: " + affectedControlID +
		    "\nProperty name: " + modifiedPropertyName +
		    "\nOld Value: " + originalValue +
		    "\nNew Value: " + newValue);

	// return the record
	undoRedoList_AddURS(modifyCtrlPropertyURS);
}

// this function undoes a 'modify control property' action by setting the original value
function undoModifyCtrlPropertyAction(actionURS) {
	// apply the old property to the control
	// 1. Get a reference to the control
	const ctrlRef = document.getElementById(actionURS.modifiedCtrlID);

	// 2. Apply the old property
	applyPropertyToControl(ctrlRef, 
			       actionURS.modifiedPropName,
			       actionURS.oldPropValue,
			       false,
			       true);

	// 3. Update the control property in the sidebar (by deselecting/reselecting)
    	loadControlPropertyValues(
        	ctrlRef
    	);
}

// this function redoes a 'modify control property' action by setting the new value
function redoModifyCtrlPropertyAction(actionURS) {
	// apply the new property to the control
	// 1. Get a reference to the control
	const ctrlRef = document.getElementById(actionURS.modifiedCtrlID);

	// 2. Apply the old property
	applyPropertyToControl(ctrlRef, 
			       actionURS.modifiedPropName,
			       actionURS.newPropValue,
			       false,
			       true);

	// 3. Update the control property in the sidebar (by deselecting/reselecting)
    	loadControlPropertyValues(
        	ctrlRef
    	);
}




// adds an an undo-redo object for a 'change control container' event
function addChangeControlContainer_URS(affectedControlID, originalCtrlContainerID, newCtrlContainerID) {
	// ===STEP FLOW===
	// undo: move the control to the original container (accessed via ID)
	// redo: move the control to the new container (accessed via ID)

	// declare the object
	const changeCtrlContainerURS = {
		stepType: "changeControlContainer",
		movedCtrlID: affectedControlID,
		originalContainerID: originalCtrlContainerID,
		newContainerID: newCtrlContainerID,
	};

	// return the record
	undoRedoList_AddURS(changeCtrlContainerURS);
}

// this function undoes a 'change control container' action by moving the control to the original container
function undoChangeCtrlContainerAction(actionURS) {
	// move the control to the original container
	// 1. Get a reference to the control
	const ctrlRef = document.getElementById(actionURS.movedCtrlID);
	const containerRef = document.getElementById(actionURS.originalContainerID);

	// 2. Move the control
	moveElementToContainer(containerRef, ctrlRef, true);
}

// this function redoes a 'change control container' action by moving the control to the new container
function redoChangeCtrlContainerAction(actionURS) {
	// move the control to the new container
	// 1. Get a reference to the control
	const ctrlRef = document.getElementById(actionURS.movedCtrlID);
	const containerRef = document.getElementById(actionURS.newContainerID);

	// 2. Move the control
	moveElementToContainer(containerRef, ctrlRef, true);
}




// adds an an undo-redo object for a 'change control display order' event. For moveDirection, provide the string 'up' or 'down' (for 'move display order up' and 'move display order down' respectively)
function addChangeCtrlDisplayOrder_URS(affectedControlID, moveDirection) {
	// ===STEP FLOW===
	// undo: move the control ahead of the original prior [in display order] control (accessed by ID)
	// redo: move the control ahead of the new prior [in display order] control (accessed by ID)

	// declare the object
	const changeCtrlDisplayOrderURS = {
		stepType: "changeControlDisplayOrder",
		movedCtrlID: affectedControlID,
		moveDir: moveDirection
	};

	// return the record
	undoRedoList_AddURS(changeCtrlDisplayOrderURS);
}

// this function undoes a 'change control display order' action by setting the control to the original display order
function undoChangeCtrlDisplayOrderAction(actionURS) {
	// 1. Get a reference to the control to move
	const ctrlRef = document.getElementById(actionURS.movedCtrlID);

	// 2. Select the control (if not already selected)
	if (selectedControl != ctrlRef) {
		selectControl(ctrlRef, ctrlRef.dataset.controlType);
	}

	console.log("MOVING DOWN");

	// 3. Change the control display order based on the 'moveDir' field (in the opposite direction, since this function undoes the step)
	switch (actionURS.moveDir.toLowerCase()) {
		case "up":
			// move the display order down
			console.log("Moving display order down");
			mdodBtn_OnClick(true);
			break;
		case "down":
			// move the display order up
			console.log("Moving display order up");
			mdouBtn_OnClick(true);
			break;
	}
}

// this function undoes a 'change control display order' action by setting the control to the new display order
function redoChangeCtrlDisplayOrderAction(actionURS) {
	// 1. Get a reference to the control to move
	const ctrlRef = document.getElementById(actionURS.movedCtrlID);

	// 2. Select the control (if not already selected)
	if (selectedControl != ctrlRef) {
		selectControl(ctrlRef, ctrlRef.dataset.controlType);
	}

	// 3. Change the control display order based on the 'moveDir' field
	switch (actionURS.moveDir.toLowerCase()) {
		case "up":
			// move the display order down
			mdouBtn_OnClick(true);
			break;
		case "down":
			// move the display order up
			mdodBtn_OnClick(true);
			break;
	}
}