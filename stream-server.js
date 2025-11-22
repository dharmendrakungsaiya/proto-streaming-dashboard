const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const hlsDir = path.join(__dirname, 'hls_output');
if (!fs.existsSync(hlsDir)){
    fs.mkdirSync(hlsDir, { recursive: true });
}

app.use('/hls', express.static(hlsDir));

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Media Server running on http://localhost:${PORT}`);
});


const RTSP_URL = 'rtsp://13.60.76.79:8554/live2'; 
const ffmpegPath = path.join(__dirname, 'ffmpeg.exe');

console.log(`Attempting to connect to RTSP Source: ${RTSP_URL}`);

const ffmpeg = spawn(ffmpegPath, [
   
    '-i', RTSP_URL,  
    
    '-filter_complex', '[0:v]split=5[v1][v2][v3][v4][v5]',
    
    // Stream 1
    '-map', '[v1]', '-preset', 'ultrafast', '-tune', 'zerolatency',
    '-f', 'hls', '-hls_time', '2', '-hls_list_size', '3', '-hls_flags', 'delete_segments',
    path.join(hlsDir, 'stream1.m3u8'),

    // Stream 2
    '-map', '[v2]', '-preset', 'ultrafast', '-tune', 'zerolatency',
    '-f', 'hls', '-hls_time', '2', '-hls_list_size', '3', '-hls_flags', 'delete_segments',
    path.join(hlsDir, 'stream2.m3u8'),

    // Stream 3
    '-map', '[v3]', '-preset', 'ultrafast', '-tune', 'zerolatency',
    '-f', 'hls', '-hls_time', '2', '-hls_list_size', '3', '-hls_flags', 'delete_segments',
    path.join(hlsDir, 'stream3.m3u8'),

    // Stream 4
    '-map', '[v4]', '-preset', 'ultrafast', '-tune', 'zerolatency',
    '-f', 'hls', '-hls_time', '2', '-hls_list_size', '3', '-hls_flags', 'delete_segments',
    path.join(hlsDir, 'stream4.m3u8'),

    // Stream 5
    '-map', '[v5]', '-preset', 'ultrafast', '-tune', 'zerolatency',
    '-f', 'hls', '-hls_time', '2', '-hls_list_size', '3', '-hls_flags', 'delete_segments',
    path.join(hlsDir, 'stream5.m3u8'),
]);

ffmpeg.stderr.on('data', (data) => {
    console.log(`FFmpeg: ${data}`);
});

ffmpeg.on('close', (code) => {
    console.log(`FFmpeg process exited with code ${code}`);
    if (code !== 0) {
        console.log("ERROR: FFmpeg failed. The RTSP link is likely offline.");
    }
});