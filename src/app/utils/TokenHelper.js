const fs = require("fs");

// Token data in JSON file for simplicity, store in a db for production applications
let tokenData;

try {
    // Try to read the existing settings from the file
    const fileContent = fs.readFileSync("./config/token.json", "utf-8");
    tokenData = JSON.parse(fileContent);
} catch (error) {
    // If reading or parsing fails, create a new empty object
    console.error("Error reading or parsing token.json! Creating a new empty object");
    tokenData = {};
}

export const TokenHelper = {
    get: () => tokenData,
    getByType,
    createTeslaToken,
    createEmToken,
};

function getByType(type) {
    return tokenData[type] || null;
}

function createTeslaToken(teslaTokenData) {
    const data = { ...tokenData };
    data.tesla_token = {
        ...teslaTokenData,
        dateCreated: new Date().toISOString(),
        dateUpdated: new Date().toISOString(),
    };
    tokenData = data;
    saveData(tokenData);
}

function createEmToken(emTokenData) {
    const data = { ...tokenData };
    data.em_token = {
        ...emTokenData,
        dateCreated: new Date().toISOString(),
        dateUpdated: new Date().toISOString(),
    };
    tokenData = data;
    saveData(tokenData);
}

function saveData(data) {
    // Save the updated data, for example, to a JSON file
    fs.writeFileSync("./config/token.json", JSON.stringify(data, null, 4));
}
