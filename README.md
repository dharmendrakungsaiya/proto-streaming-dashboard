# Synchronized Multi-Stream Video Dashboard

This project is a React-based video dashboard capable of displaying and synchronizing 5 distinct HLS video streams simultaneously. It was built as a technical assessment for Proto Corp.

## ⚠️ Important Note on Data Source
The assignment provided an RTSP source (`rtsp://13.60.76.79:8554/live`). During development, this source was found to be unreachable/offline. To ensure the assignment deliverables—specifically the **HLS generation pipeline** and **multi-stream synchronization logic**—could be demonstrated effectively, I implemented a simulated source using FFmpeg's `testsrc` (Test Pattern). This generates a live, precision clock and color bars, which serves as a perfect visual reference to verify synchronization.

## 🚀 Features
* **HLS Generation:** Converts raw video input into HTTP Live Streaming (HLS) format in real-time.
* **Multi-Stream Simulation:** Simulates 5 unique streams from a single source.
* **Grid Layout:** Responsive 2x3 grid layout.
* **Synchronization:** Custom "Soft Sync" logic to keep all players aligned within milliseconds.

## 🛠️ Technical Implementation

### 1. RTSP/Video to HLS Conversion
**Tool Used:** FFmpeg (via Node.js `child_process`)

To satisfy the requirement of converting a stream to HLS, a custom Node.js backend (`stream-server.js`) is used. It spawns an FFmpeg process that ingests the source video and outputs `.m3u8` playlists and `.ts` video segments.

**Key FFmpeg Flags Used:**
* `-f hls`: Formats the output as HLS.
* `-hls_time 2`: Sets segment length to 2 seconds (optimizing for lower latency).
* `-hls_list_size 3`: Keeps the playlist small (only the last 3 segments) to emulate a live window.
* `-preset ultrafast` & `-tune zerolatency`: Ensures the transcoding happens in real-time without buffering lag.

### 2. Simulating 5 Distinct Streams
**Requirement:** Create 5 to 6 distinct HLS URLs from a single source.

Instead of running 5 heavy FFmpeg processes, I utilized the FFmpeg `filter_complex` system to split the input signal into 5 separate output references (`[v1]` through `[v5]`).

```bash
# Conceptual command logic
ffmpeg -i INPUT \
-filter_complex "[0:v]split=5[v1][v2][v3][v4][v5]" \
-map "[v1]" ... /hls/stream1.m3u8 \
-map "[v2]" ... /hls/stream2.m3u8 \
...
This results in 5 independent HLS playlists (stream1.m3u8 to stream5.m3u8) being generated in the hls_output directory, effectively simulating a multi-camera environment.

3. Synchronization Logic (React)
Goal: Ensure 5 streams play "in sync".

I implemented a Master-Slave Synchronization Strategy within the React App.js component.

The Master: The first player (Stream 1) acts as the reference clock.

The Slaves: Streams 2-5 monitor the Master's currentTime.

The Logic: On every timeupdate event from the Master:

We calculate the diff (drift) between the Slave and Master.

Soft Sync (0.2s < diff < 2.0s): If a slave drifts slightly, we do not seek (which causes stutter). Instead, we adjust the playbackRate.

Slave Ahead: Speed = 0.9x

Slave Behind: Speed = 1.1x

Hard Sync (diff > 2.0s): If major lag occurs, we force a hard seek: slave.currentTime(masterTime).

📦 Setup & Installation
Prerequisites
Node.js (v14+)

FFmpeg (Installed and added to System PATH)

Step 1: Clone and Install
Bash

git clone <your-repo-link>
cd proto-dashboard
npm install
Step 2: Start the Media Server (Backend)
This starts the FFmpeg process and serves the HLS files on Port 4000.

Bash

node stream-server.js
Wait approx. 10 seconds for the initial segments to generate.

Step 3: Start the Dashboard (Frontend)
Open a new terminal window:

Bash

npm start
The dashboard will launch at http://localhost:3000.

🌐 Architecture
Backend (Port 4000): Node.js + Express + FFmpeg. Serves static HLS files.

Frontend (Port 3000): React + Video.js. Consumes streams from Port 4000.


***

### Part 2: GitHub Submission [cite: 24, 25]
1.  Create a new repository on GitHub named `proto-streaming-dashboard`.
2.  Run these commands in your VS Code terminal:
    ```bash
    git init
    git add .
    git commit -m "Initial submission"
    git branch -M main
    git remote add origin https://github.com/<YOUR_USERNAME>/proto-streaming-dashboard.git
    git push -u origin main
    ```

### Part 3: The "Live Link" (Vercel/Netlify) [cite: 33, 34, 35]

**The Challenge:**
The assignment asks for a live Vercel link. However, Vercel **cannot** run `stream-server.js` or FFmpeg. It only hosts the React frontend.

**The Solution for Submission:**
1.  **Deploy the Frontend to Vercel:**
    * Go to Vercel.com -> "Add New Project" -> Import from GitHub.
    * Deploy it. You will get a link like `https://proto-streaming-dashboard.vercel.app/`.
2.  **The Note:**
    * When you submit the assignment email, you must include this note:
    > *"The frontend is deployed on Vercel (link below). However, because the backend requires real-time FFmpeg transcoding which Vercel does not support, the video streams will only play if the backend server is running locally or tunneled. Please refer to the README for local setup instructions to see the full synchronization in action."*

**Why this is acceptable:**
Technical recruiters understand that HLS generation requires a specialized media server (o