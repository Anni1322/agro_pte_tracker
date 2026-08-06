from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Task
from .forms import TaskForm

@login_required
def task_list(request):
    tasks = Task.objects.all()
    # We can group them by status for a Kanban-style layout
    pending_tasks = tasks.filter(status='Pending')
    progress_tasks = tasks.filter(status='In Progress')
    completed_tasks = tasks.filter(status='Completed')
    
    return render(request, 'tasks/task_list.html', {
        'pending_tasks': pending_tasks,
        'progress_tasks': progress_tasks,
        'completed_tasks': completed_tasks,
        'all_tasks': tasks
    })

@login_required
def task_create(request):
    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('task_list')
    else:
        form = TaskForm()
    return render(request, 'tasks/task_form.html', {'form': form, 'title': 'Create Task'})

@login_required
def task_update(request, pk):
    task = get_object_or_404(Task, pk=pk)
    if request.method == 'POST':
        form = TaskForm(request.POST, instance=task)
        if form.is_valid():
            form.save()
            return redirect('task_list')
    else:
        form = TaskForm(instance=task)
    return render(request, 'tasks/task_form.html', {'form': form, 'title': 'Edit Task', 'task': task})

@login_required
def task_delete(request, pk):
    task = get_object_or_404(Task, pk=pk)
    if request.method == 'POST':
        task.delete()
        return redirect('task_list')
    return render(request, 'tasks/task_confirm_delete.html', {'task': task})


# API VIEWSET
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import TaskSerializer

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

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.is_staff or user.username == 'admin':
            queryset = Task.objects.all()
        else:
            matching_emps = get_matching_employees(user)
            from django.db.models import Q
            queryset = Task.objects.filter(
                Q(assigned_to__in=matching_emps) |
                Q(project__manager__in=matching_emps)
            )

        status = self.request.query_params.get('status')
        project = self.request.query_params.get('project')
        assigned_to = self.request.query_params.get('assigned_to')

        if status:
            queryset = queryset.filter(status=status)
        if project:
            queryset = queryset.filter(project=project)
        if assigned_to:
            queryset = queryset.filter(assigned_to=assigned_to)

        return queryset.order_by('-id')