const express = require("express");
const { exec } = require("child_process");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies

app.post("/run-script", (req, res) => {
  const { command, repoName } = req.body;
console.log("Repo Name received from frontend:", repoName);
  if (command === "get-github-pr-reviews") {
    if (!repoName) {
      return res.status(400).send({ error: "Repository name is required" });
    }

    // Run the automation script with the repository name as an argument
    exec(`node github-pr-reviews.js ${repoName}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        return res.status(500).send({ error: "Failed to fetch PRs" });
      }
      if (stderr) {
        console.error(`Script error: ${stderr}`);
        return res.status(500).send({ error: "Failed to fetch PRs" });
      }
      res.send({ message: stdout });
    });
  } else {
    res.status(400).send({ error: "Invalid command" });
  }
});

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});