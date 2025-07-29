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
  const hlsRef = useRef<Hls | null>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  useEffect(() => {
    if (!artRef.current || !episode.masterPlaylistUrl) return;

    // Clean up previous instance
    if (playerRef.current) {
      playerRef.current.destroy();
    }
    
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    const initializePlayer = () => {
      const art = new Artplayer({
        container: artRef.current!,
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
                maxBufferLength: 60,
                maxMaxBufferLength: 300,
                debug: false,
              });
              
              hlsRef.current = hls;
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

              // Handle errors
              hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS Error:', data);
                if (data.fatal) {
                  switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      hls.startLoad();
                      break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      hls.recoverMediaError();
                      break;
                    default:
                      hls.destroy();
                      break;
                  }
                }
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
              <div style="
                position: absolute; 
                top: 20px; 
                left: 20px; 
                background: rgba(0,0,0,0.8); 
                padding: 12px 16px; 
                border-radius: 8px; 
                color: white; 
                font-size: 14px;
                font-family: 'Inter', sans-serif;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
              ">
                <div style="font-weight: 600; margin-bottom: 4px;">Episode ${episode.episodeNumber}</div>
                <div style="opacity: 0.9; font-size: 12px;">${episode.title}</div>
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
          console.log('View tracked for episode:', episode.title);
        }
      });

      // Add keyboard shortcuts
      art.on('ready', () => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.target && (event.target as HTMLElement).tagName === 'INPUT') {
            return; // Don't interfere with input fields
          }

          switch (event.code) {
            case 'Space':
              event.preventDefault();
              art.toggle();
              break;
            case 'ArrowLeft':
              event.preventDefault();
              art.seek = art.currentTime - 10;
              break;
            case 'ArrowRight':
              event.preventDefault();
              art.seek = art.currentTime + 10;
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
            case 'KeyM':
              event.preventDefault();
              art.muted = !art.muted;
              break;
          }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      });

      // Add subtitle and audio track info if available
      if (episode.availableSubtitles.length > 0 || episode.availableAudios.length > 0) {
        art.on('ready', () => {
          setTimeout(() => {
            // Add subtitle selector if available
            if (episode.availableSubtitles.length > 0) {
              const subtitleOptions = episode.availableSubtitles.map((subtitle, index) => ({
                default: index === 0,
                html: `💬 ${subtitle}`,
                value: subtitle.toLowerCase(),
              }));

              art.setting.add({
                html: 'Subtitles',
                selector: subtitleOptions,
                onSelect: (item: any) => {
                  console.log('Subtitle selected:', item.value);
                  return item.html;
                },
              });
            }

            // Add audio track selector if available
            if (episode.availableAudios.length > 1) {
              const audioOptions = episode.availableAudios.map((audio, index) => ({
                default: index === 0,
                html: `🔊 ${audio}`,
                value: audio.toLowerCase(),
              }));

              art.setting.add({
                html: 'Audio',
                selector: audioOptions,
                onSelect: (item: any) => {
                  console.log('Audio track selected:', item.value);
                  return item.html;
                },
              });
            }
          }, 1000);
        });
      }

      playerRef.current = art;
    };

    initializePlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [episode.id, episode.masterPlaylistUrl]);

  return (
    <div className="video-container">
      <div ref={artRef} className="w-full h-full" />
    </div>
  );
};