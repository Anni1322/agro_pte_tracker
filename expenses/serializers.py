from rest_framework import serializers
from .models import Expense

from .models import TransactionImage

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

class TransactionImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionImage
        fields = '__all__'