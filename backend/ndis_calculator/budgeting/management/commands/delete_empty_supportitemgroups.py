from django.core.management.base import BaseCommand

from budgeting.models import SupportItem, SupportItemGroup


class Command(BaseCommand):
    help = "Creates a support item group for every support item, then sets each support item's group to correspond"

    def handle(self, *args, **options):
        item_groups = SupportItemGroup.objects.all()
        items = SupportItem.objects.all()
        for item_group in item_groups:
            item_count = 0
            # if at least one item lists this as its group, don't remove
            for item in items:
                if item.support_item_group == item_group:
                    item_count += 1
            if item_count == 0:
                item_group.delete()
