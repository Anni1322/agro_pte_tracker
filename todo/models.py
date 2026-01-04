# from django.db import models
# from django.utils import timezone

# class Todo(models.Model):
#     FREQUENCY_CHOICES = [
#         ('daily', 'Daily'),
#         ('weekly', 'Weekly'),
#         ('monthly', 'Monthly'),
#         ('yearly', 'Yearly'),
#     ]

#     title = models.CharField(max_length=200)
#     description = models.TextField(blank=True, null=True)
#     frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='daily')
#     is_completed = models.BooleanField(default=False)
#     last_completed = models.DateTimeField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.title} ({self.frequency})"




# for admin
from django.db import models
from django.contrib.auth.models import User # Built-in User system

class Todo(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='daily')
    
    # NEW FIELDS
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="Todo", null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_tasks')
    
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} -> {self.assigned_to.username}"