import csv
import io

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.http import HttpResponseRedirect
from django.shortcuts import render

from .forms import ParticipantChangeForm, ParticipantCreationForm
from .models import (
    Participant,
    Plan,
    PlanCategory,
    PlanItem,
    PlanItemGroup,
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


class SupportItemAdmin(admin.ModelAdmin):
    actions = ["import_csv"]

    def import_csv(self, request, queryset):  # noqa: C901
        template = "admin/import_csv.html"

        if "upload" in request.POST:
            csv_file = request.FILES["file"]
            data_set = csv_file.read().decode("UTF-8")
            io_string = io.StringIO(data_set)
            next(io_string)
            line_count = 0
            updates_count = 0
            errors_count = 0
            errors = []
            for column in csv.reader(io_string, delimiter=",", quotechar='"'):
                try:
                    line_count += 1

                    price_NT_SA_TAS_WA = column[8]
                    if not price_NT_SA_TAS_WA:
                        price_NT_SA_TAS_WA = 0
                    else:
                        price_NT_SA_TAS_WA = float(
                            price_NT_SA_TAS_WA[1:].replace(",", "")
                        )
                    price_ACT_NSW_QLD_VIC = column[9]
                    if not price_ACT_NSW_QLD_VIC:
                        price_ACT_NSW_QLD_VIC = 0
                    else:
                        price_ACT_NSW_QLD_VIC = float(
                            price_ACT_NSW_QLD_VIC[1:].replace(",", "")
                        )
                    price_national = column[10]
                    if not price_national:
                        price_national = 0
                    else:
                        price_national = float(
                            price_national[1:].replace(",", "")
                        )
                    price_remote = column[11]
                    if not price_remote:
                        price_remote = 0
                    else:
                        price_remote = float(price_remote[1:].replace(",", ""))
                    price_very_remote = column[12]
                    if not price_very_remote:
                        price_very_remote = 0
                    else:
                        price_very_remote = float(
                            price_very_remote[1:].replace(",", "")
                        )

                    (
                        registration_group,
                        created,
                    ) = RegistrationGroup.objects.get_or_create(
                        number=column[0],
                        defaults={"number": column[0], "name": column[1]},
                    )

                    (
                        support_category,
                        created,
                    ) = SupportCategory.objects.get_or_create(
                        number=column[2],
                        defaults={
                            "number": column[2],
                            "name": column[3],
                            "support_group_id": column[4].split("_")[4],
                        },
                    )

                    _, created = SupportItem.objects.update_or_create(
                        number=column[4],
                        defaults={
                            "name": column[5],
                            # 'description': column[],
                            "unit": column[6],
                            # 'quote': column[7],
                            # 'price_NT_SA_TAS_WA': price_NT_SA_TAS_WA,
                            # 'price_ACT_NSW_QLD_VIC': price_ACT_NSW_QLD_VIC,
                            "price_national": price_national,
                            "price_remote": price_remote,
                            "price_very_remote": price_very_remote,
                            "registration_group": registration_group,
                            "support_category": support_category,
                        },
                    )

                    if created:
                        updates_count += 1
                except Exception as e:
                    errors_count += 1
                    message = f"Line {line_count}: {e}"
                    errors.append(message)
                    print(message)
                    continue

            self.message_user(
                request,
                "Parsed {} Items from CSV. Updated {} Support Items. {} Errors. {}".format(
                    line_count, updates_count, errors_count, errors
                ),
            )
            return HttpResponseRedirect(request.get_full_path())

        return render(request, template, context={"supportitems": queryset})

    import_csv.short_description = "Import CSV File (Select any 1 item from below before choosing this action!)"


admin.site.register(Participant, ParticipantAdmin)
# Default registrations
admin.site.register(Plan)
admin.site.register(PlanCategory)
admin.site.register(PlanItemGroup)
admin.site.register(PlanItem)
admin.site.register(SupportGroup)
admin.site.register(SupportCategory)
admin.site.register(SupportItemGroup)
admin.site.register(SupportItem, SupportItemAdmin)
admin.site.register(RegistrationGroup)
