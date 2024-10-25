// fetcher.js
require("dotenv").config(); // Add this line at the top

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");

// Configure constants
const CAMPAIGN_ID = "6718b3d5526cec686e51520c";
const API_LIMIT = 3000;
const API_URL = `https://publicapi.intract.io/api/pv1/campaigns/${CAMPAIGN_ID}/participants?limit=${API_LIMIT}&page=1`;
const OUTPUT_DIR = path.join(__dirname, "apiData");

// Check if the API token is provided as an environment variable
const API_TOKEN = process.env.API_TOKEN;
if (!API_TOKEN) {
  console.error("Error: API_TOKEN is not set in the environment variables.");
  process.exit(1); // Exit if the token is not set
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// Function to fetch data from the API
const fetchData = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    // Get the current timestamp in the desired format
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
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
};

// Schedule the fetchData function to run every 1 minutes
cron.schedule("*/1 * * * *", () => {
  console.log("Fetching data...");
  fetchData();
});

// Start the first fetch immediately
fetchData();
