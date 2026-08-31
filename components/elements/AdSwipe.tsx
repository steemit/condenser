'use client';

import { useEffect, useRef, useState } from 'react';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

import { recordAdsView } from '@/lib/analytics/overseer';
import type { AdItem } from '@/lib/ads';

interface AdSwipeProps {
  adList: AdItem[];
  trackingId: string;
  /** Autoplay delay in ms (legacy: 5000). */
  timer?: number;
  /** 'horizontal' (sidebar squares) or 'vertical' (864x86 post banner). */
  direction?: 'horizontal' | 'vertical';
}

/**
 * AdSwipe — promotional banner carousel. Port of legacy
 * src/app/components/elements/AdSwipe.jsx, which already used the Swiper
 * library (legacy v6); this rewrite uses swiper's current vanilla API inside
 * a React wrapper, which is the approach swiper itself recommends for custom
 * integrations. Autoplay pauses on hover like legacy.
 */
export default function AdSwipe({
  adList,
  trackingId,
  timer = 5000,
  direction = 'horizontal',
}: AdSwipeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<Swiper | null>(null);
  // Vertical banners (864x86) need an explicit height derived from width.
  const [height, setHeight] = useState<number | null>(null);

  const enabledAds = adList.filter((ad) => ad.enable);

  useEffect(() => {
    if (!containerRef.current || enabledAds.length === 0) return;

    const updateHeight = () => {
      if (direction === 'horizontal' || !containerRef.current) return;
      setHeight(
        Number((containerRef.current.clientWidth / (864 / 86)).toFixed(1))
      );
    };

    const swiper = new Swiper(containerRef.current, {
      modules: [Autoplay],
      direction,
      speed: 1000,
      autoplay: { delay: timer, disableOnInteraction: false },
      spaceBetween: 10,
      loop: enabledAds.length > 1,
      on: {
        init: updateHeight,
        resize: updateHeight,
      },
    });
    swiperRef.current = swiper;
    updateHeight();

    return () => {
      swiper.destroy(true, true);
      swiperRef.current = null;
    };
  }, [direction, timer, enabledAds.length]);

  if (enabledAds.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="ad-carousel swiper overflow-hidden"
      style={{ width: '100%', height: height ? `${height}px` : undefined }}
    >
      <div className="swiper-wrapper">
        {enabledAds.map((ad) => (
          <div key={ad.tag} className="swiper-slide">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={ad.url}
              onClick={() => recordAdsView({ trackingId, adTag: ad.tag })}
              onMouseOver={() => swiperRef.current?.autoplay.stop()}
              onMouseOut={() => swiperRef.current?.autoplay.start()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.img}
                alt=""
                className="w-full"
                style={height ? { height: `${height}px` } : undefined}
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
