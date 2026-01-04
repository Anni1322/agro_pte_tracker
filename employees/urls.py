from django.urls import path
from .views import *

urlpatterns = [
    # path('', expense_list, name='expense-list'),
    path('', employees_view, name='employees_view'),
]
