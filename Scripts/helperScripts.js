// this function returns an auto-generated ID (as a string) given a control type
function autoGenerateControlID(controlType) {
	// auto-generated id is simply [controlType][#]	
	let generatedControlID = controlType.toString() + autoAssignIDCounter.toString();

	// keep incrementing autoAssignIDCounter until a new, unique name is reached
	while (document.getElementById(generatedControlID)) {
		// increment autoAssignIDCounter to ensure next control name is unique no matter what
		autoAssignIDCounter += 1;
		generatedControlID = controlType.toString() + autoAssignIDCounter.toString();
	}

	// return the ID to apply to the control
	return generatedControlID;
}

// this function checks if HTML elements in an HTML string have unique IDs. If not, it updates them to have unique IDs (not found elsewhere in the document) and returns a string with the updated element IDs.
function applyUniqueIDsToHTMLElements(html) {
  const template = document.createElement('template');
  template.innerHTML = html;

  // IDs already present in the current document.
  const usedIds = new Set(
    Array.from(document.querySelectorAll('[id]'), el => el.id)
  );

  // Also track IDs we're adding/encountering in the supplied HTML.
  const generatedIds = new Set();

  // Elements whose IDs don't need to be unique.
  //const ignoredTags = new Set(['TD', 'TH', 'OPTION', 'LI']);
  const ignoredTags = new Set([]);

  let counter = 0;

  function generateId() {
    let id;

    do {
      id = `generated-id-${++counter}`;
    } while (usedIds.has(id) || generatedIds.has(id));

    generatedIds.add(id);
    return id;
  }

  for (const element of template.content.querySelectorAll('*')) {
    if (ignoredTags.has(element.tagName)) {
      continue;
    }

    const id = element.getAttribute('id');

    // No ID: give the element one.
    if (!id) {
      element.id = generateId();
      continue;
    }

    // ID is already used in the document or by another element
    // in this HTML: replace it.
    if (usedIds.has(id) || generatedIds.has(id)) {
      element.id = generateId();
    } else {
      generatedIds.add(id);
    }
  }

  return template.innerHTML;
}

// returns a string containing the default value of an HTML element property/setting
function getDefaultPropertyValue(propertyName) {
    switch (propertyName) {
	default:
		return "";
		break;
    }
}

function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    return `rgb(${r}, ${g}, ${b})`;
}


function getColorLuminance(color) {
    const temporaryElement = document.createElement("div");

    temporaryElement.style.color = color;

    document.body.appendChild(temporaryElement);

    const computedColor =
        getComputedStyle(temporaryElement).color;

    document.body.removeChild(temporaryElement);

    const match =
        computedColor.match(
            /rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/
        );

    if (!match) {
        return 0.5;
    }

    const r = parseInt(match[1], 10) / 255;
    const g = parseInt(match[2], 10) / 255;
    const b = parseInt(match[3], 10) / 255;

    const adjustedR =
        r <= 0.03928
            ? r / 12.92
            : Math.pow((r + 0.055) / 1.055, 2.4);

    const adjustedG =
        g <= 0.03928
            ? g / 12.92
            : Math.pow((g + 0.055) / 1.055, 2.4);

    const adjustedB =
        b <= 0.03928
            ? b / 12.92
            : Math.pow((b + 0.055) / 1.055, 2.4);

    return (
        0.2126 * adjustedR +
        0.7152 * adjustedG +
        0.0722 * adjustedB
    );
}


function getContrastingRandomColor(parentColor) {
    let color;
    let attempts = 0;

    const parentLuminance =
        getColorLuminance(parentColor);

    do {
        color = getRandomColor();

        const colorLuminance =
            getColorLuminance(color);

        if (
            Math.abs(
                colorLuminance - parentLuminance
            ) >= 0.30
        ) {
            return color;
        }

        attempts++;

    } while (attempts < 100);

    return parentLuminance > 0.5
        ? "rgb(40, 40, 40)"
        : "rgb(220, 220, 220)";
}


function getElementBackgroundColor(element) {
    const color =
        getComputedStyle(element).backgroundColor;

    if (
        color === "rgba(0, 0, 0, 0)" ||
        color === "transparent"
    ) {
        if (element.parentElement) {
            return getElementBackgroundColor(
                element.parentElement
            );
        }

        return "rgb(255, 255, 255)";
    }

    return color;
}

function convertColorToHex(color) {

    if (!color) {
        return "#000000";
    }


    if (color.startsWith("#")) {
        return color;
    }


    const match =
        color.match(
            /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/
        );


    if (!match) {
        return "#000000";
    }


    const r =
        parseInt(match[1], 10)
            .toString(16)
            .padStart(2, "0");

    const g =
        parseInt(match[2], 10)
            .toString(16)
            .padStart(2, "0");

    const b =
        parseInt(match[3], 10)
            .toString(16)
            .padStart(2, "0");


    return "#" + r + g + b;
}



// CSS number unit validation helper functions


function normalizeCSSNumber(value) {

    value = value.trim();


    if (value === "") {
        return "";
    }


    /*
     * A plain numeric value gets px.
     *
     * Examples:
     *
     * 10      -> 10px
     * 10.5    -> 10.5px
     * -20     -> -20px
     * +5      -> 5px
     */
    if (
        /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(
            value
        )
    ) {
        return value + "px";
    }


    /*
     * Otherwise leave the CSS value unchanged.
     *
     * This permits values such as:
     *
     * 10px
     * 1.5em
     * 2rem
     * 50%
     * 10vw
     * 5vh
     * 10vmin
     * 2ch
     * 3ex
     * 1cm
     * 5mm
     * 1in
     * 10pt
     * 2pc
     * 0
     * calc(...)
     * min(...)
     * max(...)
     * clamp(...)
     */
    return value;
}

