from django.urls import path
from .views import *

urlpatterns = [
    path('', dashboard, name='dashboard'),
    path('expense/', expense_view, name='expense'),
    path('task/', task_view, name='task'),
    path('project/', project_view, name='project'),
    path('employee/', employee_view, name='employee'),
    path('study/', study_view, name='study'),
]
