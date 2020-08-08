from django.core.management.base import BaseCommand

from budgeting.models import SupportItem, SupportItemGroup


class Command(BaseCommand):
    help = "Creates a support item group for every support item, then sets each support item's group to correspond"

    def handle(self, *args, **options):
        items = SupportItem.objects.all()
        for item in items:
            item_group = SupportItemGroup(name=item.name, base_item=item)
            item_group.save()
            item.support_item_group = item_group
            item.save()
