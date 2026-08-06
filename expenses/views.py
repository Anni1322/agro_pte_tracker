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
    TransactionImageSerializer,
    ExpenseDayWiseSerializer
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
def ai_assistant_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"response": "Session expired or unauthenticated. Please log in to access your project AI assistant."}, status=401)

    if request.method == 'POST':
        try:
            import re
            import datetime
            data = json.loads(request.body)
            prompt = data.get("prompt", "").strip()
            prompt_lower = prompt.lower()
            
            # 1. VOICE CREATION COMMAND ROUTER (Supports English & Hindi Devanagari)
            # E.g. "task is :- goto marking" or "टास्क इस सेटअप ड्रिप पाइप"
            task_match = re.search(r'(?:task\s*is|टास्क\s*इस|टास्क)\s*(?:[:-]+)?\s*(.+)', prompt, re.IGNORECASE)
            if task_match and not ("what" in prompt_lower or "list" in prompt_lower or "show" in prompt_lower or "बताओ" in prompt or "दिखाओ" in prompt):
                task_title = task_match.group(1).strip()
                first_emp = Employee.objects.first()
                first_proj = Project.objects.first()
                if not first_emp or not first_proj:
                    return JsonResponse({"response": "I cannot create tasks. Please register at least one project and employee first."}, status=200)
                
                new_task = Task.objects.create(
                    title=task_title.capitalize(),
                    description="Created via AI voice command.",
                    assigned_to=first_emp,
                    project=first_proj,
                    status="Pending",
                    deadline=timezone.now().date() + datetime.timedelta(days=1)
                )
                return JsonResponse({
                    "response": f"I have successfully created and saved task: <strong>'{new_task.title}'</strong>. Assigned to: {first_emp.name} (Project: {first_proj.name})."
                }, status=200)
            
            # E.g. "expense is :- food 200" or "एक्सपेंस 200" or "खर्चा"
            exp_match = re.search(r'(?:expense\s*is|एक्सपेंस\s*इस|एक्सपेंस|खर्चा)\s*(?:[:-]+)?\s*([a-zA-Z\u0900-\u097F\s]+)?\s*(\d+(?:\.\d+)?)', prompt, re.IGNORECASE)
            if exp_match and not ("total" in prompt_lower or "what" in prompt_lower or "list" in prompt_lower or "show" in prompt_lower or "कितना" in prompt):
                category_word = (exp_match.group(1) or 'other').strip().lower()
                amount_val = float(exp_match.group(2))
                
                # Category Choice Mapper
                mapped_cat = 'other'
                if category_word in ['food', 'meals', 'lunch', 'dinner', 'tea', 'chai', 'खाना', 'नाश्ता', 'फूड']:
                    mapped_cat = 'food'
                elif category_word in ['rent', 'lease', 'room', 'किराया', 'रेंट']:
                    mapped_cat = 'rent'
                elif category_word in ['transport', 'fuel', 'diesel', 'petrol', 'travel', 'cab', 'van', 'डीजल', 'पेट्रोल', 'गाड़ी']:
                    mapped_cat = 'transport'
                elif category_word in ['shopping', 'buy', 'purchase', 'tools', 'hardware', 'lock', 'सामान', 'खरीद']:
                    mapped_cat = 'shopping'
                elif category_word in ['entertainment', 'movie', 'fun']:
                    mapped_cat = 'entertainment'
                elif category_word in ['health', 'medical', 'medicine', 'gadget', 'helth', 'दवा']:
                    mapped_cat = 'helth'
                elif category_word in ['salary', 'wage', 'bill', 'utility', 'month', 'monthexpences', 'बिल']:
                    mapped_cat = 'monthexpences'
                
                new_dw_exp = Expense_day_wise.objects.create(
                    user=request.user,
                    date=timezone.now().date(),
                    category=mapped_cat,
                    amount=amount_val,
                    description=f"AI voice logged: '{category_word}'"
                )
                cat_label = mapped_cat.replace('monthexpences', 'Month Expenses').replace('helth', 'Health Gadget').capitalize()
                return JsonResponse({
                    "response": f"I have logged a daily spend of <strong>₹{new_dw_exp.amount:,.2f}</strong> under the <strong>'{cat_label}'</strong> category."
                }, status=200)

            # 2. LINE-BY-LINE INFORMATION QUERIES
            emp_count = Employee.objects.count()
            proj_count = Project.objects.count()
            task_count = Task.objects.count()
            expense_agg = Expense_day_wise.objects.filter(user=request.user).aggregate(Sum('amount'))
            total_expense = expense_agg['amount__sum'] or 0

            if any(k in prompt_lower or k in prompt for k in ["task", "todo", "pending", "routine", "टास्क", "काम"]):
                # Operational Tasks
                tasks = Task.objects.all().order_by('-deadline')
                if tasks.exists():
                    task_items = "".join([
                        f"<li>📌 <strong>{t.title}</strong> — {t.status} (Assigned: {t.assigned_to.name}, Project: {t.project.name}, Due: {t.deadline})</li>" 
                        for t in tasks
                    ])
                    response_text = f"Here are your active operational tasks:<br><ul class='space-y-1.5 mt-2'>{task_items}</ul>"
                else:
                    response_text = "No operational tasks found."
                    
            elif any(k in prompt_lower or k in prompt for k in ["employee", "staff", "people", "team", "एम्प्लॉई", "स्टाफ", "कर्मचारी"]):
                employees = Employee.objects.all()
                if employees.exists():
                    emp_items = "".join([
                        f"<li>👤 <strong>{e.name}</strong> — {e.designation} (Call: {e.phone}, {e.email})</li>" 
                        for e in employees
                    ])
                    response_text = f"Here is the active staff directory:<br><ul class='space-y-1.5 mt-2'>{emp_items}</ul>"
                else:
                    response_text = "No registered employees found."
                    
            elif any(k in prompt_lower or k in prompt for k in ["project", "board", "प्रोजेक्ट"]):
                projects = Project.objects.all()
                if projects.exists():
                    proj_items = "".join([
                        f"<li>🏗️ <strong>{p.name}</strong> — Managed by: {p.manager.name} (Starts: {p.start_date}, Ends: {p.end_date})</li>" 
                        for p in projects
                    ])
                    response_text = f"Here is the active project list:<br><ul class='space-y-1.5 mt-2'>{proj_items}</ul>"
                else:
                    response_text = "No active projects found."
                    
            elif any(k in prompt_lower or k in prompt for k in ["expense", "spend", "ledger", "cost", "expences", "purchase", "purchases", "एक्सपेंस", "खर्चा"]):
                expenses = Expense_day_wise.objects.filter(user=request.user).order_by('-date')[:10]
                if expenses.exists():
                    exp_items = "".join([
                        f"<li>💸 <strong>{e.date}</strong> — ₹{e.amount:,.2f} ({e.category.capitalize()}: {e.description})</li>" 
                        for e in expenses
                    ])
                    response_text = f"Here are your recent category spends:<br><ul class='space-y-1.5 mt-2'>{exp_items}</ul>"
                else:
                    response_text = "No spend records found."
            
            else:
                # Default high-level dashboard metrics overview
                response_text = (
                    f"Hello! I am your AI project assistant. Here is a high-level overview of your agribusiness system status:<br><br>"
                    f"👤 <strong>Employees:</strong> {emp_count} registered staff.<br>"
                    f"🏗️ <strong>Projects:</strong> {proj_count} active boards.<br>"
                    f"📋 <strong>Tasks:</strong> {task_count} tracked operational tasks.<br>"
                    f"💰 <strong>Finance:</strong> ₹{total_expense:,.2f} logged expenditures.<br><br>"
                    f"You can ask me questions like: <em>'what is my tasks?'</em> or give voice commands like: "
                    f"<em>'task is goto marking'</em> or <em>'expense is food 200'</em> to automatically log data."
                )
                
            return JsonResponse({"response": response_text}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)


