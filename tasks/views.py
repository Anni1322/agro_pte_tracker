from django.shortcuts import render, redirect

 
def employees_view(request):
    return render(request, 'tasks/task_home.html')