// event handler functions

// saves the HTML/CSS data to the browser
function onSavePageToBrowserBtn_Click() {
	let singleFilePageCode = "";

	// deselect the current control (if it is selected) to avoid the selected border being added to the output CSS
	if (selectedControl != null) {
            deselectControl();
    	}

	// retrieve the page code (both HTML and CSS)
	const pageCode = getElementCode("controlCanvas", false, false);
	const pageHTMLCode = pageCode[0];

	// try saving the data to local storage
 	try {
		// save in local storage
    		localStorage.setItem("pageCodeLocalCopy", pageHTMLCode);

		// update the button icon
  	} catch (err) {
    		console.warn("Could not save convenience data:", err);
		alert("Could not save data locally; use the 'save to file' or function instead.");
  	}
}

// saves the HTML/CSS data to a single file
function onSavePageToFileBtn_Click() {
	let singleFilePageCode = "";

	// deselect the current control (if it is selected) to avoid the selected border being added to the output CSS
	if (selectedControl != null) {
            deselectControl();
    	}
	
	// retrieve the page code (both HTML and CSS)
	const pageCode = getElementCode("controlCanvas", false, false);
	//console.log(pageCode[0]);

	// insert into a template
	singleFilePageCode = pageSaveFile_HTMLSectionStartMarker +
		pageCode[0] +
		pageSaveFile_HTMLSectionEndMarker;

	// format the string
	singleFilePageCode = formatHtml(singleFilePageCode, "   ");

	// download the file
	downloadString(singleFilePageCode, "Saved Webpage File.wpe");
}

async function onLoadPageBtn_Click() {
	// let the user load an HTML page
	const loadedFileContents = await pickFile([".wpe"]);
	
	const htmlSectionStartIndex = loadedFileContents.indexOf(pageSaveFile_HTMLSectionStartMarker)
		+ pageSaveFile_HTMLSectionStartMarker.length;
	const htmlSectionEndIndex = loadedFileContents.lastIndexOf(pageSaveFile_HTMLSectionEndMarker);

	// extract the HTML (substring between the values of pageSaveFile_HTMLSectionStartMarker and pageSaveFile_HTMLSectionEndMarker
	const loadedHTML = loadedFileContents.slice(htmlSectionStartIndex, htmlSectionEndIndex);

	// reset the control canvas to prepare it for loading the file HTML in
	resetControlCanvas();

	// load the loaded HTML into the control canvas div
	document.getElementById("controlCanvas").innerHTML = loadedHTML;

	// update the createdControlCount and autoAssignIDCounter values based on the loaded control count
	createdControlCount = document.getElementById("controlCanvas").querySelectorAll('*').length;
	autoAssignIDCounter = createdControlCount;

	// run the 'control changed' event (since control count just changed)
    	onControlCountChanged();

	// run the 'onPageLoaded' event to take care of final details/settings before showing to the user
	onPageLoaded()
}

// exports the HTML and CSS into separate files
function onExportPageBtn_Click() {
	let singleFilePageCode = "";

	// deselect the current control (if it is selected) to avoid the selected border being added to the output CSS
	if (selectedControl != null) {
            deselectControl();
    	}
	
	// retrieve the page code (both HTML and CSS)
	const pageCode = getElementCode("controlCanvas", false, true); // last parameter 'true'
	let pageHTML = pageCode[0];
	let pageCSS = pageCode[1];

	// format the HTML (insert the body text into an HTML page template)
	pageHTMLOutput = htmlFileTemplate_Part1 +
		pageCode[0] +
		 htmlFileTemplate_Part2;

	// format the CSS
	// -insert CSS code to override browser default stylesheet settings (to ensure the webpage appears the same as it does in the editor)
	pageCSSOutput = envStylesheetDefaultResetCSS;
	// add the remaining page CSS
	pageCSSOutput += pageCSS;

	// format the HTML to be readable
	pageHTMLOutput = formatHtml(pageHTMLOutput, "   ");

	// download the files
	downloadString(pageHTMLOutput, "index.html");
	downloadString(pageCSSOutput, "styles.css");
}

