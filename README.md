Proto Corp – Video Streaming Dashboard

This project implements a multi-camera synchronized video dashboard that plays 5–6 HLS video streams at once.
It was built using React, Video.js, FFmpeg, and a small Node.js server.

🚀 Live Demo

https://proto-streaming-dashboard.vercel.app/

📡 Streaming Endpoint (from ngrok)

Run ngrok on your system:

ngrok http 4000


Use the generated public URL:

https://xxxx.ngrok-free.app


This becomes your REMOTE_BASE.

📁 Project Structure
proto-dashboard/
│
├── server.js        # Node.js FFmpeg → HLS server
├── hls/             # HLS output files (auto generated)
│
          
├── src/             # React dashboard
│   ├── App.js
│   ├── VideoPlayer.js

⚙️ How It Works
1. RTSP → HLS Conversion

FFmpeg converts multiple RTSP streams into HLS .m3u8 files.

2. Node Server

Serves HLS files on:

http://localhost:4000/hls/stream1.m3u8

3. Ngrok

Makes the server globally accessible.

4. React Dashboard

Loads 5–6 video players and synchronizes them.

▶️ Run Instructions
1. Install dependencies
npm install

2. Start Node server
node server.js


This generates and serves:

/hls/stream1.m3u8
/hls/stream2.m3u8
...

3. Start Ngrok
ngrok http 4000


Copy the URL shown:

https://xxxx.ngrok-free.app

4. Set ngrok URL in React

Edit:

src/App.js


Replace:

const REMOTE_BASE = "https://xxxx.ngrok-free.app";

5. Run the React dashboard
npm start


Dashboard opens at:

http://localhost:3000