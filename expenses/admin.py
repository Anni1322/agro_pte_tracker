from django.contrib import admin
from .models import *

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'employee', 'amount', 'date')
    list_filter = ('project', 'employee', 'date')
    
@admin.register(Expense_day_wise)
class ExpenseDayWiseAdmin(admin.ModelAdmin):
    list_display = ('date', 'category', 'amount', 'description')  # Updated fields
    list_filter = ('date', 'category')  # Relevant filters

