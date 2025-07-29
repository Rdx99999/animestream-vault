import { useEffect, useRef, useState } from 'react';
import { Episode, episodeAPI } from '@/lib/api';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

interface VideoPlayerProps {
  episode: Episode;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const VideoPlayer = ({ episode, onNext, onPrevious }: VideoPlayerProps) => {
  const artRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Artplayer | null>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  useEffect(() => {
    if (!artRef.current || !episode.masterPlaylistUrl) return;

    // Clean up previous instance
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    const art = new Artplayer({
      container: artRef.current,
      url: episode.masterPlaylistUrl,
      poster: episode.thumbnail,
      volume: 0.7,
      muted: false,
      autoplay: false,
      pip: true,
      screenshot: true,
      setting: true,
      loop: false,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      miniProgressBar: true,
      mutex: true,
      playsInline: true,
      theme: '#9333ea',
      moreVideoAttr: {
        crossOrigin: 'anonymous',
      },
      customType: {
        m3u8: (video: HTMLVideoElement, url: string) => {
          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90,
            });
            hls.loadSource(url);
            hls.attachMedia(video);

            // Add quality levels control
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              const levels = hls.levels.map((level, index) => ({
                default: index === hls.currentLevel,
                html: `${level.height}p`,
                value: index,
              }));

              if (levels.length > 1) {
                art.setting.add({
                  html: 'Quality',
                  selector: levels,
                  onSelect: (item: any) => {
                    hls.currentLevel = item.value;
                    return item.html;
                  },
                });
              }
            });

            // Handle quality changes
            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
              const level = hls.levels[data.level];
              console.log(`Quality changed to: ${level.height}p`);
            });

            return hls;
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            return video;
          }
        },
      },
      controls: [
        ...(onPrevious ? [{
          name: 'previous',
          position: 'left' as const,
          html: '⏮️',
          tooltip: 'Previous Episode',
          click: () => onPrevious(),
        }] : []),
        ...(onNext ? [{
          name: 'next', 
          position: 'right' as const,
          html: '⏭️',
          tooltip: 'Next Episode',
          click: () => onNext(),
        }] : []),
      ],
      layers: [
        {
          name: 'episode-info',
          html: `
            <div style="position: absolute; top: 20px; left: 20px; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 8px; color: white; font-size: 14px;">
              <div style="font-weight: bold;">Episode ${episode.episodeNumber}</div>
              <div style="opacity: 0.8;">${episode.title}</div>
            </div>
          `,
          style: {
            pointerEvents: 'none',
          },
        },
      ],
    });

    // Track view count after 30 seconds of playback
    art.on('video:timeupdate', () => {
      if (!hasTrackedView && art.currentTime > 30) {
        setHasTrackedView(true);
        episodeAPI.incrementView(episode.id).catch(console.error);
      }
    });

    // Add keyboard shortcuts
    art.on('ready', () => {
      const handleKeyDown = (event: KeyboardEvent) => {
        switch (event.code) {
          case 'Space':
            event.preventDefault();
            art.toggle();
            break;
          case 'ArrowLeft':
            event.preventDefault();
            art.backward = 10;
            break;
          case 'ArrowRight':
            event.preventDefault();
            art.forward = 10;
            break;
          case 'ArrowUp':
            event.preventDefault();
            art.volume = Math.min(1, art.volume + 0.1);
            break;
          case 'ArrowDown':
            event.preventDefault();
            art.volume = Math.max(0, art.volume - 0.1);
            break;
          case 'KeyF':
            event.preventDefault();
            art.fullscreen = !art.fullscreen;
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    });

    playerRef.current = art;

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [episode.id, episode.masterPlaylistUrl]);

  return (
    <div className="video-container">
      <div ref={artRef} className="w-full h-full" />
    </div>
  );
};