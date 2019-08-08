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
from budgeting import views

support_group_list = views.SupportGroupViewSet.as_view({
    'get': 'list'
})

api_patterns = [
    # JWT
    path('auth/login', jwt_views.TokenObtainPairView.as_view(), name='auth_login'),
    path('auth/refresh', jwt_views.TokenRefreshView.as_view(), name='auth_refresh'),
    path('auth/register', views.Authentication.register, name='auth_register'),

    path('support-groups', support_group_list, name='support-group-list'),

    path('participant/id', views.Participant.id, name='participant_id'),
    path('participant/<int:pk>', views.Participant.update, name='participant_update'),
    path('support-items', views.SupportItemOperation.getList, name='support_items_list'),
]

urlpatterns = [
    # Django admin
    path('admin', admin.site.urls),

    # API
    path('api/v1/', include(api_patterns)),

    # App
    path('', views.DefaultView.as_view(), name='landing'),
    path('hello', views.HelloView.as_view(), name='hello'),
    # url(r'^api-auth/', include('rest_framework.urls'))
]
