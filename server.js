import express from "express";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 1234;
const DATA_FILE = path.join(__dirname, "counter-data.json");

async function initializeDataFile() {
  if (!existsSync(DATA_FILE)) {
    await writeFile(DATA_FILE, JSON.stringify({}, null, 2));
    console.log("Created empty counter-data.json");
  }
}

// Read data from file
async function readData() {
  const data = await readFile(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

// Write data to file
async function saveData(data) {
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// API Routes

// Get all counter data
app.get("/api/data", async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    console.error("Error reading data:", error);
    res.status(500).json({ error: "Failed to read data" });
  }
});

// Update a single counter
app.post("/api/increment", async (req, res) => {
  try {
    const { name } = req.body;
    const data = await readData();

    if (data.hasOwnProperty(name)) {
      data[name]++;
      await saveData(data);
      res.json({ success: true, name, value: data[name] });
    } else {
      res.status(404).json({ error: "Name not found" });
    }
  } catch (error) {
    console.error("Error incrementing:", error);
    res.status(500).json({ error: "Failed to increment" });
  }
});

app.post("/api/decrement", async (req, res) => {
  try {
    const { name } = req.body;
    const data = await readData();

    if (data.hasOwnProperty(name)) {
      if (data[name] > 0) {
        data[name]--;
        await saveData(data);
      }
      res.json({ success: true, name, value: data[name] });
    } else {
      res.status(404).json({ error: "Name not found" });
    }
  } catch (error) {
    console.error("Error decrementing:", error);
    res.status(500).json({ error: "Failed to decrement" });
  }
});

// Import new data
app.post("/api/import", async (req, res) => {
  try {
    const newData = req.body;
    await saveData(newData);
    res.json({ success: true, data: newData });
  } catch (error) {
    console.error("Error importing data:", error);
    res.status(500).json({ error: "Failed to import data" });
  }
});

// Start server
await initializeDataFile();
app.listen(PORT, () => {
  console.log(`Counter server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/counter.html in your browser`);
});
