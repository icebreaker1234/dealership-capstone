from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("djangoapp", "0001_initial")]

    operations = [
        migrations.CreateModel(
            name="DealerReview",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("dealership", models.PositiveIntegerField(db_index=True)),
                ("name", models.CharField(max_length=200)),
                ("review", models.TextField()),
                ("purchase", models.BooleanField(default=False)),
                ("purchase_date", models.CharField(blank=True, max_length=20)),
                ("car_make", models.CharField(max_length=100)),
                ("car_model", models.CharField(max_length=100)),
                ("car_year", models.PositiveSmallIntegerField()),
                ("sentiment", models.CharField(default="neutral", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["id"]},
        ),
    ]
