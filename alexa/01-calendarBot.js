const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();
const { DateTime } = require("luxon");


const app = express();
app.use(bodyParser.json());
const cors = require("cors");
app.use(cors());
const PORT = 3000;

app.post("/", async (req, res) => {
  try {
    const intentName = req.body.request?.intent?.name;

    if (intentName !== "GetMeetingsIntent") {
      return res.json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: "Sorry, I can't handle that request yet.",
          },
          shouldEndSession: true,
        },
      });
    }

    const accessToken = process.env.MS_GRAPH_ACCESS_TOKEN;
    if (!accessToken) throw new Error("Missing Microsoft Graph access token.");

    const today = new Date().toISOString().split("T")[0];
    console.log("Today's date:", today); 
    const start = `${today}T00:00:00Z`;
    const end = `${today}T23:59:59Z`;

    const graphRes = await axios.get(
      `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${start}&endDateTime=${end}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 6000, 
      }
    );

    const meetings = graphRes.data.value;

    if (!meetings.length) {
      return res.json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: "You have no meetings scheduled for today.",
          },
          shouldEndSession: true,
        },
      });
    }

    const formatted = meetings
  .map((meeting) => {
    const istTime = DateTime.fromISO(meeting.start.dateTime, { zone: 'utc' }).setZone("Asia/Kolkata");
    return `${meeting.subject} at ${istTime.toFormat("hh:mm a")}`;
  })
  .join(", ");

    const finalText = `You have ${meetings.length} meetings today: ${formatted}.`;

    res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: finalText,
        },
        shouldEndSession: true,
      },
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "There was an error fetching your meetings.",
        },
        shouldEndSession: true,
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Alexa backend running on http://localhost:${PORT}`);
});
