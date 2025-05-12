const { exec } = require("child_process");

// Fetch the repository name from the command-line arguments
const repoName = process.argv[2];

if (!repoName) {
  console.error("Error: Repository name is required. Please provide it in the format 'owner/repo-name'.");
  process.exit(1);
}

function fetchGitHubPRs(repoName) {
  // Run the GitHub CLI command to list pull requests for the specified repository
  exec(`gh pr list --repo ${repoName}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error fetching PRs: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }
    console.log("GitHub PR Reviews:");
    console.log(stdout);
  });
}

// Run the function with the provided repository name
fetchGitHubPRs(repoName);