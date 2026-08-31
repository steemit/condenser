'use client';

import { useEffect, useRef, useState } from 'react';

import { recordAdsView } from '@/lib/analytics/overseer';

interface TronAdProps {
  trackingId: string;
  /** DOM id of the ad container (legacy wrapperName). */
  wrapperName: string;
  /** Placement id assigned by the ad network (legacy tronads_*_ad_pid). */
  pid: string;
  /** Slot identifier reported to overseer on click. */
  adTag: string;
  /** 'ratio-1-1' (sidebar square), 'ratio-10-1' (desktop banner),
   * 'ratio-375-80' (mobile banner). */
  ratioClass: 'ratio-1-1' | 'ratio-10-1' | 'ratio-375-80';
  /** Ad network environment (legacy tronads_env). */
  env: number;
  /** Serve mock ads (legacy tronads is_mock). */
  isMock: number;
  lang?: string;
}

declare global {
  interface Window {
    initAds?: new (config: Record<string, unknown>) => void;
  }
}

// Refer to legacy Ad.scss: square/desktop slots only exist ≥760px, the
// mobile banner only below.
const TRON_AD_DEVICE_WIDTH_THRESHOLD = 760;

let sdkPromise: Promise<void> | null = null;

/** Load /js/tron-ads-sdk-1.0.49.js once (legacy webpack copy step). */
function loadTronAdsSdk(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.initAds) return Promise.resolve();
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/js/tron-ads-sdk-1.0.49.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load tron ads sdk'));
      document.head.appendChild(script);
    });
  }
  return sdkPromise;
}

/**
 * TronAd — third-party ad network slot. Port of legacy
 * src/app/components/elements/TronAd.jsx: inits the bundled Tron ads SDK
 * once per slot, sizes the box from the ratio class, and reports clicks via
 * overseer recordAdsView.
 */
export default function TronAd({
  trackingId,
  wrapperName,
  pid,
  adTag,
  ratioClass,
  env,
  isMock,
  lang,
}: TronAdProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const initedRef = useRef(false);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const shouldInit = () =>
      ratioClass === 'ratio-375-80'
        ? window.innerWidth < TRON_AD_DEVICE_WIDTH_THRESHOLD
        : window.innerWidth >= TRON_AD_DEVICE_WIDTH_THRESHOLD;

    const calcHeight = () => {
      if (!boxRef.current) return;
      const ratio =
        ratioClass === 'ratio-1-1'
          ? 1
          : ratioClass === 'ratio-10-1'
            ? 10
            : 375 / 80;
      setHeight(Math.floor(boxRef.current.clientWidth / ratio));
    };

    const initAd = () => {
      if (initedRef.current || !shouldInit()) return;
      loadTronAdsSdk()
        .then(() => {
          if (initedRef.current || !window.initAds) return;
          // Legacy getLang: fr/it/pl fall back to en, zh maps to cn.
          const langMap: Record<string, string> = { zh: 'cn' };
          const finalLang =
            !lang || ['fr', 'it', 'pl'].includes(lang)
              ? 'en'
              : (langMap[lang] ?? lang);
          new window.initAds({
            env,
            wrapper: wrapperName,
            pid,
            is_mock: isMock,
            lang: finalLang,
            expand: { uuid: trackingId },
            loadSuccessCallback: () => {
              initedRef.current = true;
              calcHeight();
            },
            loadFailCallback: (err: unknown) => {
              console.error('load tron ad fail cb:', err);
            },
            clickEventCallback: () => {
              recordAdsView({ trackingId, adTag });
            },
          });
        })
        .catch((err) => console.error(err));
    };

    initAd();
    const onResize = () => {
      if (!initedRef.current) initAd();
      else calcHeight();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [trackingId, wrapperName, pid, adTag, ratioClass, env, isMock, lang]);

  return (
    <div className="tron-ad-box">
      <div
        ref={boxRef}
        id={wrapperName}
        className={`ad-ratio-wrapper ${ratioClass}`}
        style={{ height: height ? `${height}px` : undefined }}
      />
    </div>
  );
}
