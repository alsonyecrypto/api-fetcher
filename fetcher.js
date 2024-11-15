// fetcher.js
require("dotenv").config(); // Load environment variables if using a .env file
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const Papa = require("papaparse");

// Configure constants
const CAMPAIGN_ID = "6718b3d5526cec686e51520c";
const API_LIMIT = 7000;
const API_URL = `https://publicapi.intract.io/api/pv1/campaigns/${CAMPAIGN_ID}/participants?limit=${API_LIMIT}&page=1`;
const OUTPUT_DIR = path.join(__dirname, "apiData");
const CONVERTED_DIR = path.join(__dirname, "apiDataConverted");

// Check if the API token is provided as an environment variable
const API_TOKEN = process.env.API_TOKEN;
if (!API_TOKEN) {
  console.error("Error: API_TOKEN is not set in the environment variables.");
  process.exit(1); // Exit if the token is not set
}

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}
if (!fs.existsSync(CONVERTED_DIR)) {
  fs.mkdirSync(CONVERTED_DIR); // Create converted directory if it doesn't exist
}

// Function to convert JSON data to CSV and save it
const convertJsonToCsv = (result, timestamp) => {
  const csv = Papa.unparse(result);
  const filename = path.join(
    CONVERTED_DIR,
    `participants_${timestamp}_converted.csv`
  );

  fs.writeFileSync(filename, csv);
  console.log(`Converted data and saved to ${filename}`);
};

// Function to fetch data from the API and convert it
const fetchData = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    const now = new Date();
    const dateTimeStr = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}-${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;
    const filename = path.join(OUTPUT_DIR, `participants_${dateTimeStr}.json`);

    // Write the response data to a file
    fs.writeFileSync(filename, JSON.stringify(response.data, null, 2));
    console.log(`Data saved to ${filename}`);

    // If the result exists, convert it to CSV and save it to the converted folder
    if (response.data.result) {
      convertJsonToCsv(response.data.result, dateTimeStr);
    } else {
      console.error("No result data found in the fetched data.");
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
};

// Schedule the fetchData function to run at the start of every minute
cron.schedule("* * * * *", () => {
  // Runs every whole minute
  console.log("Fetching data...");
  fetchData();
});

// Start the first fetch immediately
fetchData();
