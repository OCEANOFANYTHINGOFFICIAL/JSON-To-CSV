const outputArea = document.querySelector(".large-area-output");
const btnConvert = document.querySelector(".controls-button-convert");
const inputArea = document.getElementById("inputTextArea");
const file_uploads = document.getElementById("file_uploads");
const btnRestart = document.querySelector(".controls-button-restart");
const btnDownload = document.querySelector(".controls-button-download");
const btnCopied = document.querySelector(".controls-button-copied");

file_uploads.addEventListener("change", (event) => showUploadedText(event));
function jsonToCsv(jsonData) {
  try {
    let jsonArray = jsonData;
    if (typeof jsonData === "string") {
      jsonArray = JSON.parse(jsonData);
    }

    if (Array.isArray(jsonArray)) {
      if (jsonArray.length === 0) {
        return ""; // No data, return an empty string
      }

      // Flatten the JSON data and get the header and rows
      const flatDataArray = jsonArray.map((item) => flattenJSON(item));
      const headerSet = new Set();
      flatDataArray.forEach((obj) => {
        Object.keys(obj).forEach((key) => headerSet.add(key));
      });

      const headers = Array.from(headerSet);
      const rows = flatDataArray.map((obj) => {
        return headers.map((header) => obj[header] || "").join(",");
      });

      return [headers.join(","), ...rows].join("\n");
    } else if (typeof jsonArray === "object") {
      // Handle the case where jsonData is an object
      const flatData = flattenJSON(jsonArray);
      const header = Object.keys(flatData).join(",");
      const row = Object.values(flatData).join(",");
      return [header, row].join("\n");
    } else {
      throw new Error("Input is not a valid JSON object or array.");
    }
  } catch (error) {
    throw new Error("Invalid JSON data: " + error.message);
  }
}

// Function to recursively flatten nested JSON
function flattenJSON(data, prefix = "") {
  let result = {};
  for (const key in data) {
    const newKey = prefix ? `${prefix}_${key}` : key;
    if (Array.isArray(data[key])) {
      // Handle arrays by joining their elements into a string
      result[newKey] = data[key]
        .map((item) => {
          if (typeof item === "object") {
            return Object.values(flattenJSON(item)).join(", ");
          }
          return item;
        })
        .join(", ");
    } else if (typeof data[key] === "object") {
      Object.assign(result, flattenJSON(data[key], newKey));
    } else {
      result[newKey] = data[key];
    }
  }
  return result;
}

btnConvert.addEventListener("click", () => {
  const jsonData = inputArea.value;
  try {
    const csvData = jsonToCsv(jsonData);
    outputArea.value = csvData;
  } catch (error) {
    outputArea.value = error.message;
  }
});

btnRestart.addEventListener("click", () => {
  // Clear the input and output areas
  inputArea.value = "";
  outputArea.value = "";
});

function showUploadedText(event) {
  const selectedFile = file_uploads.files[0];
  if (selectedFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      inputArea.value = e.target.result;
    };
    reader.readAsText(selectedFile);
  } else {
    inputArea.textContent = "No file selected";
  }
}

// Function to download a file
function downloadCsvFile(data, filename) {
  const blob = new Blob([data], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Event listener for the "Download CSV" button
document
  .querySelector(".controls-button-download")
  .addEventListener("click", () => {
    const csvData = outputArea.value;
    if (csvData) {
      downloadCsvFile(csvData, "output.csv");
    }
  });

// Event listener for the "Copy" button
btnCopied.addEventListener("click", () => {
  const csvData = outputArea.value;
  if (csvData) {
    copyTextToClipboard(csvData);
    // Change the background color of the "Copy" button when clicked
    btnCopied.style.backgroundColor = "#00705a";
    btnCopied.style.color = "white";

    // Reset the background color after a brief delay (e.g., 1 second)
    setTimeout(() => {
      btnCopied.style.backgroundColor = "#a2cf6e";
      btnCopied.style.color = "black";
    }, 1000); // 1000 milliseconds = 1 second
  }
});

// Function to copy text to the clipboard
function copyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}
