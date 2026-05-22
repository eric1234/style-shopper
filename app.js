const STORAGE_KEY = "style-shopper-form-v1";

const form = document.getElementById("shopping-form");
const statusEl = document.getElementById("status");
const promptOutput = document.getElementById("prompt-output");

let saveTimer;

const fieldLabels = {
  garmentType: "Garment type",
  useCase: "Use case",
  quantity: "Number of options to return",
  requestNotes: "Specific request notes",
  unit: "Unit system",
  height: "Height",
  weight: "Weight",
  usualSizes: "Usual sizes",
  chest: "Chest/bust",
  waist: "Waist",
  hip: "Hip/seat",
  shoulder: "Shoulder width",
  sleeve: "Sleeve length",
  neck: "Neck",
  torso: "Torso length",
  inseam: "Inseam",
  thigh: "Thigh",
  footLength: "Foot length",
  footWidth: "Foot width",
  archInstep: "Arch/instep",
  fav1: "Favorite item 1",
  fav1Measurements: "Favorite item 1 measurements and fit notes",
  fav2: "Favorite item 2",
  fav2Measurements: "Favorite item 2 measurements and fit notes",
  badFits: "Bad fit examples",
  brandSizeHistory: "Brand size history",
  overallFit: "Overall fit",
  ease: "Ease preference",
  lengthPreference: "Length preference",
  risePreference: "Rise preference",
  legShape: "Pant leg shape",
  shoulderPreference: "Shoulder preference",
  mobility: "Mobility and comfort needs",
  styleKeywords: "Style keywords",
  colors: "Preferred colors",
  patterns: "Patterns/graphics/logos",
  likedBrands: "Brands you like",
  avoidBrands: "Brands or aesthetics to avoid",
  wardrobe: "Wardrobe compatibility",
  materialNotes: "Material notes",
  topsDetails: "Tops/shirts/sweaters",
  pantsDetails: "Pants/jeans/chinos",
  outerwearDetails: "Jackets/coats/blazers",
  dressSkirtDetails: "Dresses/skirts",
  shoeDetails: "Shoes",
  otherDetails: "Accessories/other",
  region: "Country/region",
  budget: "Ideal budget",
  maxPrice: "Hard max price",
  neededBy: "Needed by",
  condition: "Condition",
  returns: "Return policy",
  preferredRetailers: "Preferred retailers",
  avoidRetailers: "Retailers to avoid",
  hardAvoids: "Hard avoids",
  ranking: "Ranking priorities",
  outputInstructions: "Output format",
};

const materialOptions = [
  ["mat_cotton", "cotton"],
  ["mat_wool", "wool/merino"],
  ["mat_linen", "linen"],
  ["mat_denim", "denim"],
  ["mat_leather", "leather"],
  ["mat_nylon", "technical nylon"],
  ["mat_noPoly", "avoid polyester-heavy fabrics"],
  ["mat_noAcrylic", "avoid acrylic"],
  ["mat_vegan", "vegan materials only"],
  ["mat_machineWash", "machine washable only"],
  ["mat_noDryClean", "no dry-clean-only items"],
  ["mat_wrinkle", "wrinkle-resistant preferred"],
];

const shoppingConstraintOptions = [
  ["inStockOnly", "in-stock only"],
  ["freeReturns", "free returns required"],
  ["noFinalSale", "avoid final sale"],
  ["saleOnly", "sale items only"],
  ["sustainable", "prioritize sustainable/ethical options"],
  ["measurementsRequired", "require detailed size charts or garment measurements"],
];

function formFields() {
  return [...form.elements].filter((element) => element.name);
}

function getFormData() {
  const data = {};

  for (const element of formFields()) {
    data[element.name] = element.type === "checkbox" ? element.checked : element.value.trim();
  }

  return data;
}

function setFormData(data) {
  for (const element of formFields()) {
    if (!(element.name in data)) continue;

    if (element.type === "checkbox") {
      element.checked = Boolean(data[element.name]);
    } else {
      element.value = data[element.name] ?? "";
    }
  }
}

function setStatus(message, state = "neutral") {
  statusEl.textContent = message;
  statusEl.dataset.state = state;
}

function saveFormData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getFormData()));
  setStatus(`Saved ${new Date().toLocaleTimeString()}`, "success");
}

function scheduleSave() {
  setStatus("Saving...");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveFormData, 200);
}

function loadSavedData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) return;

    setFormData(JSON.parse(savedData));
    setStatus("Loaded saved data", "success");
  } catch (error) {
    setStatus("Could not load saved data", "danger");
  }
}

function addLine(lines, label, value) {
  if (value) {
    lines.push(`- ${label}: ${value}`);
  }
}

function addGroup(lines, title, data, keys) {
  lines.push(`\n${title}:`);

  for (const key of keys) {
    addLine(lines, fieldLabels[key], data[key]);
  }
}

