#!/bin/zsh
# Capture helpers for Arya app screen recordings on an iOS Simulator.
# Usage: source scripts/arya/capture/cap.sh, then `stage`, `rec`, `stop`, taps…
# Requires: AXe (brew install cameroncooke/axe/axe), ImageMagick, ffmpeg, and
# the Arya dev variant installed on the simulator in $ARYA_CAPTURE_UDID.
CAP=${0:A:h}
UDID=${ARYA_CAPTURE_UDID:?set ARYA_CAPTURE_UDID to the capture simulator}
APP=com.devaces.aryatracker.dev
OUT=${ARYA_CAPTURE_OUT:-$CAP/../../../out/arya/captures/raw}

container() { xcrun simctl get_app_container $UDID $APP data; }

# stage <scenario> <HH:MM>: quit the app, seed the scenario so the app's local
# time is near HH:MM (via a whole-hour TZ), pin the status bar, relaunch.
stage() {
  local tz=$(python3 $CAP/tzfor.py $2)
  xcrun simctl terminate $UDID $APP 2>/dev/null
  python3 $CAP/seed.py $1 $tz "$(container)" || return 1
  echo $tz > ${TMPDIR:-/tmp}/arya-capture-tz
  xcrun simctl status_bar $UDID override --time "$(TZ=$tz date +%-H:%M)" --batteryState charged \
    --batteryLevel 100 --cellularBars 4 --wifiBars 3 --dataNetwork wifi
  SIMCTL_CHILD_TZ=$tz xcrun simctl launch $UDID $APP >/dev/null
}

# Recordings are variable frame rate: frames are written only when the screen
# changes, so a still tail adds no duration. Hold the last frame when ingesting.
rec() {
  mkdir -p $OUT
  xcrun simctl io $UDID recordVideo --codec=h264 --force $OUT/$1.mp4 >/dev/null 2>&1 &
  echo $! > ${TMPDIR:-/tmp}/arya-capture-rec.pid
  sleep 1.5
}
stop() { kill -INT $(cat ${TMPDIR:-/tmp}/arya-capture-rec.pid); sleep 2; }

# Instant synthetic taps are unreliable in this app; a 0.1 s touch always lands.
tap() { axe touch -x $1 -y $2 --down --up --delay 0.1 --udid $UDID >/dev/null; }
press() { axe touch -x $1 -y $2 --down --up --delay 0.12 --udid $UDID >/dev/null; }
swipe() { axe swipe --start-x $1 --start-y $2 --end-x $3 --end-y $4 --duration ${5:-0.6} --udid $UDID >/dev/null; }
typ() { axe type "$1" --udid $UDID >/dev/null; }
tree() { axe describe-ui --udid $UDID 2>/dev/null | python3 $CAP/ax.py; }
tapl() {
  local xy=$(axe describe-ui --udid $UDID 2>/dev/null | python3 $CAP/find.py "$1")
  [[ -z $xy ]] && { echo "not found: $1"; return 1; }
  tap ${=xy}
}
