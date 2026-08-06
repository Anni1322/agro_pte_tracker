"""agro_pte_tracker URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
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
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework.routers import DefaultRouter
from employees.views import EmployeeViewSet
from projects.views import ProjectViewSet
from tasks.views import TaskViewSet
from todo.views import TodoViewSet
from expenses.views import ExpenseViewSet, ExpenseDayWiseViewSet, ai_assistant_api

from accounts import views as accounts_views

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'todos', TodoViewSet, basename='todo')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'day-wise-expenses', ExpenseDayWiseViewSet, basename='day-wise-expense')

urlpatterns = [
    
    path('admin/', admin.site.urls),
    
    # AI Assistant API Endpoint
    path('api/ai-assistant/', ai_assistant_api, name='api_ai_assistant'),
    
    path('api/', include(router.urls)),
    
    # REST API Auth paths
    path('api/auth/login/', accounts_views.login_api, name='api_login'),
    path('api/auth/logout/', accounts_views.logout_api, name='api_logout'),
    path('api/auth/session/', accounts_views.session_api, name='api_session'),
    path('api/auth/signup/', accounts_views.signup_api, name='api_signup'),
    
    # path('', include('home.urls')),
    
    path('', include('expenses.urls')),
    path('expenses/', include('expenses.urls')),
    path('employee/', include('employees.urls')),
    path('accounts/', include('accounts.urls')),
    path('tasks/', include('tasks.urls')),
    path('project/', include('projects.urls')),
    path('todo/', include('todo.urls')),
   
    # path('study/', include('study.urls')),

]

