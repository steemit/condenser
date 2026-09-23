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

/**
 * Sandbox flags applied to the ad iframes the vendored SDK appends
 * (audit N-19).
 *
 * `allow-same-origin` is required alongside allow-scripts/allow-popups:
 * without it the frame's origin becomes opaque ("null") and the SDK's own
 * postMessage origin whitelist (engine.tronads.io / test-engine.tronads.io)
 * silently drops every message — ad init, height sizing and click handling
 * would all break. The frame is cross-origin to the app either way, so
 * allow-same-origin only preserves the frame's own identity (its cookies),
 * not access to this page. What the sandbox does remove: top navigation,
 * forms, pointer lock and downloads; and because
 * allow-popups-to-escape-sandbox is NOT granted, popups opened from inside
 * the frame inherit the sandbox instead of running unsandboxed.
 */
const TRON_AD_IFRAME_SANDBOX = 'allow-scripts allow-popups allow-same-origin';

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

let windowOpenGuardInstalled = false;

/**
 * Guard window.open against the vendored SDK's clickUrl relay (audit N-19).
 *
 * The SDK (public/js/tron-ads-sdk-1.0.49.js) passes the ad iframe's
 * postMessage `clickUrl` value straight into window.open(value) without
 * validation — a compromised/adversarial ad feed could hand it a
 * javascript:/data: URL that would execute in this origin. The guard is
 * installed once, before the first ad initializes, and only lets absolute
 * http(s) URLs (or no URL at all) through. Every legitimate window.open
 * call site in this app opens http(s) URLs, so they are unaffected.
 *
 * The vendored SDK itself is intentionally left untouched.
 */
export function installWindowOpenGuard(): void {
  if (typeof window === 'undefined' || windowOpenGuardInstalled) return;
  windowOpenGuardInstalled = true;
  const originalOpen = window.open.bind(window);
  window.open = (
    url?: string | URL,
    target?: string,
    features?: string
  ): Window | null => {
    const href = url === undefined || url === null ? '' : String(url);
    if (href !== '' && !/^https?:\/\//i.test(href)) {
      console.warn('[TronAd] Blocked window.open with a non-http(s) URL.');
      return null;
    }
    return originalOpen(url, target, features);
  };
}

/** Sandbox every iframe currently inside root (initial sweep). */
function sandboxAdIframes(root: ParentNode): void {
  root.querySelectorAll('iframe').forEach((frame) => {
    frame.setAttribute('sandbox', TRON_AD_IFRAME_SANDBOX);
  });
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
    // Audit N-19: the window.open guard must be in place before the SDK's
    // message listener can relay a clickUrl, and the sandbox observer must
    // watch the wrapper before the SDK appends its iframe into it. The
    // observer fires in a microtask after insertion, before the frame's
    // navigation commits, so the flags apply to the first load.
    installWindowOpenGuard();
    const iframeObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLIFrameElement) {
            node.setAttribute('sandbox', TRON_AD_IFRAME_SANDBOX);
          }
        });
      }
    });
    if (boxRef.current) {
      sandboxAdIframes(boxRef.current);
      iframeObserver.observe(boxRef.current, { childList: true, subtree: true });
    }

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
    return () => {
      iframeObserver.disconnect();
      window.removeEventListener('resize', onResize);
    };
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
