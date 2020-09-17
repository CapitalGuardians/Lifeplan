from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

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
from .serializers import (
    ParticipantSerializer,
    PlanCategorySerializer,
    PlanItemGroupSerializer,
    PlanItemSerializer,
    PlanSerializer,
    RegistrationGroupSerializer,
    SupportCategorySerializer,
    SupportGroupSerializer,
    SupportItemGroupSerializer,
    SupportItemSerializer,
)

# Create your views here.


class DefaultView(View):
    def get(self, request, *args, **kwargs):
        return HttpResponse("Hello, World!")


# DO NOT COPY THE STRUCTURE OF THE FOLLOWING CLASS
class Authentication(APIView):
    permission_classes = (AllowAny,)

    @api_view(["POST"])
    @csrf_exempt
    def register(request):
        if request.method == "POST":
            request.data["username"] = request.data.get("email")
            serializer = ParticipantSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                refresh = RefreshToken.for_user(user)
                tokens = {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
                return Response(
                    {"id": user.id, "tokens": tokens},
                    status=status.HTTP_201_CREATED,
                )
            print(serializer.errors)
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )


# DO NOT COPY THE STRUCTURE OF THE FOLLOWING CLASS
class ParticipantView(APIView):
    permission_classes = (IsAuthenticated,)

    @api_view(["GET"])
    @csrf_exempt
    def current_user(request):
        if request.method == "GET":
            serializer = ParticipantSerializer(request.user)
            data = serializer.data
            return Response(data)

    @api_view(["PUT"])
    @csrf_exempt
    def update(request, participant_id):
        try:
            participant = Participant.objects.get(pk=participant_id)
        except Participant.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if request.method == "PUT":
            request.data["username"] = request.data.get("email")
            serializer = ParticipantSerializer(
                participant, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors)


