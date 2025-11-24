const express = require("express");
const { spawn } = require("child_process");
const ngrok = require("@ngrok/ngrok");
const path = require("path");
const fs = require("fs");

const RTSP_URL = "rtsp://13.60.76.79:8554/live2";
const HLS_DIR = path.join(__dirname, "hls");
const PORT = process.env.PORT || 4000;
const NUM_STREAMS = 6;

if (!fs.existsSync(HLS_DIR)) fs.mkdirSync(HLS_DIR, { recursive: true });

const app = express();
app.use("/hls", express.static(HLS_DIR));
app.get("/", (req, res) => res.send("HLS server running"));

app.listen(PORT, () => {
  console.log("\n--- Node Web Server Started ---");
  console.log("Local URL: http://localhost:" + PORT);
  console.log("Serving HLS from:", HLS_DIR);
});


(async () => {
  try {
    const publicUrl = await ngrok.connect({ addr: PORT, authtoken_from_env: true });
  
    console.log("NGROK TUNNEL ACTIVE!");
    console.log("==========================================");
    console.log("Public URL:", publicUrl);
    console.log("Example Stream URL:", `${publicUrl}/hls/stream1.m3u8`);
  
  } catch (err) {
    console.error("Ngrok Error:", err);
  }
})();

function startFFmpegInstance(streamIndex) {
  const outPlaylist = path.join(HLS_DIR, `stream${streamIndex}.m3u8`);
  const segmentPattern = path.join(HLS_DIR, `stream${streamIndex}_%03d.ts`);

  console.log(`Starting ffmpeg for stream ${streamIndex} -> ${outPlaylist}`);


  const args = [
    "-rtsp_transport", "tcp",
    "-analyzeduration", "2147483647",
    "-probesize", "2147483647",
    "-timeout", "5000000",
    "-i", RTSP_URL,
    "-c:v", "copy",            
    "-c:a", "aac",
    "-f", "hls",
    "-hls_time", "2",         
    "-hls_list_size", "6",
    "-hls_flags", "delete_segments+independent_segments",
    "-hls_segment_filename", segmentPattern,
    outPlaylist
  ];

  const ff = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });

  ff.stdout.on("data", (d) => console.log(`[ffmpeg ${streamIndex}] stdout: ${d.toString().slice(0,200)}`));
  ff.stderr.on("data", (d) => console.log(`[ffmpeg ${streamIndex}] stderr: ${d.toString().slice(0,400)}`));

  ff.on("close", (code, signal) => {
    console.log(`⚠️ ffmpeg ${streamIndex} exited with code ${code} signal ${signal}. Restarting in 3s...`);
    setTimeout(() => startFFmpegInstance(streamIndex), 3000);
  });

  ff.on("error", (err) => {
    console.error(`ffmpeg ${streamIndex} error:`, err);
    setTimeout(() => startFFmpegInstance(streamIndex), 5000);
  });

  return ff;
}

for (let i = 1; i <= NUM_STREAMS; i++) {
  startFFmpegInstance(i);
}
