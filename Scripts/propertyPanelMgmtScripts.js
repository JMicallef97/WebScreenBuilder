function hideAllPropertyControls() {

    const rows =
        document.querySelectorAll(
            "#propertiesContent .property-row"
        );

    rows.forEach(
        function(row) {
            row.style.display = "none";
        }
    );
}


function updateVisibleProperties(controlType) {

    const definition =
        getControlPropertiesDefinition();


    hideAllPropertyControls();


    const visibleProperties =
        new Set();


    /*
     * Common properties apply to every control.
     */
    definition.commonProperties.forEach(
        function(propertyName) {
            visibleProperties.add(
                propertyName
            );
        }
    );


    /*
     * Find the properties specific to this
     * control type.
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
                visibleProperties.add(
                    propertyName
                );
            }
        );
    }


    /*
     * Make the applicable properties visible.
     */
    visibleProperties.forEach(
        function(propertyName) {

            const row =
                document.querySelector(
                    "#propertiesContent " +
                    '.property-row[data-property="' +
                    CSS.escape(propertyName) +
                    '"]'
                );

            if (row) {
                row.style.display = "grid";
            }
        }
    );
}



function getControlPropertyValue(
    control,
    propertyName
) {
    if (propertyName === "text") {
        return control.textContent;
    }

    if (propertyName === "value") {
        return control.value || "";
    }

    if (propertyName === "placeholder") {
        return control.placeholder || "";
    }

    if (propertyName === "visible") {
        return (
            control.style.display !== "none"
        );
    }

    if (propertyName === "enabled") {
        return !control.disabled;
    }

    //console.log(propertyName + " PROPERTY NAME");

    switch (propertyName) {

        case "width":
            return (control.style.width ? control.style.width : "");
	    break;

        case "height":
            return (control.style.height ? control.style.height : "");
	    break;

        case "padding":
            return (control.style.padding ? control.style.padding : "");
	    break;

        case "margin":
            return (control.style.margin ? control.style.margin : "");
	    break;

        case "backgroundColor":
            return (control.style.backgroundColor ? 
		convertColorToHex(control.style.backgroundColor) :
		"");
	    break;

        case "foregroundColor":
            return (control.style.color ? 
		convertColorToHex(control.style.color) :
		"");
	    break;

        case "fontSize":
            return (control.style.fontSize ? control.style.fontSize : "");
	    break;

        case "fontFamily":
            return (control.style.fontFamily ? control.style.fontFamily : "");
	    break;

        case "borderColor":
            return (control.style.borderColor ? 
		convertColorToHex(control.style.borderColor) :
		"");
	    break;

	case "borderStyle":
	    return (control.style.borderStyle ? control.style.borderStyle : "");
	    break;

        case "borderWidth":
            return (control.style.borderWidth ? control.style.borderWidth : "");
	    break;

        case "borderRadius":
            return (control.style.borderRadius ? control.style.borderRadius : "");
	    break;

        case "display":
            return (control.style.display ? control.style.display : "");
	    break;

	case "flex-direction":
	    return (control.style.flexDirection ? control.style.flexDirection : "");
	    break;

	case "justify-content":
	    return (control.style.justifyContent ? control.style.justifyContent : "");
	    break;

	case "align-items":
	    return (control.style.alignItems ? control.style.alignItems : "");
	    break;

	case "gap":
	    return (control.style.gap ? control.style.gap : "");
	    break;

	case "flex-wrap":
	    return (control.style.flexWrap ? control.style.flexWrap : "");
	    break;

	case "grid-template-columns":
	    return (control.style.gridTemplateColumns ? control.style.gridTemplateColumns : "");
	    break;

	case "grid-template-rows":
	    return (control.style.gridTemplateRows ? control.style.gridTemplateRows : "");
	    break;

	case "position":
	    return (control.style.position ? control.style.position : "");
	    break;

	case "box-sizing":
	    return (control.style.boxSizing ? control.style.boxSizing : "");
	    break;
	
	case "linkTarget":
	    return (control.href ? control.href : "");
	    break;

	case "text-align":
	    //console.log(control.style.textAlign + " READ TEXT ALIGN");
	    return (control.style.textAlign ? control.style.textAlign : "");
	    break;

	case "borderCollapse":
	    return (control.style.borderCollapse ? control.style.borderCollapse : "");
	    break;

	case "verticalAlign":
	    return (control.style.verticalAlign ? control.style.verticalAlign : "");
	    break;

	case "Table Caption":
	    return (control.caption ? (control.caption.textContent ? control.caption.textContent : "") : "");
	    break;

	case "Table Column Count":
	    return control.rows ? (control.rows.length > 0 ? control.rows[0].cells.length : 0) : 0;
	    break;

	case "Table Row Count":
	    return (control.rows ? (control.rows.length ? control.rows.length : "") : 0);
	    break;
	
	case "listItems":
	    // determine control type to determine which method to call
	    if (control.dataset.controlType == "Searchable Dropdown List") {
	    	return getSearchableTextboxItemsAsLSV(control);
	    } else {
	    	return getListItemsAsLSV(control);
	    }
	    break;

	case "dropdownItems":
	    return getDropdownItemsAsLSV(control);
	    break;

		// event handlers
	case "OnClick Event":
	    return control.getAttribute("onclick");
	    break;
	case "OnDoubleClick Event":
	    return control.getAttribute("ondblclick");
	    break;
	case "OnChange Event":
	    return control.getAttribute("onchange");
	    break;
	case "OnInput Event":
	    return control.getAttribute("oninput");
	    break;
	case "OnFocus Event":
	    return control.getAttribute("onfocus");
	    break;
	case "OnBlur Event":
	    return control.getAttribute("onblur");
	    break;
	case "OnKeyDown Event":
	    return control.getAttribute("onkeydown");
	    break;
	case "OnKeyUp Event":
	    return control.getAttribute("onkeyup");
	    break;
	case "OnSelect Event":
	    return control.getAttribute("onselect");
	    break;
	case "OnMouseDown Event":
	    return control.getAttribute("onmousedown");
	    break;
	case "OnMouseUp Event":
	    return control.getAttribute("onmouseup");
	    break;
	case "OnMouseOver Event":
	    return control.getAttribute("onmouseover");
	    break;
	case "OnMouseOut Event":
	    return control.getAttribute("onmouseout");
	    break;
	case "OnMouseEnter Event":
	    return control.getAttribute("onmouseenter");
	    break;
	case "OnMouseLeave Event":
	    return control.getAttribute("onmouseleave");
	    break;

        default:
            return "";
    }
}


