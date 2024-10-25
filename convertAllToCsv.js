const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");

// Input and output directories
const inputDir = path.join(__dirname, "apiData");
const outputDir = path.join(__dirname, "apiDataConverted");

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Function to convert JSON file to CSV
const convertJsonToCsv = (filePath) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      return;
    }

    // Parse JSON data
    const jsonData = JSON.parse(data);

    // Check if there is a result property
    if (!jsonData.result) {
      console.error(`No result data found in ${filePath}`);
      return;
    }

    // Convert JSON result to CSV format
    const csv = Papa.unparse(jsonData.result);

    // Create new filename with a different suffix
    const filename = path.basename(filePath, ".json") + "_converted.csv"; // Change suffix
    const outputFilePath = path.join(outputDir, filename);

    // Write CSV to file
    fs.writeFile(outputFilePath, csv, (err) => {
      if (err) {
        console.error("Error writing CSV file:", err);
      } else {
        console.log(`Converted ${filePath} to ${outputFilePath}`);
      }
    });
  });
};

// Read all JSON files in the input directory
fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error("Error reading input directory:", err);
    return;
  }

  // Process each JSON file
  files.forEach((file) => {
    if (file.startsWith("participants_") && file.endsWith(".json")) {
      const filePath = path.join(inputDir, file);
      convertJsonToCsv(filePath);
    }
  });
});
