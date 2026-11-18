from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="CarMake",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100, unique=True)),
                ("description", models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name="CarModel",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("vehicle_type", models.CharField(choices=[("Sedan", "Sedan"), ("SUV", "SUV"), ("Wagon", "Wagon"), ("Coupe", "Coupe"), ("Hatchback", "Hatchback"), ("Truck", "Truck")], max_length=20)),
                ("year", models.IntegerField(validators=[MinValueValidator(2015), MaxValueValidator(2023)])),
                ("make", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="models", to="djangoapp.carmake")),
            ],
            options={"ordering": ["make__name", "name", "year"], "unique_together": {("make", "name", "year")}},
        ),
    ]
