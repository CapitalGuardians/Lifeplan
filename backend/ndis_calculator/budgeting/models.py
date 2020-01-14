from django.contrib.auth.models import AbstractUser
from django.db import models
from ndis_calculator import settings

from .managers import CustomUserManager
from .validators import validate_birth_year, validate_postcode

# Create your models here.


class Participant(AbstractUser):
    objects = CustomUserManager()

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    postcode = models.CharField(max_length=4, validators=[validate_postcode])
    birth_year = models.IntegerField(validators=[validate_birth_year])
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("id",)

    def __str__(self):
        return self.email + " " + self.first_name + " " + self.last_name


# a static table stores all groups, e.g. Core.
# Participants cannot manipulate data in this table, but they can retrieve data
class SupportGroup(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name + " (" + self.id.__str__() + ")"


class SupportCategory(models.Model):
    support_group = models.ForeignKey(
        SupportGroup,
        related_name="support_categories",
        on_delete=models.PROTECT,
    )

    number = models.IntegerField(unique=True)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name + " ID: (" + self.id.__str__() + ")"


class SupportItem(models.Model):
    EACH = "EA"
    HOUR = "H"
    DAY = "D"
    WEEK = "WK"
    MONTH = "MON"
    YEAR = "YR"

    UNIT_CHOICES = [
        (EACH, "each"),
        (HOUR, "hour"),
        (DAY, "day"),
        (WEEK, "week"),
        (MONTH, "month"),
        (YEAR, "year"),
    ]

    support_item_group = models.ForeignKey(
        "SupportItemGroup", on_delete=models.PROTECT, null=True, blank=True
    )
    support_category = models.ForeignKey(
        SupportCategory, on_delete=models.PROTECT
    )
    registration_group = models.ForeignKey(
        "RegistrationGroup", on_delete=models.PROTECT
    )

    name = models.CharField(max_length=255)
    number = models.CharField(max_length=255, unique=True)
    description = models.TextField(default="No description provided")
    unit = models.CharField(max_length=3, choices=UNIT_CHOICES)
    price_NT_SA_TAS_WA = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    price_ACT_NSW_QLD_VIC = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    price_national = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    price_remote = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    price_very_remote = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    def __str__(self):
        return self.name + " ID: (" + self.id.__str__() + ")"


class SupportItemGroup(models.Model):
    """
        Simple english naming for a set of highly related support items
    """

    name = models.CharField(max_length=255)
    base_item = models.OneToOneField(SupportItem, on_delete=models.PROTECT)

    # the below methods just present the base Item information as our own
    def unit(self):
        return self.base_item.unit

    def price(self):
        return self.base_item.price_national

    def registration_group_id(self):
        return self.base_item.registration_group_id

    def support_category_id(self):
        return self.base_item.support_category_id

    def description(self):
        return self.base_item.description

    def __str__(self):
        return self.name + " ID: (" + self.id.__str__() + ")"


class RegistrationGroup(models.Model):
    number = models.IntegerField(unique=True)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name + " ID: (" + self.id.__str__() + ")"


class Plan(models.Model):
    participant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="plans",
        null=True,
        on_delete=models.SET_NULL,
    )

    start_date = models.DateField()
    end_date = models.DateField()
    generated = models.BooleanField(default=False)

    # support_categories = models.ManyToManyField(
    #     SupportCategory, through="PlanCategory"
    # )

    def __str__(self):
        return (
            " ID: ("
            + self.id.__str__()
            + ")"
            + "Participant: "
            + self.participant_id.__str__()
        )


class PlanCategory(models.Model):
    plan = models.ForeignKey(
        Plan, related_name="plan_categories", on_delete=models.PROTECT
    )
    support_category = models.ForeignKey(
        SupportCategory, on_delete=models.PROTECT
    )

    budget = models.DecimalField(max_digits=10, decimal_places=2)


class PlanItem(models.Model):
    plan_category = models.ForeignKey(
        PlanCategory, related_name="plan_items", on_delete=models.PROTECT
    )
    support_item_group = models.ForeignKey(
        SupportItemGroup, on_delete=models.PROTECT
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=1)
    price_actual = models.DecimalField(max_digits=10, decimal_places=2)
    frequency_per_year = models.IntegerField(null=True, blank=True)
    name = models.CharField(max_length=255)
