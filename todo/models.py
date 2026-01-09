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
# from django.db import models
# from django.contrib.auth.models import User # Built-in User system

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
    
#     # NEW FIELDS
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="Todo", null=True, blank=True)
#     assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
#     created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_tasks')
    
#     is_completed = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.title} -> {self.assigned_to.username}"
    
    
  
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Todo(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    FREQUENCY_CHOICES = [
        ('none', 'One-time'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    ]

    # Core Information
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., Work, Personal, Health")
    
    # Ownership and Assignment
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_tasks')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks', null=True, blank=True)
    
    # Progress and Priority
    status = models.CharField(max_length=20, choices=STATUS_CHOICES,null=True, blank=True, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    is_completed = models.BooleanField(default=False)
    
    # Scheduling
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='none')
    due_date = models.DateTimeField(null=True, blank=True)
    remind_at = models.DateTimeField(null=True, blank=True, help_text="Send a notification at this time")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-priority', 'due_date'] # Shows urgent tasks first

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

    def save(self, *args, **kwargs):
        # Automatically set completed_at when is_completed is checked
        if self.is_completed and not self.completed_at:
            self.completed_at = timezone.now()
        elif not self.is_completed:
            self.completed_at = None
        super().save(*args, **kwargs)  
    
    
    
    
    