// this function exports the HTML (with inline CSS styling) of the selected element and its children
async function onExportElementBtn_Click() {
	// ensure an element is selected
	if (!selectedControl) {
		// return since no control was selected
		console.log("Can't export element; no element selected.");
	}

	// save the current ID of the element (retrieve it after selection)
	const exportElementID = selectedControl.id;

	// deselect the current control (if it is selected) to avoid the selected border being added to the output CSS
        deselectControl();

	// initialize the export string with an HTML comment containing the name of the exported element
	let selectedElementExportHTML = htmlCommentStart + exportElementID + htmlCommentEnd + "\n";

	// retrieve the HTML of the selected control and its child elements
	selectedElementExportHTML += await getElementCode(exportElementID, false, false)[0];

	// save the exported HTML as a file with the ID value of the selected control
	downloadString(selectedElementExportHTML, exportElementID + ".wphe");
}

// this function allows the user to import HTML webpage elements (WPHE files) into the editor, allowing the user to reuse HTML more efficiently
async function onImportElementBtn_Click() {
	// let the user load an HTML page
	const loadedFileContents = await pickMultipleFiles([".wphe"]);

	for (let f = 0; f < loadedFileContents.length; f++) {
		let fileText = loadedFileContents[f];
		let elementHTML = "";
		let elementName = "";

		//console.log(fileText);
		//console.log("START INDEX: " + fileText.indexOf(htmlCommentStart));
		//console.log("END INDEX: " + fileText.indexOf(htmlCommentEnd));

		// check if the top line of the file is a comment
		if (fileText.indexOf(htmlCommentStart) == 0 && fileText.indexOf(htmlCommentEnd) != -1) {
			// extract element name
			elementName = fileText.substring(
				fileText.indexOf(htmlCommentStart) + htmlCommentStart.length,
				fileText.indexOf(htmlCommentEnd));

			// check if the custom control was already loaded
			if (loadedCustomControlNames.includes(elementName)) {
				console.warn("Can't load HTML element; another element with the name '" + elementName + "' was already loaded.");	
			} else {
				// extract element HTML
				elementHTML = fileText.substring(
					fileText.indexOf(htmlCommentEnd) + htmlCommentEnd.length,
					fileText.length - 1);

				// create a button to place in the toolbar for the element
				const elementCreationButton = createControlType(elementName);

				// add the imported HTML and a marker (indicating it is a custom control) to the button's dataset
				elementCreationButton.dataset.elementHTML = elementHTML;
				elementCreationButton.dataset.isCustomControl = "true";

				// place the creation button in the custom controls toolbar tab
				document.getElementById("Custom Controls Toolbar Tab").appendChild(elementCreationButton);

				// add element name to loadedCustomControlNames
				loadedCustomControlNames.push(elementName);
			}
			
		} else {
			console.warn("Can't load HTML element; element is missing identification comment");
		}
	}
}


// I/O functions (used to retrieve & format I/O data from the page, used by event handlers to carry out their actions)

// provides functionality to save a string to file & download it
function downloadString(text, filename, mimeType = "text/plain") {
	const blob = new Blob([text], { type: mimeType });
  	const url = URL.createObjectURL(blob);

  	const a = document.createElement("a");
  	a.href = url;
  	a.download = filename;
  	a.click();

  	URL.revokeObjectURL(url);
}

// allows the user to pick multiple files matching one of the extension(s) supplied in the 'extension' parameter (an array of file extensions, like .txt or .html). The contents of the files will be returned as a string array
function pickMultipleFiles(extensions) {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    let loadedFileContentsArray = [];

    input.type = "file";
    input.multiple = true;
    input.accept = extensions.join(",");

    input.onchange = async () => {
	
	if (input.files) {
	    try {
      		for (let f = 0; f < input.files.length; f++) {
			let currentFileContents = await input.files[f].text();
			//console.log(currentFileContents);
			loadedFileContentsArray.push(currentFileContents);
      		}
	    } catch (error) {
		reject(error);
	    }
	
	    resolve(loadedFileContentsArray);	
	
	} else {
        	reject(new Error("No file selected"));
        	return;
	}
    };

    input.click();
  });
}

// allows the user to pick a file matching one of the extension(s) supplied in the 'extension' parameter (an array of file extensions, like .txt or .html). The contents of the file will be returned as a string.
function pickFile(extensions) {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = extensions.join(",");

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      try {
        resolve(await file.text());
      } catch (error) {
        reject(error);
      }
    };

    input.click();
  });
}

