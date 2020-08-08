"""ndis_calculator URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt import views as jwt_views

from budgeting.views import (  # SupportCategoryViewSet,
    Authentication,
    DefaultView,
    ParticipantView,
    PlanItemGroupViewSet,
    PlanItemViewSet,
    PlanViewSet,
    RegistrationGroupViewSet,
    SupportGroupViewSet,
    SupportItemGroupViewSet,
    SupportItemViewSet,
)

api_patterns = [
    # Authentication
    path(
        "auth/login",
        jwt_views.TokenObtainPairView.as_view(),
        name="auth_login",
    ),
    path(
        "auth/refresh",
        jwt_views.TokenRefreshView.as_view(),
        name="auth_refresh",
    ),
    path("auth/register", Authentication.register, name="auth_register"),
    path(
        "participant/current-user",
        ParticipantView.current_user,
        name="participant_current_user",
    ),
    # Participant
    path(
        "participant/<int:participant_id>",
        ParticipantView.update,
        name="participant_update",
    ),
    # Plan
    path(
        "plans",
        PlanViewSet.as_view({"get": "list", "post": "create"}),
        name="plan_list",
    ),
    path(
        "plans/<int:plan_id>",
        PlanViewSet.as_view({"patch": "update"}),
        name="plan_update",
    ),
    path(
        "plans/<int:plan_id>/categories/<int:plan_category_id>/groups",
        PlanItemGroupViewSet.as_view({"get": "list", "post": "create"}),
        name="plan_item_group_list",
    ),
    path(
        "plans/<int:plan_id>/categories/<int:plan_category_id>/groups/<int:plan_item_group_id>",
        PlanItemGroupViewSet.as_view({"patch": "update", "delete": "destroy"}),
        name="plan_item_group_update",
    ),
    path(
        "plans/<int:plan_id>/categories/<int:plan_category_id>/groups/<int:plan_item_group_id>/items",
        PlanItemViewSet.as_view({"get": "list", "post": "create"}),
        name="plan_item_list",
    ),
    path(
        "plans/<int:plan_id>/categories/<int:plan_category_id>/groups/<int:plan_item_group_id>/items/<int:plan_item_id>",
        PlanItemViewSet.as_view({"patch": "update", "delete": "destroy"}),
        name="plan_item_update",
    ),
    # Support
    path(
        "support-groups",
        SupportGroupViewSet.as_view({"get": "list"}),
        name="support_group_list",
    ),
    # support_category missing?
    path(
        "support-item-groups",
        SupportItemGroupViewSet.as_view({"get": "list"}),
        name="support_item_group_list",
    ),
    path(
        "support-items",
        SupportItemViewSet.as_view({"get": "list"}),
        name="support_items_list",
    ),
    path(
        "registration-groups",
        RegistrationGroupViewSet.as_view({"get": "list"}),
        name="registration_group_list",
    ),
]

urlpatterns = [
    # Django admin
    path("admin", admin.site.urls),
    # API
    path("api/v1/", include(api_patterns)),
    # Health Check
    path("healthCheck", DefaultView.as_view(), name="healthCheck"),
    # App
    path("", DefaultView.as_view(), name="landing"),
    # url(r'^api-auth/', include('rest_framework.urls'))
]
