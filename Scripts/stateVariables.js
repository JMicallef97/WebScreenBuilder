let propertyDefinitions = {};

let selectedContainer = null;
let selectedControl = null;
let selectedControlType = null;

let selectedContainerOriginalColor = null;
let selectedControlOriginalColor = null;

let lastViewedSidebarClassID = ".toolbar";
let currentViewedSidebarClassID = ".toolbar";

let createdControlCount = 0;
let autoAssignIDCounter = 0;

// used to track property edits/changes
let editingProperty_CtrlID = "";
let editingProperty_PropName = "";
let editingProperty_NewPropValue = "";
let editingProperty_OldPropValue = "";
let editingProperty_IsModifyingProperty = false;

let loadedCustomControlNames = [];

// status flag indicating if the user is trying to move a control to another container (after clicking a control and then the 'move to next selected container' button)
let isControlContainerBeingAdjusted = false;
// a reference to control which is being moved to another container (if selected)
let movingContainerControl = "";

let htmlCommentStart = "<!--";
let htmlCommentEnd = "-->";

const pageSaveFile_HTMLSectionStartMarker = "<!--<@!HTML SECTION START!@>-->";
const pageSaveFile_HTMLSectionEndMarker = "<!--<@!HTML SECTION END!@>-->";

const pageSaveFile_CSSSectionStartMarker = "<!--<@!CSS SECTION START!@>-->";
const pageSaveFile_CSSSectionEndMarker = "<!--<@!CSS SECTION END!@>-->";

// CSS code used to override browser default stylesheet values (to ensure exported pages show up the same as they do in the editor)
const envStylesheetDefaultResetCSS = `/* Global baseline */
*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
}

`;

// used to avoid double-updates of element properties when the user updates a property in an element and clicks on another element to deselect the updated element
let suppressPropertyUpdate = false;

// template strings used to build an exported HTML page for exporting the page data
const htmlFileTemplate_Part1 = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Title</title>

    <!--Links exported stylesheet to this page-->
    <link rel="stylesheet" href="styles.css">

    <script>
	// startup javascript area
    </script>

    <!--This page was output by Webpage Editor Version 1 (26 Aug 26)-->
</head>
<body>
`;

const htmlFileTemplate_Part2 = `
</body>
</html>
`;


const containerControlTypes = [
    "div",
    "tablecell"
];


function isContainerControl(controlType) {

    return containerControlTypes.includes(
        controlType.toLowerCase()
    );
}