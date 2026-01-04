from django.db import models
from employees.models import Employee

class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    manager = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='managed_projects')

    def __str__(self):
        return self.name
