# Generated by Django 2.2 on 2019-05-15 01:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('budgeting', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='birthday',
            field=models.DateField(blank=True, null=True),
        ),
    ]
