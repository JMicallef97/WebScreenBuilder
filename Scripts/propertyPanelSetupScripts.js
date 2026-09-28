/*
* Creates the appropriate editing control for a property.
*/
function createPropertyEditor(
    propertyName,
    dataType,
    itemEnumeratedValues=""
) {
    let editor;
    switch (dataType.toLowerCase()) {

        case "color":
            editor =
                document.createElement("input");

            editor.type = "color";
            editor.className =
                "property-editor";

            editor.dataset.property =
                propertyName;

            return editor;


        case "number": {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "number-property-editor";


            const numberInput =
                document.createElement("input");

            numberInput.type = "number";

            numberInput.className =
                "property-editor";

            numberInput.dataset.property =
                propertyName;

            numberInput.dataset.numberPart =
                "value";


            const unitSelect =
                document.createElement("select");

            unitSelect.className =
                "property-unit-editor";

            unitSelect.dataset.property =
                propertyName;

            unitSelect.dataset.numberPart =
                "unit";


            const units = [
                "px",
                "em",
                "rem",
                "%",
                "vw",
                "vh",
                "vmin",
                "vmax",
                "ch",
                "ex",
                "cm",
                "mm",
                "in",
                "pt",
                "pc"
            ];


            units.forEach(
                function(unit) {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        unit;

                    option.textContent =
                        unit;

                    unitSelect.appendChild(
                        option
                    );
                }
            );


            wrapper.appendChild(
                numberInput
            );

            wrapper.appendChild(
                unitSelect
            );


            /*
             * The wrapper itself is returned so
             * the property row can contain both
             * controls.
             */
            wrapper.dataset.property =
                propertyName;

            wrapper.dataset.numberProperty =
                "true";


            return wrapper;
        }

	case "naturalnumber":
	    // include a numeric up-down control
	    editor = document.createElement("input");
	    editor.type = "number";
	    editor.className = "property-editor";
	    editor.dataset.property = propertyName;
            return editor;    

	    break;

	case "enum":
	    // enumerated type. List of values is an array (the last item in the JSON entry)
	    editor = document.createElement("select");
	    editor.className = "property-editor";
	    editor.dataset.property = propertyName;

	    // ensure itemEnumeratedValues is not null to avoid errors
	    if (itemEnumeratedValues != null) {
	    // populate the combobox with the enumerated values taken from the property definition
	    for (let i = 0; i < itemEnumeratedValues.length; i++ ) {
                    	const option =
                        	document.createElement(
                            	"option"
                        	);

                    	option.value =
                        	itemEnumeratedValues[i];

                    	option.textContent =
                        	itemEnumeratedValues[i];

                    	editor.add(
                        	option
                    	);
                }
	    }
            return editor;

	    break;
		

        case "boolean":
            editor =
                document.createElement("input");
            editor.type = "checkbox";
            break;

	case "multilinetext":
	    editor = document.createElement("textarea");
	    editor.style.resize = "vertical";
	    break;

        case "string":
        default:
            editor =
                document.createElement("input");
            editor.type = "text";
            break;

	case "filepicker_img":
	    // create a button linked to the 'pickFile' event handler
	    editor = document.createElement("button");
	    editor.textContent = "Select Image";
            editor.className = "property-editor";
    	    editor.dataset.property = propertyName;

	    editor.addEventListener('click', 
		async function(event) {
			const imgFileData = await loadImageAsBase64();

			// store the image base64 string and file name in the selection button (for retrieval later)
			editor.selectedImgBase64String = imgFileData[0];
			editor.selectedImgFileName = imgFileData[1];

			//console.log(editor.selectedImgBase64String.length + " BASE 64 STR LENGTH");
			// update the button text with the filename so the user can keep track of what images are being used
			editor.textContent = imgFileData[1];
			// trigger an update event
			editor.dispatchEvent(new Event("change", { bubbles: true }));
		});

            //return editor;
	    break;
    }

    editor.className =
        "property-editor";

    editor.dataset.property =
        propertyName;

    return editor;
}


    /*
     * Creates one property row.
     *
     * The row is initially hidden. Visibility is controlled
     * by updateVisibleProperties().
     */
    function createPropertyRow(
        propertyName,
        dataType,
        description,
	enumeratedItems = null
    ) {
        const row = document.createElement("div");

        row.className = "property-row";
        row.dataset.property = propertyName;

        /*
         * Hide the property initially.
         */
        row.style.display = "none";

        /*
         * Property label.
         */
        const label = document.createElement("label");

        label.className = "property-label";
        label.textContent = propertyName;
        label.title = description;

        /*
         * Property editor.
         */
        const editor =
            createPropertyEditor(
                propertyName,
                dataType,
		enumeratedItems
            );

        editor.id = "property-" + propertyName;


	/*
	 * Property apply checkbox
	 */
	const propertyApplyCB = document.createElement('input');
	propertyApplyCB.id = propertyName + "ApplyCB";
	propertyApplyCB.type = 'checkbox';
	propertyApplyCB.checked = true;
	propertyApplyCB.dataset.propertyName = propertyName;
	propertyApplyCB.dataset.attachedPropertyEditorID = editor.id;
	propertyApplyCB.dataset.suppressUpdate = "false"; // a boolean indicating if the update should be suppressed (I.E. when setting the value after selecting an element)
	propertyApplyCB.addEventListener('change', (event) => {
		
		// ensure the update isn't suppressed to avoid making unwanted changes
		if (propertyApplyCB.dataset.suppressUpdate == "false") {
			// based on the check value, either apply the setting or erase it (substitute a blank value)
			if (event.target.checked) {
    				applyPropertyChange(event.target.dataset.propertyName, getPropertyEditorValue(document.getElementById(event.target.dataset.attachedPropertyEditorID)));
  			} else {

				// apply the default value here (for some settings it's a blank string; for others, it is a specific setting)
    				applyPropertyChange(
					propertyApplyCB.dataset.propertyName, 
					getDefaultPropertyValue(propertyApplyCB.dataset.propertyName));
  			}
		}
	});

        label.htmlFor = editor.id;

	row.appendChild(propertyApplyCB);
        row.appendChild(label);
        row.appendChild(editor);

        return row;
    }