// returns an image file as a base64 string, along with the name of the file
async function loadImageAsBase64() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
      console.log(fileExtension);

      if (!file) {
        reject(new Error("No image selected"));
        return;
      }

      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
	let outputB64Str = "";

        // Convert bytes to a binary string in chunks.
        let binary = "";
        const chunkSize = 0x8000;

        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(
            ...bytes.subarray(i, i + chunkSize)
          );
        }

	// prepend the correct header (identifying how to parse the data)
    	switch (fileExtension) {
        	case 'png':
            		outputB64Str = 'data:image/png;base64,';
			break;

        	case 'jpg':
        	case 'jpeg':
            		outputB64Str = 'data:image/jpeg;base64,';
			break;

        	case 'gif':
            		outputB64Str = 'data:image/gif;base64,';
			break;

        	case 'webp':
            		outputB64Str = 'data:image/webp;base64,';
			break;

        	case 'svg':
            		outputB64Str = 'data:image/svg+xml;base64,';
			break;

        	case 'bmp':
            		outputB64Str = 'data:image/bmp;base64,';
			break;

        	case 'ico':
            		outputB64Str = 'data:image/x-icon;base64,';
			break;

        	case 'tif':
        	case 'tiff':
            		outputB64Str = 'data:image/tiff;base64,';
			break;

        	case 'avif':
            		outputB64Str = 'data:image/avif;base64,';
			break;

        	case 'apng':
            		outputB64Str = 'data:image/apng;base64,';
			break;

        	default:
            		break;
    	}

	console.log("WITH HEADER: " + outputB64Str);

	// append the base64 encoded image data
	outputB64Str += btoa(binary);

	// return the image data
        resolve([outputB64Str, file.name]);

      } catch (error) {
        reject(error);
      }
    });

    input.click();
  });
}







function loadBrowserSavedData() {
	let loadedHTML = "";

	try {
		// retrieve the HTML from local storage
    		loadedHTML = localStorage.getItem("pageCodeLocalCopy");    		
  	} catch (err) {
		alert("Could not load saved data from browser local storage.");
		return;
  	}

	//console.log(loadedHTML);

	if (loadedHTML.length > 0) {
		// reset the control canvas to prepare it for loading the file HTML in
		resetControlCanvas();

		// load the loaded HTML into the control canvas div
		document.getElementById("controlCanvas").innerHTML = loadedHTML;

		// update the createdControlCount and autoAssignIDCounter values based on the loaded control count
		createdControlCount = document.getElementById("controlCanvas").querySelectorAll('*').length;
		autoAssignIDCounter = createdControlCount;

		console.log("ELEMENT COUNT: " + createdControlCount);

		// run the 'control changed' event (since control count just changed)
    		onControlCountChanged();

		// run the 'onPageLoaded' event to take care of final details/settings before showing to the user
		onPageLoaded()
	}
}


// FORMATTING FUNCTIONS


// Returns a string array of length 2 containing the HTML/Javascript and CSS code of the element and children of the element whose ID is provided as a parameter.  If the ID is blank, null will be returned. If innerHTMLOnly is set to true, only the inner HTML (excluding the HTML of the element whose elementId is provided) will be returned. If 'getTrimmedHTML' is set to true, HTML without inline styling elements will be returned. If set to false, HTML with inline styling will be returned.
function getElementCode(elementId, innerHTMLOnly, getTrimmedHTML) {
	const element = document.getElementById(elementId);

	// check if the provided element doesn't exist
	if (!element) {
		// return null since the element doesn't exist
		return null;
	}

	// if this point is reached then the element exists and can be exported
	let elementCode = [];

	// add javascript necessary to make dynamic/specialized controls operable (like searchable dropdown textboxes)
	const searchableDropdownListExists = document.querySelector(
   		'[data-control-type="Searchable Dropdown List"]'
	) !== null;

	// check if javascript exporting is required
	const isCustomControlJSExportRequired = searchableDropdownListExists;
	let onPageLoadFunctionCode = "document.addEventListener('DOMContentLoaded', () => {\n";
	let exportedJSCode = "";

	//if (isCustomControlJSExportRequired) {
	if (true) {

		// add the start of the script section
		exportedJSCode += "\n\n\n" + "<script>" + "\n";

		console.log(searchableDropdownListExists + " DO CONTROLS EXIST?");

		// append code
		if (searchableDropdownListExists) {
			// add code binding the event handlers to the 
			onPageLoadFunctionCode += exportSDTEHBindingJSCode() + "\n";

			// append the searchable dropdown list javascript code
			exportedJSCode += exportSearchableTextboxJSCode();
		}

		// finish off the page loading function
		onPageLoadFunctionCode += "});"

		// append the onPageLoadFunctionCode to the page
		exportedJSCode += onPageLoadFunctionCode;

		// finish the script section
		exportedJSCode += "\n" + "</script>";


		//console.log(exportedJSCode);
	}
	
	// populate element/children HTML & CSS into elementCode array
	if (getTrimmedHTML) {
		elementCode[0] = getHTMLWithoutInlineCSS(document.getElementById(elementId), innerHTMLOnly);
	} else {
		if (innerHTMLOnly) {
			elementCode[0] = document.getElementById(elementId).innerHTML;
		} else {
			elementCode[0] = document.getElementById(elementId).outerHTML;
		}
	}

	// append the exported JS code
	elementCode[0] += exportedJSCode;

	//console.log(elementCode[0]);

	// populate CSS code
	elementCode[1] = extractCSS(document.getElementById(elementId));

	// return the array
	return elementCode;
}

