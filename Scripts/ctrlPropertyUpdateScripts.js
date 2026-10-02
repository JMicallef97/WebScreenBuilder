function applyPropertyChange(
    propertyName,
    value
) {

    if (!selectedControl) {
        return;
    }

    applyPropertyToControl(
        selectedControl,
        propertyName,
        value
    );
}


function applyPropertyToControl(
    control,
    propertyName,
    value,
    isInitialCtrlSetup = false,
    isCtrlPropertyModifyURAction = false // indicates if this function is being called to undo or redo a 'modify control property' action
) {

    if (!control) {
        console.warn(
            "No control selected."
        );

        return;
    }

    console.log(
        "Applying property to control '" + control.id + "':",
        propertyName,
        "value:",
        value
    );


    if (!isInitialCtrlSetup && !isCtrlPropertyModifyURAction) {

	// check if the control type is 

    	// update/manage property-editing data (for undo/redo system)
    	if (editingProperty_PropName != "" && editingProperty_PropName != propertyName) {
		// control property being edited has changed; add a 'change control property' step
		addModifyCtrlProperty_URS(control.id, editingProperty_PropName, editingProperty_NewPropValue, editingProperty_OldPropValue);

		// get existing property value of current control property (to use as 'old value' when the step is added)
		editingProperty_OldPropValue = getControlPropertyValue(control, propertyName);

    	} else if (editingProperty_PropName == "") {
		// set initial edited property
		editingProperty_OldPropValue = getControlPropertyValue(control, propertyName);
	}

    	// update the value of the edited property & name (to put into a 'edit property' undo-redo step)
	editingProperty_PropName = propertyName;
    	editingProperty_NewPropValue = value;

	// set flag recording change
	editingProperty_IsModifyingProperty = true;
    }

    switch (propertyName) {

        case "text":
            control.textContent = value;
            break;

        case "value":
            control.value = value;
            break;

        case "placeholder":
            control.placeholder = value;
            break;

        case "width":
            control.style.width = value;
            break;

        case "height":
            control.style.height = value;
            break;

        case "padding":
            control.style.padding = value;
            break;

        case "margin":
            control.style.margin = value;
            break;

        case "backgroundColor":
            control.style.backgroundColor = value;
            break;

        case "foregroundColor":
            control.style.color = value;
            break;

        case "fontSize":
            control.style.fontSize = value;
            break;

        case "fontFamily":
            control.style.fontFamily = value;
            break;

	case "borderStyle":
            control.style.borderStyle = value;
	    break;

        case "borderColor":
            control.style.borderColor = value;
            break;

        case "borderWidth":
            control.style.borderWidth = value;
            break;

        case "borderRadius":
            control.style.borderRadius = value;
            break;

        case "display":
            control.style.display = value;
            break;

        case "visible":
            control.style.display =
                value ? "" : "none";
            break;

        case "enabled":
            control.disabled = !value;
            break;

	case "display":
	    control.style.display = value;
	    break;

	case "flex-direction":
 	    control.style.flexDirection = value;
	    break;

	case "justify-content":
 	    control.style.justifyContent = value;
	    break;

	case "align-items":
 	    control.style.alignItems = value;
	    break;

	case "gap":
 	    control.style.gap = value;
	    break;

	case "flex-wrap":
 	    control.style.flexWrap = value;
	    break;

	case "grid-template-columns":
	    console.log("TODO; input validation");
 	    control.style.gridTemplateColumns = value;
	    break;

	case "grid-template-rows":
	    console.log("TODO; input validation");
 	    control.style.gridTemplateRows = value;
	    break;

	case "position":
 	    control.style.position = value;
	    break;

	case "box-sizing":
 	    control.style.boxSizing = value;
	    break;

	case "imgSrc":
	    control.src = value;
	    break;
	
	case "text-align":
	    control.style.textAlign = value;
	    break;

	case "linkTarget":
	    control.href = value;
	    control.target = "_blank"; // open in a new window
	    break;

	case "borderCollapse":
	    control.style.borderCollapse = value;
		console.log("NEW BORDER COLLAPSE VALUE: " + control.style.borderCollapse);
	    break;

	case "verticalAlign":
	    control.style.verticalAlign = value;
	    break;

	case "Table Caption":
	    control.createCaption().textContent = value;
	    break;

	case "Table Column Count":
	    updateTableDimension(control, parseInt(value, 10), "columns");
	    break;

	case "Table Row Count":
	    updateTableDimension(control, parseInt(value, 10), "rows");
	    break;

	case "listItems":
	    console.log(control.tagName + " ITEM TAG NAME");

	    if (control.tagName == "INPUT") {
		// refers to a searchable textbox
		setSearchableTextboxItemsFromLSVStr(control, value);
	    	console.log("TODO; UPDATE ITEMS");
	    } else {
	    	setListItemsFromLSVStr(control, value);
	    }
	    break;

	case "dropdownItems":
	    setDropdownItemsFromLSVStr(control, value);
	    break;

	// event handlers
	case "OnClick Event":
	    control.setAttribute("onclick", value);
	    break;
	case "OnDoubleClick Event":
	    control.setAttribute("ondblclick", value);
	    break;
	case "OnChange Event":
	    control.setAttribute("onchange", value);
	    break;
	case "OnInput Event":
	    control.setAttribute("oninput", value);
	    break;
	case "OnFocus Event":
	    control.setAttribute("onfocus", value);
	    break;
	case "OnBlur Event":
	    control.setAttribute("onblur", value);
	    break;
	case "OnKeyDown Event":
	    control.setAttribute("onkeydown", value);
	    break;
	case "OnKeyUp Event":
	    control.setAttribute("onkeyup", value);
	    break;
	case "OnSelect Event":
	    control.setAttribute("onselect", value);
	    break;
	case "OnMouseDown Event":
	    control.setAttribute("onmousedown", value);
	    break;
	case "OnMouseUp Event":
	    control.setAttribute("onmouseup", value);
	    break;
	case "OnMouseOver Event":
	    control.setAttribute("onmouseover", value);
	    break;
	case "OnMouseOut Event":
	    control.setAttribute("onmouseout", value);
	    break;
	case "OnMouseEnter Event":
	    control.setAttribute("onmouseenter", value);
	    break;
	case "OnMouseLeave Event":
	    control.setAttribute("onmouseleave", value);
	    break;

        default:
            console.warn(
                "Unknown property:",
                propertyName
            );
            break;
    }
}

function setNumberPropertyEditorValue(
    editor,
    value
) {

    const numberInput =
        editor.querySelector(
            ".property-editor"
        );

    const unitSelect =
        editor.querySelector(
            ".property-unit-editor"
        );


    if (!numberInput || !unitSelect) {
        return;
    }


    if (
        typeof value !== "string"
    ) {
        value =
            String(value);
    }


    /*
     * Extract the numeric portion.
     */
    const match =
        value.match(
            /^([+-]?(?:\d+\.?\d*|\.\d+))(.*)$/
        );


    if (!match) {

        numberInput.value =
            "";

        unitSelect.value =
            "px";

        return;
    }


    numberInput.value =
        match[1];


    const unit =
        match[2] || "px";


    /*
     * Select the unit if it exists
     * in the combobox.
     */
    const option =
        Array.from(
            unitSelect.options
        ).find(
            function(option) {
                return (
                    option.value === unit
                );
            }
        );


    if (option) {
        unitSelect.value =
            unit;
    } else {
        /*
         * Fall back to px if the unit isn't
         * one of the supported choices.
         */
        unitSelect.value =
            "px";
    }
}