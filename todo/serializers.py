from rest_framework import serializers
from .models import Todo
from django.contrib.auth.models import User

class TodoSerializer(serializers.ModelSerializer):
    created_by_username = serializers.ReadOnlyField(source='created_by.username')
    assigned_to_username = serializers.ReadOnlyField(source='assigned_to.username')

    class Meta:
        model = Todo
        fields = [
            'id', 'title', 'description', 'category', 'created_by', 
            'created_by_username', 'assigned_to', 'assigned_to_username',
            'status', 'priority', 'is_completed', 'frequency', 
            'due_date', 'remind_at', 'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'completed_at']