// extracts HTML from the webpage, stripping out unnecessary inline elements to simplify the output HTML
function getHTMLWithoutInlineCSS(element, includeElement = true) {
  const clone = element.cloneNode(true);

  // Remove inline styles and data-control-type attributes.
  clone.removeAttribute('style');
  clone.removeAttribute('data-control-type');

  clone.querySelectorAll('[style], [data-control-type]').forEach(el => {
    el.removeAttribute('style');
    el.removeAttribute('data-control-type');
  });

  const indent = '  ';

  function formatNode(node, level = 0) {
    const padding = indent.repeat(level);

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();

      if (!text) {
        return '';
      }

      return padding + text;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const openingTag = `<${node.tagName.toLowerCase()}${Array.from(
      node.attributes
    )
      .map(attr => ` ${attr.name}="${attr.value}"`)
      .join('')}>`;

    const closingTag = `</${node.tagName.toLowerCase()}>`;

    const children = Array.from(node.childNodes)
      .map(child => formatNode(child, level + 1))
      .filter(Boolean);

    if (!children.length) {
      return padding + openingTag + closingTag;
    }

    return [
      padding + openingTag,
      children.join('\n'),
      padding + closingTag
    ].join('\n');
  }

  if (includeElement) {
    return formatNode(clone);
  }

  return Array.from(clone.childNodes)
    .map(child => formatNode(child))
    .filter(Boolean)
    .join('\n');
}

// formats HTML with tabs
function formatHtml(html, indent = "  ") {
  const voidTags = new Set([
    "area", "base", "br", "col", "embed", "hr",
    "img", "input", "link", "meta", "param",
    "source", "track", "wbr"
  ]);

  const tokens = html.match(
    /<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<!--[\s\S]*?-->|<[^>]+>|[^<]+/gi
  ) || [];

  let depth = 0;
  const output = [];

  function formatCode(code, level) {
    let codeDepth = 0;

    return code
      .trim()
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        if (/^[}\])]/.test(line)) {
          codeDepth = Math.max(0, codeDepth - 1);
        }

        const result =
          indent.repeat(level + codeDepth) + line;

        if (/[{([]\s*$/.test(line) && !/[}\])]\s*$/.test(line)) {
          codeDepth++;
        }

        if (/[{}]/.test(line)) {
          const opens = (line.match(/{/g) || []).length;
          const closes = (line.match(/}/g) || []).length;
          codeDepth = Math.max(0, codeDepth + opens - closes);
        }

        return result;
      })
      .join("\n");
  }

  for (const token of tokens) {
    const value = token.trim();

    if (!value) continue;

    // <script>...</script> or <style>...</style>
    const codeMatch = value.match(
      /^<(script|style)\b[^>]*>([\s\S]*?)<\/\1\s*>$/i
    );

    if (codeMatch) {
      const [, tag, code] = codeMatch;

      output.push(indent.repeat(depth) + `<${tag}>`);

      if (code.trim()) {
        output.push(formatCode(code, depth + 1));
      }

      output.push(indent.repeat(depth) + `</${tag}>`);
      continue;
    }

    // Closing HTML tag
    if (/^<\//.test(value)) {
      depth = Math.max(0, depth - 1);
      output.push(indent.repeat(depth) + value);
      continue;
    }

    // Opening HTML tag
    if (/^</.test(value)) {
      output.push(indent.repeat(depth) + value);

      const tag = value.match(/^<([^\s/>]+)/)?.[1];

      if (
        tag &&
        !voidTags.has(tag.toLowerCase()) &&
        !/\/>$/.test(value) &&
        !/^<!/.test(value)
      ) {
        depth++;
      }

      continue;
    }

    // Text
    output.push(indent.repeat(depth) + value);
  }

  return output.join("\n");
}