class ParticipantViewSet(viewsets.ModelViewSet):
    """
    This viewset provides `update`
    action to manipulate the Participant model.
    """

    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer
    permission_classes = (IsAuthenticated,)

    def update(self, request, participant_id):
        participant = get_object_or_404(self.queryset, pk=participant_id)
        request.data["username"] = request.data.get("email")
        serializer = self.serializer_class(
            participant, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlanViewSet(viewsets.ModelViewSet):
    """
    This viewset provides `list`, `create`, `retrieve`, `update`
    and `destroy` actions to manipulate the Plan model.
    """

    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    permission_classes = (IsAuthenticated,)

    def list(self, request):
        queryset = self.queryset.filter(participant_id=self.request.user.id)
        serializer = self.serializer_class(queryset, many=True)

        return Response(serializer.data)

    # def show(self, request):
    #     plan = get_object_or_404(self.queryset, pk=plan_id)
    #     if plan.participant_id == request.user.id:
    #         plan_serializer = self.serializer_class(plan)
    #         return Response(plan_serializer.data, status=status.HTTP_200_OK)
    #     else:
    #         return Response(status=status.HTTP_403_FORBIDDEN)

    def create(self, request):
        plan_serializer = self.serializer_class(data=request.data)
        if plan_serializer.is_valid():
            plan = plan_serializer.save(participant=self.request.user)
            plan_categories = []

            # take an array representing the budgets, where each element is an array of (support_category_id, budget)
            for support_category_dict in request.data["support_categories"]:
                support_category = get_object_or_404(
                    SupportCategory.objects.all(),
                    pk=support_category_dict["support_category"],
                )

                plan_category_serializer = PlanCategorySerializer(
                    data={"budget": support_category_dict["budget"]}
                )
                if plan_category_serializer.is_valid():
                    plan_category = plan_category_serializer.save(
                        plan=plan, support_category=support_category
                    )
                    plan_categories.append(plan_category)

                else:
                    for plan_category in plan_categories:
                        plan_category.delete()
                    plan.delete()
                    return Response(
                        plan_category_serializer.errors,
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            return Response(
                plan_serializer.data, status=status.HTTP_201_CREATED
            )
        return Response(
            plan_serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, plan_id):
        plan = get_object_or_404(self.queryset, pk=plan_id)
        if plan.participant_id == request.user.id:
            plan_serializer = self.serializer_class(
                plan, data=request.data, partial=True
            )
            if plan_serializer.is_valid():
                plan_categories = []
                for plan_category_element in request.data["plan_categories"]:
                    plan_category = get_object_or_404(
                        PlanCategory.objects.all(),
                        pk=plan_category_element["id"],
                    )
                    plan_category_serializer = PlanCategorySerializer(
                        plan_category, data=plan_category_element
                    )
                    if (
                        plan_category.plan_id == plan_id
                        and plan_category_serializer.is_valid()
                    ):
                        plan_categories.append(plan_category_serializer)
                    else:
                        return Response(
                            plan_category_serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                for plan_category in plan_categories:
                    plan_category.save()
                plan_serializer.save()
                return Response(
                    plan_serializer.data, status=status.HTTP_200_OK
                )
            else:
                return Response(
                    plan_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)


class PlanItemGroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CRUD of Plan Item model.
    Only authenticated participants who are owners of the plan which the plan item belongs to can access.
    """

    permission_classes = (IsAuthenticated,)
    serializer_class = PlanItemGroupSerializer
    queryset = PlanItemGroup.objects.all()

    def is_plan_category_owner(self, request, plan_category):
        plan = get_object_or_404(Plan.objects.all(), pk=plan_category.plan_id)
        return plan.participant_id == request.user.id

    def is_plan_item_group_owner(self, request, plan_item_group):
        plan_category = get_object_or_404(
            PlanCategory.objects.all(), pk=plan_item_group.plan_category_id
        )
        return self.is_plan_category_owner(request, plan_category)

    def list(self, request, plan_id, plan_category_id):
        plan_category = get_object_or_404(
            PlanCategory.objects.all(), pk=plan_category_id
        )
        if self.is_plan_category_owner(request, plan_category):
            queryset = self.queryset.filter(plan_category_id=plan_category.id)
            serializer = self.serializer_class(queryset, many=True)
            return Response(serializer.data)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

    def create(self, request, plan_category_id):
        # check if plan category and corresponding plan exists
        plan_category = get_object_or_404(
            PlanCategory.objects.all(), pk=plan_category_id
        )
        if self.is_plan_category_owner(request, plan_category):
            # create plan item group
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid():
                support_item_group = get_object_or_404(
                    SupportItemGroup.objects.all(),
                    pk=request.data["support_item_group"],
                )
                serializer.save(
                    plan_category=plan_category,
                    support_item_group=support_item_group,
                    name=request.data["name"],
                )
                return Response(
                    serializer.data, status=status.HTTP_201_CREATED
                )
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

    def update(self, request, plan_item_group_id):
        plan_item_group = get_object_or_404(
            self.queryset, pk=plan_item_group_id
        )
        if self.is_plan_item_owner(request, plan_item_group):

            serializer = self.serializer_class(
                plan_item_group, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status.HTTP_200_OK)
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

    def destroy(self, request, plan_item_group_id):
        plan_item_group = get_object_or_404(
            self.queryset, pk=plan_item_group_id
        )
        if self.is_plan_item_owner(request, plan_item_group):
            plan_item_group.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)


class PlanItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CRUD of Plan Item model.
    Only authenticated participants who are owners of the plan which the plan item belongs to can access.
    """

    permission_classes = (IsAuthenticated,)
    serializer_class = PlanItemSerializer
    queryset = PlanItem.objects.all()

    def is_plan_category_owner(self, request, plan_category):
        plan = get_object_or_404(Plan.objects.all(), pk=plan_category.plan_id)
        return plan.participant_id == request.user.id

    def is_plan_item_group_owner(self, request, plan_item_group):
        plan_category = get_object_or_404(
            PlanCategory.objects.all(), pk=plan_item_group.plan_category_id
        )
        return self.is_plan_category_owner(request, plan_category)

    def is_plan_item_owner(self, request, plan_item):
        plan_item_group = get_object_or_404(
            PlanItemGroup.objects.all(), pk=plan_item.plan_item_group_id
        )
        return self.is_plan_item_group_owner(request, plan_item_group)

    def list(self, request, plan_id, plan_category_id, plan_item_group_id):
        plan_item_group = get_object_or_404(
            PlanItemGroup.objects.all(), pk=plan_item_group_id
        )
        if self.is_plan_item_group_owner(request, plan_item_group):
            queryset = self.queryset.filter(
                plan_item_group_id=plan_item_group.id
            )
            serializer = self.serializer_class(queryset, many=True)
            return Response(serializer.data)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

    def create(self, request, plan_item_group_id):
        # check if plan item group, plan category, and corresponding plan exists
        plan_item_group = get_object_or_404(
            PlanItemGroup.objects.all(), pk=plan_item_group_id
        )
        if self.is_plan_item_group_owner(request, plan_item_group):
            # create plan item
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    plan_item_group=plan_item_group,
                    name=request.data["name"],
                    price_actual=request.data["price_actual"],
                    start_date=request.data["start_date"],
                    end_date=request.data["end_date"],
                    all_day=request.data["all_day"],
                )
                return Response(
                    serializer.data, status=status.HTTP_201_CREATED
                )
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

    def update(self, request, plan_item_id):
        plan_item = get_object_or_404(self.queryset, pk=plan_item_id)
        if self.is_plan_item_owner(request, plan_item):
            serializer = self.serializer_class(
                plan_item, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status.HTTP_200_OK)
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

    def destroy(self, request, plan_item_id):
        plan_item = get_object_or_404(self.queryset, pk=plan_item_id)
        if self.is_plan_item_owner(request, plan_item):
            plan_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)


class SupportGroupViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List all support groups and their support categories
    """

    queryset = SupportGroup.objects.all()
    serializer_class = SupportGroupSerializer


class SupportCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List all support caegories
    """

    queryset = SupportCategory.objects.all()
    serializer_class = SupportCategorySerializer


class SupportItemGroupViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List support item groups by query params.
    """

    serializer_class = SupportItemGroupSerializer

    def list(self, request, **kwargs):
        queryset = SupportItemGroup.objects.all()

        registration_group_id = request.query_params.get(
            "registration-group-id"
        )
        support_category_id = request.query_params.get("support-category-id")

        # support item queryset - list of support items
        si_queryset = SupportItem.objects.all().filter(
            support_category_id=support_category_id
        )
        if registration_group_id is not None:
            si_queryset = si_queryset.filter(
                registration_group_id=registration_group_id
            )

        # values list - list of all ids in si_queryset [id1,id2] etc.
        queryset = queryset.filter(
            base_item_id__in=si_queryset.values_list("id", flat=True)
        )

        serializer = self.serializer_class(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class SupportItemViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List support items filtered by query parameters
    """

    ACT_NSW_QLD_VIC = [
        (200, 299),
        (1000, 2999),
        (4000, 4999),
        (9000, 9999),
        (3000, 3999),
        (8000, 8999),
    ]

    serializer_class = SupportItemSerializer

    # override default list function
    def list(self, request, **kwargs):
        queryset = SupportItem.objects.all()
        # birth_year = request.query_params.get('birth-year')
        postcode = request.query_params.get("postcode")
        registration_group_id = request.query_params.get(
            "registration-group-id", None
        )
        support_category_id = request.query_params.get("support-category-id")

        if registration_group_id is not None:
            queryset = queryset.filter(
                registration_group_id=registration_group_id
            )

        queryset = queryset.filter(support_category_id=support_category_id)

        serializer = self.serializer_class(queryset, many=True)

        for support_item in serializer.data:
            # check if postcode is in ACT_NSW_QLD_VIC
            if support_item["price_ACT_NSW_QLD_VIC"] is not None:
                for postcode_range in self.ACT_NSW_QLD_VIC:
                    if postcode_range[0] <= int(postcode) <= postcode_range[1]:
                        support_item["price"] = support_item[
                            "price_ACT_NSW_QLD_VIC"
                        ]
                        break
            elif support_item["price_NT_SA_TAS_WA"] is not None:
                support_item["price"] = support_item["price_NT_SA_TAS_WA"]
            else:
                support_item["price"] = support_item["price_national"]

            # strip unneeded keys
            support_item.pop("price_NT_SA_TAS_WA", None)
            support_item.pop("price_ACT_NSW_QLD_VIC", None)
            support_item.pop("price_national", None)
            support_item.pop("price_remote", None)
            support_item.pop("price_very_remote", None)

        return Response(serializer.data, status=status.HTTP_200_OK)


class RegistrationGroupViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List all Registration groups
    """

    queryset = RegistrationGroup.objects.all()
    serializer_class = RegistrationGroupSerializer