function resetPropertyEditorValues() {

   const editors =
        document.querySelectorAll(
            "#propertiesContent .property-editor"
        );

    editors.forEach(
        function(editor) {

            const propertyName =
                editor.dataset.property;


            const definition =
                propertyDefinitions[
                    propertyName
                ];


            if (!definition) {
                return;
            }


            const defaultValue =
                definition.defaultValue;


            if (
                definition.dataType ===
                "boolean"
            ) {

                editor.checked =
                    defaultValue;

            } else {

                editor.value =
                    defaultValue;
            }
        }
    );
}



function loadControlPropertyValues(
    control
) {
	const editors =
        document.querySelectorAll(
            ".property-editor"
        );


    editors.forEach(
        function(editor) {

            const propertyName =
                editor.dataset.property;

            const definition =
                propertyDefinitions[
                    propertyName
                ];


            if (!definition) {
                return;
            }


            const value =
                getControlPropertyValue(
                    control,
                    propertyName
                );


            const numberWrapper =
                document.querySelector(
                    '.number-property-editor[data-property="' +
                    propertyName +
                    '"]'
                );


            if (numberWrapper) {

                setNumberPropertyEditorValue(
                    numberWrapper,
                    value
                );

                return;
            }


            if (definition.dataType.toLowerCase() === "boolean") {
                editor.checked =
                    value;
            } else {
                editor.value =
                    value;
            }

	    // suppress the property setting checkbox (since its value will be changed
	    const applySettingCB = document.getElementById(propertyName + "ApplyCB");
	    applySettingCB.dataset.suppressUpdate = "true";

	    // set the check state of the property based on if the element has the property set or not
	    applySettingCB.checked = (value != "");

	    // reset the suppress update flag on the checkbox (to allow it to have an effect)
	    applySettingCB.dataset.suppressUpdate = "false";
        }
    );
}

function getPropertyEditorValue(editor) {
    /*
     * Number property.
     */
    if (
        editor.dataset.numberProperty ===
        "true"
    ) {

        const numberInput =
            editor.querySelector(
                ".property-editor"
            );

        const unitSelect =
            editor.querySelector(
                ".property-unit-editor"
            );


        const number =
            numberInput.value;

        const unit =
            unitSelect.value;


        if (number === "") {
            return "";
        }


        return number + unit;
    }


    /*
     * Normal property editor.
     */
    const propertyName =
        editor.dataset.property;

    const definition =
        propertyDefinitions[propertyName];


    if (!definition) {
        return editor.value;
    }

    const dataType =
        definition.dataType.toLowerCase();

    switch (dataType) {

        case "boolean":
            return editor.checked;
	case "filepicker_img":
	    return editor.selectedImgBase64String;

        case "color":
        case "string":
	case "naturalNumber":
	case "listitems":
        default:
            return editor.value;
    }
}

function setElementIdentityFieldsEnabled(
    enabled
) {

    const fields = [
        "elementName",
        "elementId",
        "elementClass"
    ];


    fields.forEach(
        function(fieldId) {

            const field =
                document.getElementById(
                    fieldId
                );


            if (field) {
                field.disabled =
                    !enabled;
            }
        }
    );
}

function setElementClass(
    control,
    classText
) {

    /*
     * Preserve the editor's internal class.
     */
    const editorClasses = [
        "created-control"
    ];


    /*
     * Remove existing user classes.
     */
    control.classList.remove(
        ...Array.from(
            control.classList
        ).filter(
            function(className) {
                return (
                    !editorClasses.includes(
                        className
                    )
                );
            }
        )
    );


    /*
     * Add the user's classes.
     */
    classText
        .split(/\s+/)
        .filter(
            function(className) {
                return className.length > 0;
            }
        )
        .forEach(
            function(className) {

                control.classList.add(
                    className
                );
            }
        );
}