# from django.urls import path
# from . import views

# urlpatterns = [
#     path('', views.TodoListView.as_view(), name='todo_list'),
#     path('dashboard/', views.track_dashboard, name='todo_dashboard'),
#     path('add/', views.TodoCreateView.as_view(), name='todo_add'),
#     path('edit/<int:pk>/', views.TodoUpdateView.as_view(), name='todo_edit'),
#     path('delete/<int:pk>/', views.TodoDeleteView.as_view(), name='todo_delete'),
# ]


from django.urls import path
from . import views

urlpatterns = [
    path('', views.todo_list, name='todo_list'),
    path('dashboard/', views.track_dashboard, name='todo_dashboard'),
    path('add/', views.todo_create, name='todo_add'),
    path('edit/<int:pk>/', views.todo_update, name='todo_edit'),
    path('delete/<int:pk>/', views.todo_delete, name='todo_delete'),
]