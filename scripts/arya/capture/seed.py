"""Seed the Arya dev app's SQLite database with a demo scenario for screen captures.

Usage: python3 seed.py <scenario> <tz> <data-container>

All times are computed in <tz>, the same timezone the app is launched with, so
"today" and dose times line up with what the app shows. Timestamps are stored as
unix seconds, which is how Drizzle's `timestamp` mode persists them.
"""

import random
import shutil
import sqlite3
import sys
from datetime import datetime, time, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

PHOTOS = Path(__file__).resolve().parent / "photos"
random.seed(7)


def ts(value: datetime) -> int:
    return int(value.timestamp())


def at(day: datetime, hhmm: str) -> datetime:
    hours, minutes = map(int, hhmm.split(":"))
    return day.replace(hour=hours, minute=minutes, second=0, microsecond=0)


class Seeder:
    def __init__(self, container: Path, tz: str):
        self.docs = container / "Documents"
        self.db = sqlite3.connect(self.docs / "SQLite" / "arya-tracker.db")
        self.tz = ZoneInfo(tz)
        self.now = datetime.now(self.tz)
        self.today = self.now.replace(hour=0, minute=0, second=0, microsecond=0)

    def reset(self):
        for table in ("doses", "frequency_configs", "notifications", "events", "treatments", "pets"):
            self.db.execute(f"DELETE FROM {table}")
        self.db.execute("DELETE FROM reminder_sync_state")
        # Onboarding creates this row in a fresh install; seeding skips onboarding.
        self.db.execute("DELETE FROM user_settings")
        self.db.execute(
            "INSERT INTO user_settings (id, language, theme, wake_time, sleep_time, "
            "has_completed_onboarding, last_review_request_at) VALUES (1, 'en', 'light', '08:00', '22:00', 1, ?)",
            (ts(self.now),),
        )
        for subdir in ("pets", "treatments"):
            folder = self.docs / subdir
            if folder.exists():
                shutil.rmtree(folder)
            folder.mkdir(parents=True)

    def photo(self, subdir: str, name: str) -> str:
        shutil.copy(PHOTOS / f"{name}.jpg", self.docs / subdir / f"{name}.jpg")
        return f"{subdir}/{name}.jpg"

    def pet(self, name, species, breed, birth, weight, photo):
        cursor = self.db.execute(
            "INSERT INTO pets (name, species, breed, birth_date, weight, photo_uri) VALUES (?,?,?,?,?,?)",
            (name, species, breed, ts(datetime.fromisoformat(birth).replace(tzinfo=self.tz)), weight,
             self.photo("pets", photo)),
        )
        return cursor.lastrowid

    def treatment(self, pet_id, name, dosage, times, days_ago, *, days_left=None, photo=None,
                  remaining=None, threshold=3, skipped=(), pending_at=None):
        """Create a daily treatment with resolved history and exactly one pending dose.

        `pending_at` is the slot left unresolved; it defaults to the latest slot
        that is no more than 30 minutes in the future, which the app treats as on time.
        """
        start = self.today - timedelta(days=days_ago)
        end = None if days_left is None else at(self.today + timedelta(days=days_left), "23:59")
        cursor = self.db.execute(
            "INSERT INTO treatments (pet_id, name, start_date, end_date, is_chronic, dosage, photo_uri, "
            "remaining_doses, refill_threshold) VALUES (?,?,?,?,?,?,?,?,?)",
            (pet_id, name, ts(start), ts(end) if end else None, 1 if end is None else 0, dosage,
             self.photo("treatments", photo) if photo else None, remaining, threshold),
        )
        treatment_id = cursor.lastrowid
        self.db.execute(
            "INSERT INTO frequency_configs (treatment_id, type, times, suggested_times, respect_sleep_schedule) "
            "VALUES (?, 'daily', ?, ?, 1)",
            (treatment_id, len(times), "[" + ",".join(f'"{t}"' for t in times) + "]"),
        )

        slots = [at(start + timedelta(days=d), t) for d in range(days_ago + 2) for t in times]
        if pending_at is None:
            pending_at = max(s for s in slots if s <= self.now + timedelta(minutes=30))
        for slot in slots:
            if slot > pending_at:
                break
            if slot == pending_at:
                self.db.execute(
                    "INSERT INTO doses (treatment_id, scheduled_for) VALUES (?,?)", (treatment_id, ts(slot))
                )
                break
            day_offset = (self.today - slot.replace(hour=0, minute=0)).days
            if (day_offset, slot.strftime("%H:%M")) in skipped:
                self.db.execute(
                    "INSERT INTO doses (treatment_id, scheduled_for, skipped, resolved_at, resolution_source) "
                    "VALUES (?,?,1,?, 'in_app')",
                    (treatment_id, ts(slot), ts(slot + timedelta(minutes=random.randint(5, 40)))),
                )
                continue
            taken = slot + timedelta(minutes=random.randint(0, 22))
            self.db.execute(
                "INSERT INTO doses (treatment_id, scheduled_for, taken_at, resolved_at, resolution_source) "
                "VALUES (?,?,?,?, 'in_app')",
                (treatment_id, ts(slot), ts(taken), ts(taken)),
            )
        return treatment_id

    def arya(self):
        return self.pet("Arya", "dog", "Terrier mix", "2021-03-12", 6.4, "arya")


