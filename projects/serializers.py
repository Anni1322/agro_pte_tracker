from rest_framework import serializers
from .models import Project
from employees.serializers import EmployeeSerializer

class ProjectSerializer(serializers.ModelSerializer):
    manager_detail = EmployeeSerializer(source='manager', read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'start_date', 'end_date', 'manager', 'manager_detail'
        ]
