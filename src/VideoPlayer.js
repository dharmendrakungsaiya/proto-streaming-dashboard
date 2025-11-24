import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export const VideoPlayer = ({ src, onPlayerReady, options }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  // Initialize player or update source
  useEffect(() => {
    let player = playerRef.current;

    if (!player) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");

      if (videoRef.current) {
        videoRef.current.appendChild(videoElement);
      }

      player = playerRef.current = videojs(
        videoElement,
        { ...options, sources: [{ src, type: "application/x-mpegURL" }] },
        () => {
          onPlayerReady && onPlayerReady(player);
        }
      );
    } else {
      player.src({ src, type: "application/x-mpegURL" });
    }
  }, [src, options, onPlayerReady]);

  // Cleanup
  useEffect(() => {
    const savedPlayer = playerRef.current;

    return () => {
      if (savedPlayer && !savedPlayer.isDisposed()) {
        savedPlayer.dispose();
      }
    };
  }, []);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};
