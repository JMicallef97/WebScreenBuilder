// extracts the CSS of the provided root element and all children. Provide a reference to the root control for the 'root' parameter (i.e., using document.getElementById)
function extractCSS(root) {
  const rules = [];

  walkElements(root, (element) => {
    const declarations = getStyleDeclarations(element);

    if (declarations.length === 0) {
      return;
    }

    const selector = getElementSelector(element, root);

    rules.push(formatCSSRule(selector, declarations));
  });

  return rules.join("\n\n");
}

function removeDefaultDeclarations(element, declarations) {
  const defaults = getDefaultStyles(element);

  const test = document.createElement(element.tagName);

  test.removeAttribute("style");

  test.style.cssText =
    "position:absolute !important;" +
    "visibility:hidden !important;" +
    "pointer-events:none !important;";

  for (const declaration of declarations) {
    test.style.setProperty(
      declaration.property,
      declaration.value,
      declaration.priority
    );
  }

  document.body.appendChild(test);

  const computed = getComputedStyle(test);

  const result = declarations.filter(declaration => {
    const actual = computed.getPropertyValue(
      declaration.property
    );

    const defaultValue = defaults.get(
      declaration.property
    );

    return (
      defaultValue === undefined ||
      normalizeCSSValue(actual) !==
      normalizeCSSValue(defaultValue)
    );
  });

  test.remove();

  return result;
}

function walkElements(root, callback) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT
  );

  let element = walker.currentNode;

  while (element) {
    callback(element);
    element = walker.nextNode();
  }
}

function getElementSelector(element, root) {
  if (element.id) {
    return `#${CSS.escape(element.id)}`;
  }

  const path = [];
  let current = element;

  while (current && current !== root.parentElement) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += `#${CSS.escape(current.id)}`;
      path.unshift(selector);
      break;
    }

    const parent = current.parentElement;

    if (parent) {
      const sameType = [...parent.children].filter(
        child => child.tagName === current.tagName
      );

      if (sameType.length > 1) {
        const index = sameType.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);

    if (current === root) {
      break;
    }

    current = current.parentElement;
  }

  return path.join(" > ");
}

function getStyleDeclarations(element) {
  const properties = new Map();

  for (const property of element.style) {
    const value = element.style.getPropertyValue(property).trim();

    if (!value || isZeroValue(value)) {
      continue;
    }

    properties.set(property, {
      value,
      priority: element.style.getPropertyPriority(property)
    });
  }

  return normalizeDeclarations(properties);
}

function normalizeDeclarations(properties) {
  const declarations = [];

  const shorthandGroups = [
    ["padding", [
      "padding-top",
      "padding-right",
      "padding-bottom",
      "padding-left"
    ]],

    ["margin", [
      "margin-top",
      "margin-right",
      "margin-bottom",
      "margin-left"
    ]],

    ["border-color", [
      "border-top-color",
      "border-right-color",
      "border-bottom-color",
      "border-left-color"
    ]],

    ["border-style", [
      "border-top-style",
      "border-right-style",
      "border-bottom-style",
      "border-left-style"
    ]],

    ["border-width", [
      "border-top-width",
      "border-right-width",
      "border-bottom-width",
      "border-left-width"
    ]]
  ];

  const consumed = new Set();

  for (const [shorthand, longhands] of shorthandGroups) {
    const values = longhands.map(property => properties.get(property));

    // Only collapse when all four longhands are present.
    if (!values.every(Boolean)) {
      continue;
    }

    // Don't combine declarations with different !important state.
    if (!values.every(v => v.priority === values[0].priority)) {
      continue;
    }

    const shorthandValue = collapseFourValues(
      values.map(v => v.value)
    );

    declarations.push({
      property: shorthand,
      value: shorthandValue,
      priority: values[0].priority
    });

    for (const property of longhands) {
      consumed.add(property);
    }
  }

  for (const [property, declaration] of properties) {
    if (consumed.has(property)) {
      continue;
    }

    declarations.push({
      property,
      value: declaration.value,
      priority: declaration.priority
    });
  }

  return declarations;
}

function collapseFourValues(values) {
  const [top, right, bottom, left] = values;

  if (
    top === right &&
    right === bottom &&
    bottom === left
  ) {
    return top;
  }

  if (top === bottom && right === left) {
    return `${top} ${right}`;
  }

  if (right === left) {
    return `${top} ${right} ${bottom}`;
  }

  return `${top} ${right} ${bottom} ${left}`;
}

function isZeroValue(value) {
  return /^[-+]?0(?:\.0+)?(?:[a-zA-Z%]+)?$/.test(value);
}

function formatCSSRule(selector, declarations) {
  const lines = declarations.map(
    ({ property, value, priority }) =>
      `  ${property}: ${value}${priority ? ` !${priority}` : ""};`
  );

  return [
    `${selector} {`,
    ...lines,
    `}`
  ].join("\n");
}