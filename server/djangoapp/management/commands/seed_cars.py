import json
from pathlib import Path
from django.core.management.base import BaseCommand
from djangoapp.models import CarMake, CarModel


class Command(BaseCommand):
    help = "Load the included car inventory into Django's car make/model tables."

    def handle(self, *args, **options):
        data_path = Path(__file__).resolve().parents[3] / "database" / "data" / "car_records.json"
        rows = json.loads(data_path.read_text(encoding="utf-8")).get("cars", [])
        made = 0
        for row in rows:
            make, _ = CarMake.objects.get_or_create(name=row["make"])
            year = int(row["year"])
            if year < 2015 or year > 2023:
                continue
            _, created = CarModel.objects.get_or_create(
                make=make, name=row["model"], year=year,
                defaults={"vehicle_type": row.get("bodyType", "Sedan")},
            )
            made += int(created)
        self.stdout.write(self.style.SUCCESS(f"Loaded {made} car model records."))
