import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  onEnded?: () => void;
}

export default function VideoPlayer({ videoUrl, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && onEnded) {
      videoRef.current.addEventListener('ended', onEnded);
      return () => {
        videoRef.current?.removeEventListener('ended', onEnded);
      };
    }
  }, [onEnded]);

  // Check if it's a YouTube URL
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  
  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (isYouTube) {
    const videoId = getYouTubeId(videoUrl);
    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Direct video URL
  return (
    <video
      ref={videoRef}
      controls
      className="w-full rounded-lg"
      src={videoUrl}
    >
      Your browser does not support the video tag.
    </video>
  );
}