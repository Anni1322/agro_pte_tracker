from django.shortcuts import render

def home(request):
    return render(request, 'home/dashboard.html')

def expense_view(request):
    return render(request, 'expenses/expense.html')

def task_view(request):
    return render(request, 'dashboard/task.html')

def project_view(request):
    return render(request, 'dashboard/project.html')

def employee_view(request):
    return render(request, 'dashboard/employee.html')

def study_view(request):
    return render(request, 'dashboard/study.html')
