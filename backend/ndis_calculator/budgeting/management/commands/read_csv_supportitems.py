import csv

from django.core.management.base import BaseCommand

from budgeting.models import SupportItem, SupportItemGroup


def update_item(item_id, base_item_id):
    # locate objects
    support_item = SupportItem.objects.get(id=int(item_id))
    base_item_obj = SupportItem.objects.get(id=int(base_item_id))
    group = SupportItemGroup.objects.filter(base_item=base_item_obj).first()
    if not group:
        group = SupportItemGroup(
            base_item=base_item_obj, name=base_item_obj.name
        )
        group.save()
    # update support item's group
    support_item.support_item_group = group
    support_item.save()


class Command(BaseCommand):
    help = "Creates a support item group for every support item, then sets each support item's group to correspond"

    def handle(self, *args, **options):
        with open("budgeting/resources/item_group_map.csv") as file:
            item_maps = csv.reader(file)
            for row in item_maps:
                update_item(row[0], row[1])
        file.close()