function isValidCSSValue(
    propertyName,
    value
) {

    if (value === "") {
        return true;
    }


    const cssProperty =
        getCSSPropertyName(
            propertyName
        );


    return CSS.supports(
        cssProperty,
        value
    );
}

function getCSSPropertyName(
    propertyName
) {

    const propertyMap = {

        backgroundColor:
            "background-color",

        foregroundColor:
            "color",

        fontSize:
            "font-size",

        fontFamily:
            "font-family",

        borderColor:
            "border-color",

        borderWidth:
            "border-width",

        borderRadius:
            "border-radius",

        padding:
            "padding",

        margin:
            "margin",

        width:
            "width",

        height:
            "height",

        display:
            "display"
    };


    return (
        propertyMap[propertyName] ||
        propertyName
    );
}

function getHTMLTagForControlType(
    controlType
) {
    switch (controlType.toLowerCase()) {

	// text controls
	case "heading 1":
	    return "h1";
	case "heading 2":
	    return "h2";
	case "heading 3":
	    return "h3";
	case "heading 4":
	    return "h4";
	case "paragraph":
	    return "p";
	case "hyperlink":
	    return "a";
	case "bullet point list":
	    return "ul";
	case "numbered list":
	    return "ol";

        case "button":
            return "button";

        case "textbox":
        case "text box":
        case "checkbox":
        case "input":
	case "searchable dropdown list":
            return "input";

	case "table":
	    return "table";

        case "textarea":
	case "multiline textbox":
            return "textarea";

        case "dropdown list":
	case "listbox":
            return "select";

        case "div":
        case "container":
            return "div";

        case "label":
            return "label";

        case "image":
        case "img":
            return "img";

	// lists
	case "bullet point list":
	    return "ul";
	case "numbered list":
	    return "ol";

        default:
            /*
             * Default to a div for unknown
             * control types.
             */
            return "div";
    }
}

function getInputTypeForControlType(
    controlType
) {

    switch (controlType.toLowerCase()) {

        case "textbox":
        case "text box":
        case "input":
            return "text";

        case "checkbox":
            return "checkbox";

        case "radio":
        case "radiobutton":
        case "radio button":
            return "radio";

        case "number":
        case "numberbox":
        case "number box":
            return "number";

        case "password":
        case "passwordbox":
        case "password box":
            return "password";

        case "email":
            return "email";

        case "date":
            return "date";

        case "time":
            return "time";

        case "color":
        case "colorpicker":
        case "color picker":
            return "color";

        default:
            return "text";
    }
}

// gets a reference to the first (visible) element higher up in the display order of the container 'element' is in
function getPreviousDisplayOrderedElement(element) {
    let sibling = element.previousElementSibling;

    while (sibling) {
        if (getComputedStyle(sibling).display !== "none") {
            return sibling;
        }
        sibling = sibling.previousElementSibling;
    }

    return null;
}

// gets a reference to the first (visible) element lower down in the display order of the container 'element' is in
function getNextDisplayOrderedElement(element) {
    let sibling = element.nextElementSibling;

    while (sibling) {
        if (getComputedStyle(sibling).display !== "none") {
            return sibling;
        }
        sibling = sibling.nextElementSibling;
    }

    return null;
}

// this function moves the control referenced with the 'controlRef' parameter into the container control referenced with the 'newContainerRef'. 
// -If newContainerRef is null, isn't a container control type (can check by running the 'isContainerControl'), controlRef is null, or either parameter isn't an HTML element, nothing will happen.
function moveElementToContainer(newContainerRef, controlRef) {
	// error checks
	if (newContainerRef == null || controlRef == null || !checkifVariableIsDOMElement(newContainerRef) || !checkifVariableIsDOMElement(controlRef) || !isContainerControl(newContainerRef.dataset.controlType)) {
		console.log("Couldn't move control; one or more conditions are incorrect (newContainerRef is null, controlRef is null, or newContainer ref isn't a container control type");
		return;
	}

	// move the parent control
	newContainerRef.appendChild(controlRef);

	// depending on control type, move child controls
	switch (controlRef.dataset.controlType) {
		case "Searchable Dropdown List":
			// move the dropdown div
			newContainerRef.appendChild(document.getElementById(controlRef.dropdownDivID));
			break;
	}
}

// this function returns a boolean indicating if the variable provided for the 'varToCheck' parameter is an element in the DOM or not
function checkifVariableIsDOMElement(varToCheck) {
	return varToCheck instanceof HTMLElement;
}

// update the status of the 'move display order up' and 'move display order down' buttons for the selected control.
// -If no control is selected, this function will return without doing anything
function updateCtrlDisplayOrderAdjustmentBtns() {
	// error checks (need to ensure selectedControl is not null, otherwise function won't work)
	if (selectedControl == null) {
		return;
	}

	// update the movement button enabled state (since control display order changed)
	const canMoveCtrlDisplayOrderUp = (getPreviousDisplayOrderedElement(selectedControl) == null);
    	const canMoveCtrlDisplayOrderDown = (getNextDisplayOrderedElement(selectedControl) == null);

    // update the action buttons based on the control state
    document.getElementById("changeElemDivOrderUpBtn").disabled = canMoveCtrlDisplayOrderUp;
    document.getElementById("changeElemDivOrderDownBtn").disabled = canMoveCtrlDisplayOrderDown;
}