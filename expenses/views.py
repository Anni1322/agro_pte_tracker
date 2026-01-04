from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from PIL import Image
import pytesseract
import re
import json
from datetime import datetime
from django.utils import timezone

from .models import (
    Expense,
    TransactionImage,
    Expense_day_wise
)
from .forms import ExpenseForm
from .serializers import (
    ExpenseSerializer,
    TransactionImageSerializer
)

# =========================
# DASHBOARD & PAGES (PROTECTED)
# =========================

@login_required
def dashboard_view(request):
    return render(request, 'expenses/simplepage/dashboard.html')


@login_required
def expense_view(request):
    return render(request, 'expenses/index.html')


@login_required
def form_view(request):
    return render(request, 'expenses/form.html')


@login_required
def chart_view(request):
    return render(request, 'expenses/simplepage/chart.html')


@login_required
def addexpence_view(request):
    return render(request, 'expenses/simplepage/addexpence.html')


@login_required
def filter_view(request):
    return render(request, 'expenses/simplepage/filter.html')


# =========================
# CLASS BASED VIEW (PROTECTED)
# =========================

@method_decorator(login_required, name='dispatch')
class UploadFormView(View):
    def get(self, request):
        return render(request, 'expenses/test_upload.html')


# =========================
# OCR + TRANSACTION LOGIC
# =========================

def parse_transaction_text(text):
    result = {}

    received_pattern = (
        r"Received from\s*(.+?)\s*[€$₹]?(\d+).*?"
        r"(\d{1,2}\s+\w+\s+\d{4})\s*(Credited|Debited)"
    )
    received_match = re.search(received_pattern, text, re.DOTALL | re.IGNORECASE)
    if received_match:
        result['received'] = {
            'name': received_match.group(1).strip().replace('\n', ' '),
            'amount': received_match.group(2),
            'date': received_match.group(3),
            'type': received_match.group(4).capitalize(),
        }

    paid_pattern = (
        r"Paid to\s*(.+?)\s*[%®]?(\d+).*?"
        r"(\d{1,2}\s+\w+\s+\d{4})\s*(Credited|Debited)"
    )
    paid_match = re.search(paid_pattern, text, re.DOTALL | re.IGNORECASE)
    if paid_match:
        result['paid'] = {
            'name': paid_match.group(1).strip().replace('\n', ' '),
            'amount': paid_match.group(2),
            'date': paid_match.group(3),
            'type': paid_match.group(4).capitalize(),
        }

    return result


@method_decorator(login_required, name='dispatch')
class TransactionOCRView(View):
    def get(self, request):
        return render(request, 'expenses/test_upload.html')

    def post(self, request):
        image_file = request.FILES['image']
        transaction = TransactionImage.objects.create(image=image_file)

        image = Image.open(transaction.image.path)
        extracted_text = pytesseract.image_to_string(image)

        ocr_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        confidences = [int(conf) for conf in ocr_data['conf'] if conf != '-1']
        average_confidence = round(sum(confidences) / len(confidences), 2) if confidences else 0.0

        transaction.extracted_text = extracted_text
        transaction.upload_time = timezone.now()
        transaction.save()

        parsed_data = parse_transaction_text(extracted_text)

        return render(request, 'expenses/test_upload.html', {
            'transaction': transaction,
            'confidence': average_confidence,
            'parsed': parsed_data,
        })


# =========================
# API VIEWS
# =========================

class ExpenseListCreateAPIView(generics.ListCreateAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer


# @csrf_exempt
# @login_required
# def addexpence(request):
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)

#             Expense_day_wise.objects.create(
#                 date=data.get("date"),
#                 category=data.get("category"),
#                 amount=data.get("amount"),
#                 description=data.get("description", "")
#             )

#             return JsonResponse({"success": "Expense added successfully"}, status=201)

#         except json.JSONDecodeError:
#             return JsonResponse({"error": "Invalid JSON"}, status=400)

#     return JsonResponse({"error": "Invalid request"}, status=405)

@csrf_exempt
@login_required
def addexpence(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            # Assign the logged-in user here
            Expense_day_wise.objects.create(
                user=request.user,  
                date=data.get("date"),
                category=data.get("category"),
                amount=data.get("amount"),
                description=data.get("description", "")
            )
            return JsonResponse({"success": "Expense added successfully"}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=405)



@login_required
def get_expenses(request):
    # expenses = Expense_day_wise.objects.all()
    expenses = Expense_day_wise.objects.filter(user=request.user).values()

    date = request.GET.get("date")
    month = request.GET.get("month")
    year = request.GET.get("year")
    category = request.GET.get("category")

    if date:
        expenses = expenses.filter(date=date)
    if month:
        expenses = expenses.filter(date__startswith=month)
    if year:
        expenses = expenses.filter(date__startswith=year)
    if category:
        expenses = expenses.filter(category__iexact=category)

    return JsonResponse({"expenses": list(expenses.values())}, status=200)


# =========================
# FORM BASED EXPENSE ADD
# =========================

@login_required
def add_expense(request):
    if request.method == 'POST':
        form = ExpenseForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('expense-list')
    else:
        form = ExpenseForm()

    return render(request, 'expenses/add_expense.html', {'form': form})
