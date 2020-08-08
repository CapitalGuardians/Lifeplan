from django.test import TestCase

from budgeting.models import (
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


class ParticipantTest(TestCase):
    @staticmethod
    def create_Participant(
        username="test",
        first_name="John",
        last_name="Smith",
        password="password123",
        email="John.Smith@test.com",
        postcode="3000",
        birth_year="1945",
    ):
        if Participant.objects.filter(username="test").first():
            return Participant.objects.first()
        else:
            return Participant.objects.create(
                username=username,
                first_name=first_name,
                last_name=last_name,
                password=password,
                email=email,
                postcode=postcode,
                birth_year=birth_year,
            )

    def test_Participant(self):
        cu = self.create_Participant()
        self.assertTrue(isinstance(cu, Participant))
        # self.assertEqual() - assert any custom methods we create work


class SupportGroupTest(TestCase):
    @staticmethod
    def create_Group(name="testGroup"):
        if SupportGroup.objects.filter(name=name).first():
            return SupportGroup.objects.first()
        else:
            return SupportGroup.objects.create(name=name)

    def test_Group(self):
        group = self.create_Group()
        self.assertTrue(isinstance(group, SupportGroup))


class SupportCategoryTest(TestCase):
    @staticmethod
    def create_Category(name="testCat", number=12):
        group = SupportGroupTest.create_Group()
        if SupportCategory.objects.filter(number=number):
            return SupportCategory.objects.first()
        else:
            return SupportCategory.objects.create(
                support_group=group, name=name, number=number
            )

    def test_Category(self):
        cat = self.create_Category()
        self.assertTrue(isinstance(cat, SupportCategory))


class RegistrationGroupTest(TestCase):
    @staticmethod
    def create_RegistrationGroup(number=123, name="testGroup"):
        if RegistrationGroup.objects.filter(number=number).first():
            return RegistrationGroup.objects.first()
        else:
            return RegistrationGroup.objects.create(number=number, name=name)

    def test_Category(self):
        rg = self.create_RegistrationGroup()
        self.assertTrue(isinstance(rg, RegistrationGroup))


class SupportItemTest(TestCase):
    @staticmethod
    def create_SupportItem(
        number=137,
        name="item1",
        description="this is some description",
        unit="H",
        price_national=850.25,
        category=SupportCategoryTest.create_Category(),
        registration_group=RegistrationGroupTest.create_RegistrationGroup(),
    ):
        if SupportItem.objects.filter(number=number).first():
            return SupportItem.objects.first()
        else:
            return SupportItem.objects.create(
                number=number,
                name=name,
                description=description,
                unit=unit,
                price_national=price_national,
                support_category=category,
                registration_group=registration_group,
            )

    def test_SupportItem(self):
        si = self.create_SupportItem(
            category=SupportCategoryTest.create_Category()
        )
        self.assertTrue(isinstance(si, SupportItem))


class SupportItemGroupTest(TestCase):
    @staticmethod
    def create_SupportItemGroup(name="itemGroup1"):
        if SupportItemGroup.objects.first():
            return SupportItemGroup.objects.first()
        else:
            return SupportItemGroup.objects.create(
                name=name, base_item=SupportItemTest.create_SupportItem()
            )

    def test_SupportItemGroup(self):
        sig = self.create_SupportItemGroup(name="Renamed")
        self.assertTrue(isinstance(sig, SupportItemGroup))


class PlanContainsCategoriesTest(TestCase):
    @staticmethod
    def create_PlanContainsCategories(
        plan, category=SupportCategoryTest.create_Category(), amount=1000.50
    ):
        if PlanCategory.objects.filter(plan=plan).first():
            return PlanCategory.objects.first()
        else:
            return PlanCategory.objects.create(
                plan=plan, support_category=category, budget=amount
            )


class PlanItemGroupTest(TestCase):
    @staticmethod
    def create_PlanItemGroup(
        plan_category,
        support_item_group=SupportItemGroupTest.create_SupportItemGroup(),
        name="itemGroup1",
    ):
        if PlanItemGroup.objects.filter(plan_category=plan_category).first():
            return PlanItemGroup.objects.first()
        else:
            return PlanItemGroup.objects.create(
                plan_category=plan_category,
                support_item_group=support_item_group,
                name=name,
            )


class PlanItemTest(TestCase):
    @staticmethod
    def create_PlanItem(
        plan_item_group,
        name="item1",
        price_actual=100.20,
        all_day=False,
        start_date="2018-06-01",
        end_date="2019-06-01",
    ):
        return PlanItem.objects.create(
            plan_item_group=plan_item_group,
            name=name,
            price_actual=price_actual,
            all_day=all_day,
            start_date=start_date,
            end_date=end_date,
        )


class PlanTest(TestCase):
    p = None

    def setUp(self) -> None:
        self.p = None

    def create_Plan(self):
        obj = Plan.objects.create(
            participant=ParticipantTest.create_Participant(),
            start_date="2018-06-01",
            end_date="2019-06-01",
        )
        self.categories = PlanContainsCategoriesTest.create_PlanContainsCategories(
            plan=obj
        )
        self.item_groups = PlanItemGroupTest.create_PlanItemGroup(
            plan_category=self.categories
        )
        self.items = PlanItemTest.create_PlanItem(
            plan_item_group=self.item_groups
        )
        return obj

    def test_Plan(self):
        if self.p is None:
            self.p = self.create_Plan()
        self.assertTrue(isinstance(self.p, Plan))

    def test_PlanContainsCategories(self):
        if self.p is None:
            self.p = self.create_Plan()
        self.assertTrue(isinstance(self.categories, PlanCategory))

    def test_PlanContainsItemGroups(self):
        if self.p is None:
            self.p = self.create_Plan()
        self.assertTrue(isinstance(self.item_groups, PlanItemGroup))

    def test_PlanContainsItems(self):
        if self.p is None:
            self.p = self.create_Plan()
        self.assertTrue(isinstance(self.items, PlanItem))
