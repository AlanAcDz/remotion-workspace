# Arya screen captures

Records the Arya app on an iOS Simulator with seeded demo data, for the
`arya-video-production` pipeline. Nothing here touches real user data.

## One-time setup

1. Create a dedicated simulator (English, so system dialogs match the app):

   ```console
   xcrun simctl create "Arya Video Capture" "iPhone 18 Pro" com.apple.CoreSimulator.SimRuntime.iOS-27-0
   xcrun simctl spawn <udid> defaults write -g AppleLanguages -array en-US
   xcrun simctl spawn <udid> defaults write -g AppleLocale en_US
   ```

2. Build the **dev variant in Release** from `arya-tracker` and install it. Release
   embeds the JS bundle (no dev menu or LogBox), and every non-production
   variant runs as Premium, so free-tier limits never get in the way:

   ```console
   APP_VARIANT=development xcodebuild -workspace ios/AryaTrackerDev.xcworkspace \
     -scheme AryaTrackerDev -configuration Release -sdk iphonesimulator \
     -destination "id=<udid>" -derivedDataPath /tmp/arya-release-build build
   xcrun simctl install <udid> /tmp/arya-release-build/Build/Products/Release-iphonesimulator/AryaTrackerDev.app
   ```

3. Launch it once (to create the database), then stage a scenario and allow
   notifications the first time the prompt appears.

## Recording

```console
export ARYA_CAPTURE_UDID=<udid>
source scripts/arya/capture/cap.sh
stage single 08:05      # seed + relaunch with the app's clock near 8:05 AM
rec my-take; tap 201 260; …; stop
```

`stage` launches the app with a whole-hour `TZ`, so its local time can be any
hour while the minutes follow the real clock. Scenarios live in `seed.py`:
`single`, `single-notify`, `story`, `three-meds`, `refill`, `empty`.

Demo media in `photos/` comes from Alan's store-screenshot set: Arya, friends'
pets, and made-up products (Paw Boost, Magic Drops, Feli-Calm).

## Gotchas

- `idb`'s HID commands fail on Xcode 27 (SimulatorKit moved); use AXe.
- Instant taps sometimes don't register; `tap` uses a 0.1 s touch instead.
- AXe hardware buttons (home, lock) do nothing on this runtime, so
  notifications are recorded as in-app banners.
- `axe type` can drop repeated keys on the number pad; tap the keys instead.
- Recordings are variable frame rate and stop growing when the screen is still.
  Hold the last frame when transcoding to constant 30 fps.
- `status_bar override --time` rejects some values (e.g. `9:00`); retry a
  minute later.
