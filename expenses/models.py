from django.db import models
from projects.models import Project
from employees.models import Employee
from django.contrib.auth.models import User

class Expense(models.Model):
    title = models.CharField(max_length=100)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='expenses', null=True, blank=True)
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.amount}"
    
    
    

class Expense_day_wise(models.Model):
    CATEGORY_CHOICES = [
        ('rent', 'Rent'),
        ('food', 'Food'),
        ('helth', 'helth gedget'),
        ('helthfood', 'helth food'),
        ('transport', 'Transport'),
        ('shopping', 'Shopping'),
        ('entertainment', 'Entertainment'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="expenses", null=True, blank=True)
    date = models.DateField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.date} - {self.category} - {self.amount}"
    
    
    
    
# add img pay ss
class TransactionImage(models.Model):
    image = models.ImageField(upload_to='transactions/')
    extracted_text = models.TextField(blank=True)
    upload_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transaction uploaded on {self.upload_time}"    
