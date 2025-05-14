const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const axios = require('axios');

// --- CONFIGURATION ---
const EMAIL_SENDER = 'dikshapadiyarphotos@gmail.com'; // target sender
const CHECK_INTERVAL = 60 * 1000; // 60 seconds
const VOICEMONKEY_URL = 'https://api-v2.voicemonkey.io/announcement';
const VOICEMONKEY_TOKEN = 'f81951aec3cf3a10a59caaa2cf1b8054_efa07d9cc99a1b343c859217b30ca7ec';
const VOICEMONKEY_DEVICE = 'echo-dot';

// --- AUTH ---
function authorize(credentials, callback) {
  const { client_secret, client_id } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, 'urn:ietf:wg:oauth:2.0:oob'
  );

  fs.readFile('token.json', (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.modify'],
});
  console.log('🔑 Authorize this app by visiting this URL:\n', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('\nPaste the authorization code here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('❌ Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile('token.json', JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('✅ Token saved to token.json');
      });
      callback(oAuth2Client);
    });
  });
}

// --- GMAIL MONITOR ---
function startMonitoring(auth) {
  const gmail = google.gmail({ version: 'v1', auth });

  async function checkForEmail() {
    try {
      console.log('🔍 Checking for unread email from', EMAIL_SENDER);
      const res = await gmail.users.messages.list({
        userId: 'me',
        q: `from:${EMAIL_SENDER} is:unread`,
        maxResults: 1,
      });

      const messages = res.data.messages || [];

      if (messages.length > 0) {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: messages[0].id,
        });

        const snippet = msg.data.snippet;
        console.log('📩 New email from manager:', snippet);

        // Mark email as read (optional)
        await gmail.users.messages.modify({
          userId: 'me',
          id: messages[0].id,
          requestBody: {
            removeLabelIds: ['UNREAD'],
          },
        });

        await sendVoiceMonkeyAnnouncement(`New mail from manager: ${snippet}`);
      } else {
        console.log('📭 No new unread emails.');
      }
    } catch (error) {
      console.error('❌ Gmail check failed:', error.message);
    }
  }

  checkForEmail(); // immediate check
  setInterval(checkForEmail, CHECK_INTERVAL); // schedule future checks
}

// --- VOICEMONKEY ---
async function sendVoiceMonkeyAnnouncement(message) {
  try {
    const res = await axios.get(VOICEMONKEY_URL, {
      params: {
        token: VOICEMONKEY_TOKEN,
        device: VOICEMONKEY_DEVICE,
        text: message,
      },
    });
    console.log('📢 VoiceMonkey announcement sent:', res.status);
  } catch (err) {
    console.error('❌ Failed to send VoiceMonkey announcement:', err.message);
  }
}

// --- MAIN ---
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.error('❌ Error loading credentials:', err);
  authorize(JSON.parse(content), startMonitoring);
});