/*
* Loads every property from propertydefs and creates
* its corresponding editor in the property panel.
*
* All properties are initially hidden.
*/
function initializePropertiesPanel() {

    const propertiesPanel =
        document.getElementById(
            "propertiesContent"
        );

    if (!propertiesPanel) {
        console.error(
            "Could not find propertiesContent."
        );

        return;
    }

    /*
     * Clear the existing property panel.
     */
    propertiesPanel.innerHTML = "";


    /*
     * Make the property panel a vertical
     * flex container.
     */
    propertiesPanel.classList.add(
        "properties-panel-container"
    );


    /*
     * Create the fixed element identity section.
     */
    const identitySection =
        createElementIdentitySection();

    propertiesPanel.appendChild(
        identitySection
    );

    // add the 'control actions' div (buttons providing functionality)
    const ctrlActionDiv = setupControlActionDiv();
  
    propertiesPanel.appendChild(
        ctrlActionDiv
    );  

    /*
     * Create the scrollable area for the
     * control properties.
     */
    const scrollArea =
        document.createElement("div");

    scrollArea.id =
        "controlPropertiesScrollArea";

    scrollArea.className =
        "control-properties-scroll-area";

    propertiesPanel.appendChild(
        scrollArea
    );

    /*
     * Load the property definitions.
     */
    const definition =
        getControlPropertiesDefinition();

    propertyDefinitions = {};

    definition.propertydefs.forEach(
        function(propertyDef) {

            if (
                !Array.isArray(propertyDef) ||
                propertyDef.length < 4
            ) {
                console.warn(
                    "Invalid property definition:",
                    propertyDef
                );

                return;
            }


            const propertyName =
                propertyDef[0];

            const dataType =
                propertyDef[1];

            const description =
                propertyDef[2];

            const defaultValue =
                propertyDef[3];

	    let enumeratedValues =
		null;

	    if (dataType == 'enum') {

	    	// ensure the propertydef length is 5, and the last element is an array (since an enum type is expected to provide an array of valid values)
	    	if (propertyDef.length == 5 && Array.isArray(propertyDef[4])) {
			// extract the array
			enumeratedValues = propertyDef[4];
			//console.log(enumeratedValues);
	    	}
	    }

            propertyDefinitions[
                propertyName
            ] = {
                dataType:
                    dataType,

                description:
                    description,

                defaultValue:
                    defaultValue
            };

            /*
             * Create the property row inside
             * the scrollable area.
             */

            const row =
                createPropertyRow(
                    propertyName,
                    dataType,
                    description,
		    enumeratedValues
                );


            scrollArea.appendChild(
                row
            );
        }
    );

    const controlCanvas =
        document.getElementById(
            "controlCanvas"
        );

    if (!controlCanvas) {

        console.error(
            "Could not find controlCanvas."
        );

        return;
    }


    /*
     * Use the capture phase.
     *
     * This allows the editor to receive the
     * event even when the clicked control is
     * an input element.
     */
    controlCanvas.addEventListener(
        "pointerdown",
        handleControlPointerDown,
        true
    );
}


    /*
     * Updates which properties are visible for the
     * currently selected control type.
     */
    function updateVisibleProperties(controlType) {

        const definition =
            getControlPropertiesDefinition();


        /*
         * First hide every property.
         */
        const allPropertyRows =
            document.querySelectorAll(
                "#propertiesContent .property-row"
            );

        allPropertyRows.forEach(function (row) {
            row.style.display = "none";
        });


        /*
         * Build a Set containing the properties that
         * should be visible.
         */
        const visibleProperties = new Set();


        /*
         * Common properties apply to every control.
         */
        definition.commonProperties.forEach(
            function (propertyName) {
                visibleProperties.add(propertyName);
            }
        );


        /*
         * Find the properties specific to the selected
         * control type.
         */
        const binding =
            definition.controlPropertyBindings.find(
                function (entry) {

                    return entry[0].toLowerCase() ===
                           controlType.toLowerCase();
                }
            );


        if (binding) {

            const controlProperties = binding[1];

            controlProperties.forEach(
                function (propertyName) {
                    visibleProperties.add(propertyName);
                }
            );
        }


        /*
         * Show the applicable property rows.
         */
        visibleProperties.forEach(
            function (propertyName) {

                const row =
                    document.querySelector(
                        '#propertiesContent .property-row' +
                        '[data-property="' +
                        CSS.escape(propertyName) +
                        '"]'
                    );

                if (row) {
                    row.style.display = "grid";
                }
            }
        );
    }



