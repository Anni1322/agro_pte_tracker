from django.urls import path
from . import views

urlpatterns = [
    path('', views.project_list, name='project_list'),
    path('add/', views.project_create, name='project_create'),
    path('edit/<int:pk>/', views.project_update, name='project_update'),
    path('delete/<int:pk>/', views.project_delete, name='project_delete'),
]
