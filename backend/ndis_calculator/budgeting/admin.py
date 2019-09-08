from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

from .forms import ParticipantChangeForm, ParticipantCreationForm
from .models import (
    Participant,
    Plan,
    PlanCategory,
    PlanItem,
    RegistrationGroup,
    SupportCategory,
    SupportGroup,
    SupportItem,
    SupportItemGroup,
)


class ParticipantAdmin(UserAdmin):
    add_form = ParticipantCreationForm
    form = ParticipantChangeForm
    model = Participant
    list_display = [
        "email",
        "first_name",
        "last_name",
        "postcode",
        "birth_year",
    ]


admin.site.register(Participant, ParticipantAdmin)
# Default registrations
admin.site.register(SupportGroup)
admin.site.register(SupportItem)
admin.site.register(SupportItemGroup)
admin.site.register(SupportCategory)
admin.site.register(RegistrationGroup)
admin.site.register(Plan)
admin.site.register(PlanCategory)
admin.site.register(PlanItem)