function registerPropertyEditorHandler(
    editor
) {

    const propertyName =
        editor.dataset.property;


    const definition =
        propertyDefinitions[
            propertyName
        ];


    if (!definition) {
        return;
    }


    /*
     * Boolean properties.
     */
    if (
        definition.dataType ===
        "boolean"
    ) {

        editor.addEventListener(
            "change",
            function() {

                applyPropertyChange(
                    propertyName,
                    editor.checked
                );
            }
        );

        return;
    }


    /*
     * Color properties.
     */
    if (
        definition.dataType ===
        "color"
    ) {

        editor.addEventListener(
            "input",
            function() {

                applyPropertyChange(
                    propertyName,
                    editor.value
                );
            }
        );

        return;
    }


    /*
     * String and numeric properties.
     */
    editor.addEventListener(
        "input",
        function() {

            let value =
                editor.value;


            if (
                definition.dataType ===
                "number"
            ) {

                value =
                    parseFloat(value);


                if (Number.isNaN(value)) {
                    return;
                }
            }


            applyPropertyChange(
                propertyName,
                value
            );
        }
    );
}


function initializePropertyEditorHandlers() {
const propertiesPanel =
        document.getElementById(
            "propertiesContent"
        );


    if (!propertiesPanel) {

        console.error(
            "Could not find propertiesContent."
        );

        return;
    }


    /*
     * Control property events.
     */
    propertiesPanel.addEventListener(
        "input",
        handlePropertyEditorEvent
    );


    propertiesPanel.addEventListener(
        "change",
        handlePropertyEditorEvent
    );

    /*
     * Element identity events.
     */
    propertiesPanel.addEventListener(
        "input",
        function(event) {

            if (
                event.target.classList.contains(
                    "element-identity-editor"
                )
            ) {
                handleElementIdentityChange(
                    event
                );
            }
        }
    );


    propertiesPanel.addEventListener(
        "change",
        function(event) {
            if (
                event.target.classList.contains(
                    "element-identity-editor"
                )
            ) {
                handleElementIdentityChange(
                    event
                );
            }
        }
    );
}

// sets up and returns the control action div (a div with buttons, used to provide certain functionality to the control like positioning within the div or manual delete buttons)
function setupControlActionDiv() {
    	// declare a variable to hold the div
    	const ctrlActionDiv = document.createElement("div");

	// set div properties
    	ctrlActionDiv.style.width = "100%";
    	ctrlActionDiv.style.height = "125px";
    	ctrlActionDiv.style.borderStyle = "solid";
    	ctrlActionDiv.style.borderColor = "black";
    	ctrlActionDiv.style.borderWidth = "1px";
    	ctrlActionDiv.style.display = "grid";
    	ctrlActionDiv.style.padding = "5px";
    	ctrlActionDiv.style.gap = "5px";
    	ctrlActionDiv.style.boxSizing = "border-box";
    	ctrlActionDiv.style.gridTemplateColumns = "1fr 1fr";
    	ctrlActionDiv.style.gridTemplateRows = "1fr 1fr";  

	// create/initialize buttons
	let actionDivBtns = [];

	// set button properties
	for (let i = 0; i < 4; i++) {
		// initialize the element
		actionDivBtns.push(document.createElement("Button"));
		
		// declare a variable to store the current element
		const currentBtn = actionDivBtns[i];

		// set the current button's ID, text and event handker
		switch (i) {
		   case 0:
			currentBtn.id = "changeElemDivOrderUpBtn";
			currentBtn.textContent = "(<) Move display order up";
			currentBtn.addEventListener("click", () => { mdouBtn_OnClick() });
			break;
		   case 1:
			currentBtn.id = "changeElemDivOrderDownBtn";
			currentBtn.textContent = "(>) Move display order down";
			currentBtn.addEventListener("click", () => { mdodBtn_OnClick() });
			break;
		   case 2:
			currentBtn.id = "moveCtrlToContainerBtn";
			currentBtn.textContent = "Click container to move control";
			currentBtn.addEventListener("click", () => { moveCtrlToSelectedContainerBtn_OnClick() });
			break;
		   case 3:
			currentBtn.id = "deleteSelectedCtrlBtn";
			currentBtn.textContent = "Delete control";
			currentBtn.addEventListener("click", () => { deleteSelectedCtrlBtn_OnClick() });
			break;
		}

		// set button properties
		currentBtn.style.width = "100%";
		currentBtn.style.height = "100%";

		// add button to control action div
		ctrlActionDiv.appendChild(currentBtn);
	}

    	// return a reference to the control
    	return ctrlActionDiv;
}