# API VIEWSET FOR PROJECT-BASED EXPENSES
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

def get_matching_employees(user):
    from employees.models import Employee
    import re
    if not user.is_authenticated:
        return Employee.objects.none()
    clean_username = user.username.strip().lower()
    matching_ids = []
    for emp in Employee.objects.all():
        clean_emp_name = re.sub(r'\s+', '', emp.name).lower()
        clean_emp_email = emp.email.strip().lower()
        if user.email and clean_emp_email == user.email.strip().lower():
            matching_ids.append(emp.id)
        elif clean_emp_name == clean_username:
            matching_ids.append(emp.id)
        elif clean_emp_name in clean_username or clean_username in clean_emp_name:
            matching_ids.append(emp.id)
        else:
            emp_first_word = emp.name.split()[0].lower() if emp.name.split() else ""
            if emp_first_word and emp_first_word in clean_username and len(emp_first_word) > 2:
                matching_ids.append(emp.id)
    return Employee.objects.filter(id__in=matching_ids)

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.is_staff or user.username == 'admin':
            return Expense.objects.all()
        matching_emps = get_matching_employees(user)
        return Expense.objects.filter(employee__in=matching_emps)


# API VIEWSET FOR DAILY/CATEGORY-WISE EXPENSES (DAY-WISE)
class ExpenseDayWiseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseDayWiseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admin/Staff can see all transactions; others see only their own
        user = self.request.user
        if user.is_staff or user.is_superuser or user.username == 'admin':
            queryset = Expense_day_wise.objects.all().order_by('-date')
        else:
            queryset = Expense_day_wise.objects.filter(user=user).order_by('-date')

        # Read query parameters for dynamic chart filtering
        date = self.request.query_params.get("date")
        month = self.request.query_params.get("month")
        year = self.request.query_params.get("year")
        category = self.request.query_params.get("category")

        if date:
            queryset = queryset.filter(date=date)
        if month:
            queryset = queryset.filter(date__month=month)
        if year:
            queryset = queryset.filter(date__year=year)
        if category:
            queryset = queryset.filter(category__iexact=category)

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



