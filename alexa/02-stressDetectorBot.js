const fetch = require('node-fetch');

function sendStressAlert() {
  const url = 'https://webhooks.voicemonkey.io/catch/f81951aec3cf3a10a59caaa2cf1b8054/be628a94fb';

  const payload = {
    announcement: "Hey, champion. Even the strongest need a break. Close your eyes for a moment, and let the stress float away."
  };

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.text())
    .then(console.log)
    .catch(console.error);
}

// Random interval between 10 and 30 seconds
function triggerRandomly() {
  const interval = Math.floor(Math.random() * (30000 - 10000 + 1)) + 10000;
  setTimeout(() => {
    sendStressAlert();
    triggerRandomly();
  }, interval);
}

triggerRandomly();
