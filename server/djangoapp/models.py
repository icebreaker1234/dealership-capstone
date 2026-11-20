from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class CarMake(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class CarModel(models.Model):
    class VehicleType(models.TextChoices):
        SEDAN = "Sedan", "Sedan"
        SUV = "SUV", "SUV"
        WAGON = "Wagon", "Wagon"
        COUPE = "Coupe", "Coupe"
        HATCHBACK = "Hatchback", "Hatchback"
        TRUCK = "Truck", "Truck"

    make = models.ForeignKey(CarMake, on_delete=models.CASCADE, related_name="models")
    name = models.CharField(max_length=100)
    vehicle_type = models.CharField(max_length=20, choices=VehicleType.choices)
    year = models.IntegerField(validators=[MinValueValidator(2015), MaxValueValidator(2023)])

    class Meta:
        ordering = ["make__name", "name", "year"]
        unique_together = (("make", "name", "year"),)

    def __str__(self):
        return f"{self.make} {self.name} ({self.year})"


class DealerReview(models.Model):
    dealership = models.PositiveIntegerField(db_index=True)
    name = models.CharField(max_length=200)
    review = models.TextField()
    purchase = models.BooleanField(default=False)
    purchase_date = models.CharField(max_length=20, blank=True)
    car_make = models.CharField(max_length=100)
    car_model = models.CharField(max_length=100)
    car_year = models.PositiveSmallIntegerField()
    sentiment = models.CharField(max_length=20, default="neutral")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"Review for dealer {self.dealership} by {self.name}"
