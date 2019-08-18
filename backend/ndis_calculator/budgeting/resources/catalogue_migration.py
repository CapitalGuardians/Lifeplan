# Generated by Django 2.2 on 2019-07-27 04:44

from django.db import migrations
import csv
from re import sub
from decimal import Decimal

FILE_NAME = "budgeting/resources/support_catalogue.csv"

class Migration(migrations.Migration):

    def import_csv(apps, schema_editor):
        RegistrationGroup = apps.get_model('budgeting', 'RegistrationGroup')
        SupportCategory = apps.get_model('budgeting', 'SupportCategory')
        SupportItem = apps.get_model('budgeting', 'SupportItem')

        with open(FILE_NAME, encoding='windows-1252') as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            line_count=0

            for row in csv_reader:
                if line_count != 0:
                    registration_group_number = int(row[0])
                    registration_group_name = row[1]
                    support_category_number = int(row[2])
                    support_category_name = row[3]
                    support_item_number = row[4]
                    support_item_name = row[5]
                    support_item_description = row[6]
                    support_item_unit = row[7]
                    support_item_price_NA_SA_TAS_WA = Decimal(sub(r'[^\d.]', '', row[10])) if row[10] != '' else None
                    support_item_price_ACT_NSW_QLD_VIC = Decimal(sub(r'[^\d.]', '', row[11])) if row[11] != '' else None
                    support_item_price_national = Decimal(sub(r'[^\d.]', '', row[12])) if row[12] != '' else None
                    support_item_price_remote = Decimal(sub(r'[^\d.]', '', row[13])) if row[13] != '' else None
                    support_item_price_very_remote = Decimal(sub(r'[^\d.]', '', row[14])) if row[14] != '' else None


                    registration_group, created = RegistrationGroup.objects.get_or_create(
                        number=registration_group_number,
                        defaults={'name':registration_group_name}
                    )

                    if support_category_number < 5:
                        support_group_id = 1
                    elif support_category_number < 14:
                        support_group_id = 2
                    else:
                        support_group_id =3


                    support_category, create = SupportCategory.objects.get_or_create(
                        number=support_category_number,
                        defaults={
                            'name':support_category_name,
                            'support_group_id': support_group_id
                        }
                    )

                    SupportItem.objects.create(
                        name=support_item_name,
                        number=support_item_number,
                        description=support_item_description,
                        unit=support_item_unit,
                        price_NA_SA_TAS_WA=support_item_price_NA_SA_TAS_WA,
                        price_ACT_NSW_QLD_VIC=support_item_price_ACT_NSW_QLD_VIC,
                        price_national=support_item_price_national,
                        price_remote=support_item_price_remote,
                        price_very_remote=support_item_price_very_remote,
                        registration_group_id=registration_group.id,
                        support_category_id=support_category.id
                    )
                line_count += 1






    dependencies = [
        ('budgeting', '0002_auto_20190727_0437'),
    ]

    operations = [
        migrations.RunPython(import_csv),
    ]