def main():
    scenario, tz, container = sys.argv[1], sys.argv[2], Path(sys.argv[3])
    seeder = Seeder(container, tz)
    seeder.reset()
    arya = seeder.arya()

    if scenario == "single":  # 02, 03, 07, 08: one pet, one antibiotic, two weeks of history
        seeder.treatment(arya, "Antibiotic", "1 pill", ["08:00", "20:00"], 13, days_left=14,
                         skipped={(5, "20:00"), (9, "08:00")})
    elif scenario == "single-notify":  # 05 notification: the evening dose is two minutes away
        evening = (seeder.now + timedelta(minutes=2)).strftime("%H:%M")
        seeder.treatment(arya, "Antibiotic", "1 pill", ["08:00", evening], 13, days_left=14,
                         skipped={(5, evening), (9, "08:00")})
    elif scenario == "story":  # 01: antibiotic and eye drops, both due now
        seeder.treatment(arya, "Antibiotic", "1 pill", ["08:00", "20:00"], 10, days_left=18)
        seeder.treatment(arya, "Eye drops", "1 drop", ["08:00", "15:00", "22:00"], 3, days_left=11)
    elif scenario == "three-meds":  # 04: one taken, one on time, one overdue
        seeder.treatment(arya, "Antibiotic", "1 pill", ["08:00", "20:00"], 6, days_left=8,
                         pending_at=at(seeder.today, "20:00"))
        seeder.treatment(arya, "Magic Drops", "1 drop", ["08:00", "15:00", "22:00"], 6, days_left=4,
                         photo="magic-drops")
        seeder.treatment(arya, "Paw Boost", "1 chew", ["12:00"], 6, days_left=8, photo="paw-boost",
                         pending_at=at(seeder.today, "12:00"))
    elif scenario == "refill":  # 09: chronic supplement one dose above the refill threshold
        seeder.treatment(arya, "Paw Boost", "1 chew", ["09:00"], 20, photo="paw-boost",
                         remaining=4, threshold=3)
        # A later dose keeps Today out of its "All caught up" state, which hides refill alerts.
        seeder.treatment(arya, "Magic Drops", "1 drop", ["08:00", "15:00", "22:00"], 4, days_left=6,
                         photo="magic-drops", pending_at=at(seeder.today, "15:00"))
    elif scenario == "empty":  # 05 create flow: Arya only
        pass
    else:
        sys.exit(f"Unknown scenario {scenario}")

    seeder.db.commit()
    print(f"{scenario}: seeded at {seeder.now:%Y-%m-%d %H:%M} {tz}")


if __name__ == "__main__":
    main()
