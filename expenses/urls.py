from django.urls import path
from .views import *
from django.conf import settings
from django.conf.urls.static import static
from . import views


urlpatterns = [
    # path('', expense_list, name='expense-list'),
    # path('', expense_view, name='expense_view'),
    path('expence/', expense_view, name='form_view'),
    path('chart_view/', chart_view, name='chart_view'),
    path('addexpence_view/', addexpence_view, name='addexpence_view'),
    path('', dashboard_view, name='dashboard_view'),
    path('dashboard_view/', dashboard_view, name='dashboard_view'),
    # path('form/', form_view, name='form_view'),
    # path('form/', form_view, name='form_view'),
    
    
    # add
    path('addexpenses/', ExpenseListCreateAPIView.as_view(), name='expense-list-create'),
    path('addexpence/', addexpence, name='addexpence'),

    path('expenses/', views.expense_list_create, name='expense_list_create'),
    path('getexpenses/', get_expenses, name='getexpenses'),
    path('filter/', filter_view, name='filter_view'),
    
    # crud expence
    path('tracker/', views.expense_page, name='expense_page'),
    path('expenses/', views.expense_list_create, name='expense_list_create'),
    path('expenses/<int:pk>/', views.expense_detail, name='expense_detail'),
    
    # img pay ss
    path('upload-form/', UploadFormView.as_view(), name='upload-form'),
    path('upload-transaction/', TransactionOCRView.as_view(), name='upload-transaction'),
    path('api/ai-assistant/', views.ai_assistant_api, name='ai_assistant_api'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
