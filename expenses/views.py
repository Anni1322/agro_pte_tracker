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

import json
from django.shortcuts import get_object_or_404



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



def expense_page(request):
    return render(request, 'expenses/simplepage/expenseLists.html')


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




@csrf_exempt
@login_required
def expense_list_create(request):
    # READ (List all expenses for the logged-in user)
    if request.method == "GET":
        expenses = Expense_day_wise.objects.filter(user=request.user).values()
        return JsonResponse(list(expenses), safe=False)

    # CREATE
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            expense = Expense_day_wise.objects.create(
                user=request.user,
                date=data.get("date"),
                category=data.get("category"),
                amount=data.get("amount"),
                description=data.get("description", "")
            )
            return JsonResponse({"id": expense.id, "message": "Created successfully"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
@login_required
# def expense_detail(request, pk):
#     expense = get_object_or_404(Expense_day_wise, pk=pk, user=request.user)

#     # UPDATE
#     if request.method == "PUT":
#         try:
#             data = json.loads(request.body)
#             expense.date = data.get("date", expense.date)
#             expense.category = data.get("category", expense.category)
#             expense.amount = data.get("amount", expense.amount)
#             expense.description = data.get("description", expense.description)
#             expense.save()
#             return JsonResponse({"message": "Updated successfully"})
#         except Exception as e:
#             return JsonResponse({"error": str(e)}, status=400)

#     # DELETE
#     if request.method == "DELETE":
#         expense.delete()
#         return JsonResponse({"message": "Deleted successfully"}, status=204)

#     return JsonResponse({"error": "Method not allowed"}, status=405)



# from django.shortcuts import render
# from django.http import JsonResponse
# from .models import Expense
# import json

 
def add_expense(request):
    if request.method == "POST":
        data = json.loads(request.body)
        expense = Expense.objects.create(
            date=data['date'],
            category=data['category'],
            amount=data['amount'],
            description=data.get('description', ''),
            # user=request.user # If using auth
        )
        return JsonResponse({"success": True, "id": expense.id})

# def expense_detail(request, pk):
#     try:
#         expense = Expense.objects.get(pk=pk)
#         if request.method == "PUT":
#             data = json.loads(request.body)
#             expense.date = data['date']
#             expense.category = data['category']
#             expense.amount = data['amount']
#             expense.description = data.get('description', '')
#             expense.save()
#             return JsonResponse({"success": True})
            
#         elif request.method == "DELETE":
#             expense.delete()
#             return JsonResponse({"success": True})
#     except Expense.DoesNotExist:
#         return JsonResponse({"success": False, "error": "Not found"}, status=404)
    
def expense_detail(request, pk):
    try:
        # Security: Ensure users can only edit/delete THEIR own expenses
        expense = Expense_day_wise.objects.get(pk=pk, user=request.user)
        
        if request.method == "PUT":
            data = json.loads(request.body)
            expense.date = data['date']
            expense.category = data['category']
            expense.amount = data['amount']
            expense.description = data.get('description', '')
            expense.save()
            return JsonResponse({"success": True})
            
        elif request.method == "DELETE":
            expense.delete()
            return JsonResponse({"success": True})
            
    except Expense_day_wise.DoesNotExist:
        return JsonResponse({"success": False, "error": "Expense not found or unauthorized"}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)
        

# @login_required
# def get_expenses(request):
#     # expenses = Expense_day_wise.objects.all()
#     if request.user.is_staff:
#         expenses = Expense_day_wise.objects.all().order_by('-created_at')
#     else:
#         expenses = expenses = Expense_day_wise.objects.filter(user=request.user).values()   
#     # expenses = Expense_day_wise.objects.filter(user=request.user).values()

#     date = request.GET.get("date")
#     month = request.GET.get("month")
#     year = request.GET.get("year")
#     category = request.GET.get("category")

#     if date:
#         expenses = expenses.filter(date=date)
#     if month:
#         expenses = expenses.filter(date__startswith=month)
#     if year:
#         expenses = expenses.filter(date__startswith=year)
#     if category:
#         expenses = expenses.filter(category__iexact=category)

#     return JsonResponse({"expenses": list(expenses.values())}, status=200)

@login_required
def get_expenses(request):
    # 1. Initialize QuerySet (Remove values() from here)
    if request.user.is_staff:
        # Use 'date' or '-id' since 'created_at' doesn't exist in your model
        expenses = Expense_day_wise.objects.all().order_by('-date')
    else:
        expenses = Expense_day_wise.objects.filter(user=request.user).order_by('-date')

    # 2. Get query parameters
    date = request.GET.get("date")
    month = request.GET.get("month")
    year = request.GET.get("year")
    category = request.GET.get("category")

    # 3. Apply filters correctly for DateField
    if date:
        expenses = expenses.filter(date=date)
    if month:
        # Better than startswith for DateFields
        expenses = expenses.filter(date__month=month)
    if year:
        expenses = expenses.filter(date__year=year)
    if category:
        expenses = expenses.filter(category__iexact=category)

    # 4. Convert to list and return
    # We call .values() here at the very end
    data = list(expenses.values('id', 'date', 'category', 'amount', 'description','user__username'))
    return JsonResponse({"expenses": data}, status=200)

# @login_required
# def get_expenses(request):
#     # Filter by user first
#     expenses = Expense_day_wise.objects.filter(user=request.user)

#     # Get query parameters
#     date = request.GET.get("date")
#     month = request.GET.get("month") # Expected format: 1-12
#     year = request.GET.get("year")   # Expected format: 2024
#     category = request.GET.get("category")

#     # Apply filters
#     if date:
#         expenses = expenses.filter(date=date)
#     if month:
#         expenses = expenses.filter(date__month=month)
#     if year:
#         expenses = expenses.filter(date__year=year)
#     if category:
#         expenses = expenses.filter(category__iexact=category)

#     # Convert to list of dictionaries
#     data = list(expenses.values('id', 'date', 'category', 'amount', 'description'))
    
#     return JsonResponse({"expenses": data}, status=200)

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


from employees.models import Employee
from projects.models import Project
from tasks.models import Task
from django.db.models import Sum

@csrf_exempt
@login_required
def ai_assistant_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            prompt = data.get("prompt", "").lower().strip()
            
            # Query databases
            emp_count = Employee.objects.count()
            proj_count = Project.objects.count()
            task_count = Task.objects.count()
            
            expense_agg = Expense_day_wise.objects.filter(user=request.user).aggregate(Sum('amount'))
            total_expense = expense_agg['amount__sum'] or 0
            
            response_text = ""
            
            # Simple NLP Router
            if "today" in prompt or "aaj" in prompt or "daily" in prompt:
                from todo.models import Todo
                today_date = timezone.now().date()
                
                # Fetch today's tasks
                today_tasks = Task.objects.filter(deadline=today_date)
                # Fetch today's todo items
                today_todos = Todo.objects.filter(due_date__date=today_date)
                
                task_items = "".join([f"<li>[Task] <strong>{t.title}</strong> ({t.status})</li>" for t in today_tasks])
                todo_items = "".join([f"<li>[To-Do] <strong>{td.title}</strong> ({td.status})</li>" for td in today_todos])
                
                combined_list = task_items + todo_items
                if combined_list:
                    response_text = f"Here are your tasks for today:<br><ul class='mb-0'>{combined_list}</ul>"
                else:
                    response_text = "You have no tasks scheduled for today."
                    
            elif "employee" in prompt or "staff" in prompt or "people" in prompt:
                employees = Employee.objects.all()
                emp_list = "<ul class='mb-0'>" + "".join([f"<li><strong>{e.name}</strong> - {e.designation} ({e.phone})</li>" for e in employees]) + "</ul>"
                response_text = f"We currently have <strong>{emp_count}</strong> registered employee(s):<br>{emp_list if emp_count > 0 else 'No employees registered yet.'}"
                
            elif "project" in prompt or "manager" in prompt:
                projects = Project.objects.all()
                proj_list = "<ul class='mb-0'>" + "".join([f"<li><strong>{p.name}</strong> (Managed by {p.manager.name}, Ends: {p.end_date})</li>" for p in projects]) + "</ul>"
                response_text = f"We have <strong>{proj_count}</strong> active project(s):<br>{proj_list if proj_count > 0 else 'No active projects found.'}"
                
            elif "task" in prompt or "todo" in prompt or "pending" in prompt or "kanban" in prompt:
                tasks = Task.objects.all()
                pending = tasks.filter(status='Pending').count()
                progress = tasks.filter(status='In Progress').count()
                completed = tasks.filter(status='Completed').count()
                
                response_text = (
                    f"Task statistics:<br>"
                    f"- <strong>{pending}</strong> Pending tasks<br>"
                    f"- <strong>{progress}</strong> In Progress tasks<br>"
                    f"- <strong>{completed}</strong> Completed tasks<br>"
                    f"Total: <strong>{task_count}</strong> task(s)."
                )
                
            elif "expense" in prompt or "spend" in prompt or "cost" in prompt or "finance" in prompt or "money" in prompt or "rupee" in prompt:
                expenses = Expense_day_wise.objects.filter(user=request.user)
                cat_spend = {}
                for e in expenses:
                    cat_spend[e.category] = cat_spend.get(e.category, 0) + float(e.amount)
                
                cat_list = "".join([f"<li>{cat}: <strong>₹{amt:,.2f}</strong></li>" for cat, amt in cat_spend.items()])
                response_text = (
                    f"Your total logged financial expense is <strong>₹{total_expense:,.2f}</strong>.<br>"
                    f"Breakdown by category:<br><ul class='mb-0'>{cat_list}</ul>"
                )
            
            else:
                # General summary default response
                response_text = (
                    f"Hi! I am your AI project assistant. Here is a high-level summary of your project status:<br><br>"
                    f"💼 <strong>Employees:</strong> {emp_count} registered staff members.<br>"
                    f"🏗️ <strong>Projects:</strong> {proj_count} active projects.<br>"
                    f"📋 <strong>Tasks:</strong> {task_count} total project tasks.<br>"
                    f"💰 <strong>Finance:</strong> ₹{total_expense:,.2f} total logged expenses.<br><br>"
                    f"Feel free to ask me specifics, like: <em>'how much did I spend?'</em>, <em>'show me our employees'</em>, or <em>'what is the status of our tasks?'</em>!"
                )
                
            return JsonResponse({"response": response_text}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)

