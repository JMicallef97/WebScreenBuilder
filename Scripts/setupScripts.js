/*
         * Creates a toolbar control for a single control type.
         */
        function createControlType(controlType) {
            const control = document.createElement("div");

            control.className = "control-type";
            control.setAttribute("role", "button");
            control.setAttribute("tabindex", "0");
	    control.dataset.isCustomControl = "false";
	    control.id = controlType + " Toolbar Creation Button";

            /*
             * Thumbnail/image.
             *
             * This example generates a simple placeholder image.
             * Replace the src with your actual thumbnail path if
             * your JSON contains image information.
             */
            const image = document.createElement("img");

            image.src = "data:image/svg+xml," + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg"
                     width="40"
                     height="40"
                     viewBox="0 0 40 40">
                    <rect x="1" y="1"
                          width="38"
                          height="38"
                          rx="4"
                          fill="#e0e0e0"
                          stroke="#999999"/>
                    <text x="20"
                          y="25"
                          text-anchor="middle"
                          font-family="Arial"
                          font-size="16"
                          fill="#555555">C</text>
                </svg>
            `);

            image.alt = controlType;

            /*
             * Label.
             */
            const label = document.createElement("div");

            label.className = "control-label";
            label.textContent = controlType;

            control.appendChild(image);
            control.appendChild(label);

            /*
             * Register the click event and pass the control type
             * as the handler parameter.
             */
            control.addEventListener("click", function () {
                controlTypeClicked(controlType);
            });

            /*
             * Also allow keyboard activation.
             */
            control.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    controlTypeClicked(controlType);
                }
            });

            return control;
        }


        /*
         * Creates one <details> element for a control category.
         */
        function createControlCategory(categoryName, controlTypes) {
            const details = document.createElement("details");

            details.className = "control-category";
            details.open = true;

            const summary = document.createElement("summary");
            summary.textContent = categoryName;
            details.appendChild(summary);

            const controlList = document.createElement("div");
	    // give the controlList an ID (so imported elements can be added)
	    controlList.id = categoryName + " Toolbar Tab";

            controlList.className = "control-list";

            /*
             * Create a control entry for every control type
             * in this category.
             */
            controlTypes.forEach(function (controlType) {
                const control = createControlType(controlType);

                controlList.appendChild(control);
            });


            details.appendChild(controlList);

            return details;
        }


        /*
         * Loads controlInfoDoc.json and builds the toolbar.
         *
         * Expected JSON format:
         *
         * {
         *     "controlCategories": [
         *         [
         *             "Basic Controls",
         *             ["Button", "Label", "TextBox"]
         *         ],
         *         [
         *             "Containers",
         *             ["Panel", "GroupBox"]
         *         ]
         *     ]
         * }
         */
        async function initializeToolbar() {
            const toolbar = document.getElementById("toolbar");
	    const controlInfoDocText = document.getElementById("controlCategoriesJSON").textContent;
            const controlInfoDoc = JSON.parse(controlInfoDocText);

                if (!Array.isArray(controlInfoDoc.controlCategories)) {
                    throw new Error(
                        "controlCategories must be an array."
                    );
                }


                /*
                 * Process every control category.
                 */
                controlInfoDoc.controlCategories.forEach(
                    function (controlCategory) {

                        if (!Array.isArray(controlCategory) ||
                            controlCategory.length < 2) {
                            console.warn(
                                "Invalid control category:",
                                controlCategory
                            );
                            return;
                        }

                        const categoryName = controlCategory[0];
                        const controlTypes = controlCategory[1];

                        if (!Array.isArray(controlTypes)) {
                            console.warn(
                                "Invalid control types for category:",
                                categoryName
                            );
                            return;
                        }

                        const categoryElement =
                            createControlCategory(
                                categoryName,
                                controlTypes
                            );

                        toolbar.appendChild(categoryElement);
                    }
                );
        }


function createElementIdentitySection() {

    const section =
        document.createElement("div");

    section.id =
        "elementIdentitySection";

    section.className =
        "element-identity-section";


    const title =
        document.createElement("div");

    title.className =
        "property-section-title";

    title.textContent =
        "Element";


    section.appendChild(
        title
    );

    /*
     * Name
     */
    section.appendChild(
        createElementIdentityRow(
            "Name",
            "elementName"
        )
    );


    /*
     * ID
     */
    section.appendChild(
        createElementIdentityRow(
            "ID",
            "elementId"
        )
    );


    /*
     * Class
     */
    section.appendChild(
        createElementIdentityRow(
            "Class",
            "elementClass"
        )
    );


    return section;
}

function createElementIdentityRow(
    labelText,
    inputId
) {

    const row =
        document.createElement("div");

    row.className =
        "element-identity-row";


    const label =
        document.createElement("label");

    label.textContent =
        labelText;

    label.htmlFor =
        inputId;


    const input =
        document.createElement("input");

    input.type =
        "text";

    input.id =
        inputId;

    input.className =
        "element-identity-editor";

    input.disabled =
        true;


    row.appendChild(
        label
    );

    row.appendChild(
        input
    );


    return row;
}


function resetControlCanvas() {
	// clear the control canvas HTML
	document.getElementById("controlCanvas").innerHTML = "";

	// reset the autoAssignIDCounter and createdControlCount (since control count is now 0)
	createdControlCount = 0;
	autoAssignIDCounter = 0;
}




function initializeControlCanvas() {

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


    // set properties
    controlCanvas.dataset.controlType = "div";

    /*
     * The canvas is the default container.
     */
    selectedContainer =
        controlCanvas;


    /*
     * Handle clicks/pointer events on the
     * canvas and its child controls.
     */
    controlCanvas.addEventListener(
        "pointerdown",
        handleControlPointerDown,
        true
    );
}


function registerKeyboardEvents() {

    document.addEventListener(
        "keydown",
        //onDeleteKeyPress,
	 onKeyPress,
        true);
}

// registers event handlers for control types that require javascript to function (like searchable dropdown textboxes)
function registerJSPoweredCtrlEventHandlers() {
	// searchable dropdown controls
	bindSDTBEventsToPageControl();
}

// registers events for buttons on the page
function registerButtonEvents() {

    // tab control buttons
    document.querySelector('#toolbarTabBtn').addEventListener(
        "click", toolbarTabButton_Clicked);
    document.querySelector('#itemPropertyTabBtn').addEventListener(
        "click", itemPropertiesTabButton_Clicked);

    // I/O action buttons
    document.querySelector('#savePageToBrowserBtn').addEventListener(
        "click", onSavePageToBrowserBtn_Click);
    document.querySelector('#savePageToFileBtn').addEventListener(
        "click", onSavePageToFileBtn_Click);
    document.querySelector('#loadPageBtn').addEventListener(
        "click", onLoadPageBtn_Click);
    document.querySelector('#exportPageBtn').addEventListener(
        "click", onExportPageBtn_Click);
    document.querySelector('#exportElementBtn').addEventListener(
        "click", onExportElementBtn_Click);
    document.querySelector('#importElementsBtn').addEventListener(
        "click", onImportElementBtn_Click);   
}