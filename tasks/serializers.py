from rest_framework import serializers
from .models import Task
from employees.serializers import EmployeeSerializer
from projects.serializers import ProjectSerializer

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_detail = EmployeeSerializer(source='assigned_to', read_only=True)
    project_detail = ProjectSerializer(source='project', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'assigned_to', 'assigned_to_detail',
            'project', 'project_detail', 'status', 'deadline'
        ]
