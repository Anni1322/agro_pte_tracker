from rest_framework import serializers
from .models import Expense

from .models import TransactionImage, Expense_day_wise

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

class ExpenseDayWiseSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    category = serializers.CharField(max_length=50)
    class Meta:
        model = Expense_day_wise
        fields = '__all__'

class TransactionImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionImage
        fields = '__all__'