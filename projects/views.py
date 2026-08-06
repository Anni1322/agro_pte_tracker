from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Project
from .forms import ProjectForm

@login_required
def project_list(request):
    projects = Project.objects.all()
    return render(request, 'projects/project_list.html', {'projects': projects})

@login_required
def project_create(request):
    if request.method == 'POST':
        form = ProjectForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('project_list')
    else:
        form = ProjectForm()
    return render(request, 'projects/project_form.html', {'form': form, 'title': 'Create Project'})

@login_required
def project_update(request, pk):
    project = get_object_or_404(Project, pk=pk)
    if request.method == 'POST':
        form = ProjectForm(request.POST, instance=project)
        if form.is_valid():
            form.save()
            return redirect('project_list')
    else:
        form = ProjectForm(instance=project)
    return render(request, 'projects/project_form.html', {'form': form, 'title': 'Edit Project', 'project': project})

@login_required
def project_delete(request, pk):
    project = get_object_or_404(Project, pk=pk)
    if request.method == 'POST':
        project.delete()
        return redirect('project_list')
    return render(request, 'projects/project_confirm_delete.html', {'project': project})


# API VIEWSET
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import ProjectSerializer

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

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.is_staff or user.username == 'admin':
            return Project.objects.all()
        matching_emps = get_matching_employees(user)
        return Project.objects.filter(manager__in=matching_emps)

