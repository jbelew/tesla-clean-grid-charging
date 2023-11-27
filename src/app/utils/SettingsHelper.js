const fs = require("fs");

let settings;

try {
    const fileContent = fs.readFileSync("./config/settings.json", "utf-8");
    settings = JSON.parse(fileContent);
} catch (error) {
    console.error("Error reading or parsing settings.json! Creating a new empty array");
    settings = [];
}

/**
 * Object containing vehicle settings functions.
 * @typedef {Object} appSettings
 * @property {Function} getAll - Function to get all vehicle settings.
 * @property {Function} getById - Function to get vehicle settings by ID.
 * @property {Function} find - Function to find vehicle settings.
 * @property {Function} create - Function to create vehicle settings.
 * @property {Function} update - Function to update vehicle settings.
 * @property {Function} delete - Function to delete vehicle settings.
 */
export const appSettings = {
    getAll,
    getById,
    find,
    create,
    update,
    delete: _delete,
};

function getAll() {
    return settings;
}

function getById(id) {
    return settings.find((x) => x.id.toString() === id.toString());
}

function find(query) {
    return settings.find(query);
}

function create(settingsData) {
    const data = { ...settingsData };

    data.dateCreated = new Date().toISOString();
    data.dateUpdated = new Date().toISOString();

    const existingSettingsIndex = settings.findIndex((x) => x.id.toString() === data.id.toString());

    if (existingSettingsIndex !== -1) {
        // If a vehicle with the same ID already exists, update it
        settings[existingSettingsIndex] = data;
    } else {
        // If not, push the new vehicle data
        settings.push(data);
    }
    saveData();
}

function update(settings, params) {
    const index = settings.findIndex((settingsItem) => settingsItem.id.toString() === settings.id.toString());

    if (index === -1) {
        console.error("Settings entry not found with id: " + settings.id);
        return;
    }

    const foundSettings = settings[index];

    if (!foundSettings) {
        console.error("Settings entry is undefined");
        return;
    }

    foundSettings.dateUpdated = new Date().toISOString();
    saveData();
}

function _delete(id) {
    settings = settings.filter((x) => x.id.toString() !== id.toString());
    saveData();
}

function saveData() {
    fs.writeFileSync("./config/settings.json", JSON.stringify(settings, null, 4));
}