function selectedOptions(data, options) {
  return options
    .filter(([key]) => data[key])
    .map(([, label]) => label)
    .join(", ");
}

function buildPrompt() {
  const data = getFormData();
  const lines = [];
  const garmentType = data.garmentType || "[GARMENT TYPE]";

  lines.push(
    `Act as a clothing shopping agent. Find currently available ${garmentType} options that match my measurements, fit preferences, style preferences, and shopping constraints.`
  );

  addLine(lines, "Use case", data.useCase);
  addLine(lines, "Number of options to return", data.quantity || "5");
  addLine(lines, "Specific request notes", data.requestNotes);

  addGroup(lines, "My measurements", data, [
    "unit",
    "height",
    "weight",
    "usualSizes",
    "chest",
    "waist",
    "hip",
    "shoulder",
    "sleeve",
    "neck",
    "torso",
    "inseam",
    "thigh",
    "footLength",
    "footWidth",
    "archInstep",
  ]);

  addGroup(lines, "Garment measurements and fit history", data, [
    "fav1",
    "fav1Measurements",
    "fav2",
    "fav2Measurements",
    "badFits",
    "brandSizeHistory",
  ]);

  addGroup(lines, "Fit preferences", data, [
    "overallFit",
    "ease",
    "lengthPreference",
    "risePreference",
    "legShape",
    "shoulderPreference",
    "mobility",
  ]);

  addGroup(lines, "Style preferences", data, [
    "styleKeywords",
    "colors",
    "patterns",
    "likedBrands",
    "avoidBrands",
    "wardrobe",
  ]);

  lines.push("\nMaterials, construction, and care:");
  addLine(lines, "Material preferences and restrictions", selectedOptions(data, materialOptions));
  addLine(lines, "Material notes", data.materialNotes);

  addGroup(lines, "Garment-specific details", data, [
    "topsDetails",
    "pantsDetails",
    "outerwearDetails",
    "dressSkirtDetails",
    "shoeDetails",
    "otherDetails",
  ]);

  addGroup(lines, "Shopping constraints", data, [
    "region",
    "budget",
    "maxPrice",
    "neededBy",
    "condition",
    "returns",
    "preferredRetailers",
    "avoidRetailers",
  ]);

  addLine(lines, "Additional constraints", selectedOptions(data, shoppingConstraintOptions));

  lines.push("\nHard avoids and ranking:");
  addLine(lines, "Hard avoids", data.hardAvoids);
  addLine(
    lines,
    "Ranking priorities",
    data.ranking || "Rank by fit accuracy first, then material quality, then style match, then price."
  );

  lines.push(
    "\nSearch requirements:",
    "- Only show items that are currently available to buy.",
    "- Prefer listings with detailed size charts, garment measurements, or clear fit guidance.",
    "- Do not rely only on generic size labels.",
    "- Recommend a size for each option and explain the reasoning.",
    "- Flag risks such as unclear measurements, final sale, poor return policy, synthetic-heavy fabric, questionable fit, or weak reviews.",
    "- If measurements are missing, say what is missing and how that affects confidence."
  );

  addLine(lines, "Output format", data.outputInstructions);

  return lines.filter(Boolean).join("\n");
}

function previewPrompt() {
  promptOutput.value = buildPrompt();
}

async function copyPromptToClipboard() {
  const prompt = buildPrompt();
  promptOutput.value = prompt;

  try {
    await navigator.clipboard.writeText(prompt);
    setStatus("Prompt copied to clipboard", "success");
  } catch (error) {
    promptOutput.focus();
    promptOutput.select();
    document.execCommand("copy");
    setStatus("Prompt generated; copy fallback attempted", "success");
  }
}

function exportJson() {
  const blob = new Blob([JSON.stringify(getFormData(), null, 2)], {
    type: "application/json",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "style-shopper-profile.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const data = JSON.parse(await file.text());
    setFormData(data);
    saveFormData();
    previewPrompt();
  } catch (error) {
    window.alert("Could not import JSON file.");
  } finally {
    event.target.value = "";
  }
}

function clearLocalData() {
  const shouldClear = window.confirm(
    "Clear all locally saved Style Shopper data in this browser?"
  );

  if (!shouldClear) return;

  localStorage.removeItem(STORAGE_KEY);
  form.reset();
  promptOutput.value = "";
  setStatus("Local data cleared", "danger");
}

function bindEvents() {
  form.addEventListener("input", scheduleSave);
  form.addEventListener("change", scheduleSave);

  document.getElementById("preview-button").addEventListener("click", previewPrompt);
  document.getElementById("copy-button").addEventListener("click", copyPromptToClipboard);
  document.getElementById("export-button").addEventListener("click", exportJson);
  document.getElementById("import-file").addEventListener("change", importJson);
  document.getElementById("clear-button").addEventListener("click", clearLocalData);
}

bindEvents();
loadSavedData();
previewPrompt();
