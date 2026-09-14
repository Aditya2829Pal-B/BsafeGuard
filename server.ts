import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' })); // Support for larger payloads (e.g. initial media data)

  // API to send emergency SOS email via Gmail
  app.post("/api/send-sos", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No auth token provided" });
    }
    const token = authHeader.split(" ")[1];

    const { emails, location, timestamp, profile } = req.body;
    
    if (!emails || emails.length === 0) {
      return res.status(400).json({ error: "No recipient emails provided" });
    }

    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: token });
      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      const mapLink = location ? `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}` : 'Location unavailable';
      
      let profileText = '';
      if (profile) {
        profileText = `\nUSER PROFILE & MEDICAL INFO:
Name: ${profile.fullName || 'Not provided'}
Phone: ${profile.phone || 'Not provided'}
Address: ${profile.address || 'Not provided'}
Height: ${profile.height || 'Not provided'}
Weight: ${profile.weight || 'Not provided'}
Blood Type: ${profile.bloodType || 'Not provided'}
Allergies: ${profile.allergies || 'None listed'}
Medical Conditions: ${profile.medicalConditions || 'None listed'}
Medications: ${profile.medications || 'None listed'}
`;
      }

      const messageText = `EMERGENCY SOS ALERT

I have triggered an SOS alert from the BsafeGuard app.

Time: ${timestamp}
Location: ${mapLink}
${profileText}
Please check on me immediately.
`;

      for (const email of emails) {
        const str = [
          `To: ${email}`,
          "Subject: EMERGENCY SOS ALERT",
          "Content-Type: text/plain; charset=\"UTF-8\"",
          "MIME-Version: 1.0",
          "",
          messageText
        ].join("\n");
        const encodedMessage = Buffer.from(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
        
        await gmail.users.messages.send({
          userId: "me",
          requestBody: {
            raw: encodedMessage
          }
        });
      }
      res.json({ success: true });
    } catch (e: any) {
      console.error('Error sending SOS email:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // API for safety chatbot powered by Gemini
  app.post("/api/chat", async (req, res) => {
    try {
       const apiKey = process.env.GEMINI_API_KEY;
       if (!apiKey) {
         return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
       }
       
       const ai = new GoogleGenAI({ apiKey });
       const { message, history } = req.body;

       const formattedHistory = history.map((msg: any) => ({
         role: msg.role === 'user' ? 'user' : 'model',
         parts: [{ text: msg.text }]
       }));

       const systemInstruction = `You are the BsafeGuard AI Safety Assistant. You provide practical, calm, and actionable safety advice for women. Keep responses concise and empowering. If it's a life-threatening emergency, instruct them to triple-tap the SOS button or call emergency services immediately.`;

       const response = await ai.models.generateContent({
         model: 'gemini-3.5-flash',
         contents: [
            ...formattedHistory,
            { role: 'user', parts: [{ text: message }] }
         ],
         config: {
           systemInstruction,
           temperature: 0.3
         }
       });

       res.json({ reply: response.text });
    } catch (e: any) {
       console.error("Chatbot Error:", e);
       res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
