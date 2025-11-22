import React, { useRef } from 'react';
import { VideoPlayer } from './VideoPlayer';
import './App.css';

const REMOTE_URL = "https://nonofficially-unflaked-suk.ngrok-free.dev";

const STREAMS = [
  `${REMOTE_URL}/hls/stream1.m3u8`,
  `${REMOTE_URL}/hls/stream2.m3u8`,
  `${REMOTE_URL}/hls/stream3.m3u8`,
  `${REMOTE_URL}/hls/stream4.m3u8`,
  `${REMOTE_URL}/hls/stream5.m3u8`,
];

function App() {
  const playersRef = useRef({});

  const handlePlayerReady = (player, index) => {
    playersRef.current[index] = player;

    if (index === 0) {
      player.on('timeupdate', () => {
        const masterTime = player.currentTime();

        Object.keys(playersRef.current).forEach((key) => {
          const slaveId = parseInt(key);
          if (slaveId === 0) return;

          const slave = playersRef.current[slaveId];
          if (slave) {
            const diff = slave.currentTime() - masterTime;

            if (Math.abs(diff) > 2) {
               slave.currentTime(masterTime);
            } 
            else if (diff > 0.2) {
               slave.playbackRate(0.9);
            } else if (diff < -0.2) {
               slave.playbackRate(1.1);
            } else {
               slave.playbackRate(1.0);
            }
          }
        });
      });
    }
  };

  return (
    <div className="grid-container">
      {STREAMS.map((url, idx) => (
        <div key={idx} className="grid-item">
          <VideoPlayer
            src={url}
            options={{ 
                autoplay: 'muted',
                controls: true, 
                fluid: true,
                html5: {
                    hls: {
                        enableLowInitialPlaylist: true,
                        smoothQualityChange: true,
                        overrideNative: true,
                    },
                },
            }}
            onPlayerReady={(player) => handlePlayerReady(player, idx)}
          />
        </div>
      ))}
    </div>
  );
}

export default App;