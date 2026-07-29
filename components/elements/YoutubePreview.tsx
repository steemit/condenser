'use client';

import { useState } from 'react';

interface YoutubePreviewProps {
  youTubeId: string;
  width?: number;
  height?: number;
  startTime?: number;
  dataParams?: string;
  frameBorder?: string;
  allowFullScreen?: string;
}

/**
 * YoutubePreview — lazily-loaded YouTube player.
 * Ported from master's src/app/components/elements/YoutubePreview.jsx.
 * Lots of iframes in a post can be very slow; the iframe is only inserted
 * after the user clicks the thumbnail.
 */
export default function YoutubePreview({
  youTubeId,
  width = 640,
  height = 360,
  startTime = 0,
  dataParams = 'enablejsapi=0&rel=0&origin=https://steemit.com',
}: YoutubePreviewProps) {
  const [play, setPlay] = useState(false);

  if (!play) {
    // mqdefault.jpg (medium quality version, 320px × 180px)
    // hqdefault.jpg (high quality version, 480px × 360px)
    // 0.jpg (full-size version)
    const thumbnail =
      width <= 320 ? 'mqdefault.jpg' : width <= 480 ? 'hqdefault.jpg' : '0.jpg';
    const previewLink = `https://img.youtube.com/vi/${youTubeId}/${thumbnail}`;
    return (
      <div
        className="videoWrapper youtube"
        onClick={() => setPlay(true)}
        style={{ backgroundImage: 'url(' + previewLink + ')' }}
      >
        <div className="play" />
      </div>
    );
  }

  const autoPlaySrc = `https://www.youtube.com/embed/${youTubeId}?autoplay=1&autohide=1&${dataParams}&start=${startTime}`;
  return (
    <div className="videoWrapper">
      <iframe
        width={width}
        height={height}
        src={autoPlaySrc}
        frameBorder="0"
        allowFullScreen
        title={`YouTube video ${youTubeId}`}
      />
    </div>
  );
}
