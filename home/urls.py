from django.urls import path
from .views import *

urlpatterns = [
    path('', home, name='home'),
    # path('expense_home/', expense_view, name='expense'),
    # path('task_home/', task_view, name='task'),
    # path('project_home/', project_view, name='project'),
    # path('employee_home/', employee_view, name='employee'),
    # path('stud_homey/', study_view, name='study'),
]
