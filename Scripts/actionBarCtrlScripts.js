// this function sets the text and (optionally) color in the instruction label at the top of the action bar. If no color is desired, pass "none" for the colorString parameter. If null, a blank or whitespace string is provided, the text will be cleared but the color will still be applied
function updateInstructionLabel(message, colorString) {
	// check for errors
	if (message == null || message.trim() === "") {
    		// make text blank to ensure proper behavior
		message = "";
	}
	if (colorString == null || colorString.trim() === "") {
		// set to 'none' by default (to avoid errors/ensure proper behavior)
		colorString = "none";
	}

	// update the text in the label
	document.getElementById("instructionLbl").textContent = message;

	// update the background color
	document.getElementById("instructionLbl").style.backgroundColor = (colorString == "none") ? "" : colorString;

	// update the border style (should have a border when a color is applied; otherwse not
	if (colorString != "none") {
		// set the color & border style
		document.getElementById("instructionLbl").style.borderWidth = "1px";
		document.getElementById("instructionLbl").style.borderStyle = "solid";
	} else {
		// reset the border style
		document.getElementById("instructionLbl").style.borderStyle = "none";
	}
}

// resets the instruction label (resets the text & background color to their default values, blank and none)
function resetInstructionLabel() {
	updateInstructionLabel("", "none");
}