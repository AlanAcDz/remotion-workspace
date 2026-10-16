"""Print the Etc/GMT zone whose local time is closest to HH:MM right now."""
import sys
from datetime import datetime, timezone

target_h, target_m = map(int, sys.argv[1].split(":"))
now = datetime.now(timezone.utc)
diff = ((target_h * 60 + target_m) - (now.hour * 60 + now.minute)) / 60
offset = round(diff)
if offset > 14:
    offset -= 24
if offset < -12:
    offset += 24
# Etc/GMT names use POSIX signs: Etc/GMT+5 is UTC-5.
print("Etc/UTC" if offset == 0 else f"Etc/GMT{-offset:+d}")
