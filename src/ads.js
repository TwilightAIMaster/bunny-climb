// AdMob configuration and helper functions for Bunny Climb.
//
// REPLACE the placeholder IDs below with your real AdMob IDs before release.
// Until you paste real IDs, the app automatically uses Google's official test
// ad units, which show real "Test Ad" placeholders and never earn revenue.
//
// After pasting real IDs, also update ios/App/App/Info.plist:
//   <key>GADApplicationIdentifier</key>
//   <string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
//
// Get your IDs at https://admob.google.com → your app → Ad units.

import { AdMob, BannerAdPosition, BannerAdSize } from "@capacitor-community/admob";
import { Capacitor } from "@capacitor/core";

// ==== REAL ADMOB IDS ====
const PROD_IOS_APP_ID = "ca-app-pub-9768361519661229~5909269582";
const PROD_IOS_BANNER_ID = "ca-app-pub-9768361519661229/9645334615";
const PROD_IOS_INTERSTITIAL_ID = "ca-app-pub-9768361519661229/9968768242";
// =========================================

// Google's official test ad unit IDs — safe to use during development.
// See https://developers.google.com/admob/ios/test-ads
const TEST_IOS_BANNER_ID = "ca-app-pub-3940256099942544/2934735716";
const TEST_IOS_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/4411468910";

const useTestAds = !PROD_IOS_BANNER_ID || !PROD_IOS_INTERSTITIAL_ID;

export const AD_IDS = {
  banner: useTestAds ? TEST_IOS_BANNER_ID : PROD_IOS_BANNER_ID,
  interstitial: useTestAds ? TEST_IOS_INTERSTITIAL_ID : PROD_IOS_INTERSTITIAL_ID,
};

let initialized = false;
let interstitialReady = false;
let bannerVisible = false;

// Only run AdMob on native platforms (iOS/Android). In the browser dev build,
// AdMob calls are no-ops so the game still runs normally.
const isNative = () => Capacitor.getPlatform() !== "web";

export async function initAds() {
  if (!isNative() || initialized) return;
  try {
    // Show Apple's App Tracking Transparency prompt on iOS before initializing
    // AdMob. Without this call, the ATT framework is linked but the dialog
    // never appears, which causes automatic App Store rejection.
    try {
      const { status } = await AdMob.trackingAuthorizationStatus();
      if (status === "notDetermined") {
        await AdMob.requestTrackingAuthorization();
      }
    } catch (e) {
      console.warn("ATT request failed:", e);
    }

    await AdMob.initialize({
      initializeForTesting: useTestAds,
      // tagForChildDirectedTreatment / tagForUnderAgeOfConsent default to false.
    });
    initialized = true;
    // Preload the first interstitial so it's ready for the first Game Over.
    prepareInterstitial();
  } catch (e) {
    console.warn("AdMob init failed:", e);
  }
}

export async function showBanner() {
  if (!isNative() || !initialized || bannerVisible) return;
  try {
    await AdMob.showBanner({
      adId: AD_IDS.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: useTestAds,
    });
    bannerVisible = true;
  } catch (e) {
    console.warn("Banner show failed:", e);
  }
}

export async function hideBanner() {
  if (!isNative() || !bannerVisible) return;
  try {
    await AdMob.hideBanner();
    bannerVisible = false;
  } catch (e) {
    console.warn("Banner hide failed:", e);
  }
}

export async function prepareInterstitial() {
  if (!isNative() || !initialized) return;
  try {
    await AdMob.prepareInterstitial({
      adId: AD_IDS.interstitial,
      isTesting: useTestAds,
    });
    interstitialReady = true;
  } catch (e) {
    interstitialReady = false;
    console.warn("Interstitial prepare failed:", e);
  }
}

export async function showInterstitial() {
  if (!isNative() || !initialized || !interstitialReady) return;
  try {
    await AdMob.showInterstitial();
    interstitialReady = false;
    // Preload the next one for the following Game Over.
    prepareInterstitial();
  } catch (e) {
    console.warn("Interstitial show failed:", e);
  }
}
