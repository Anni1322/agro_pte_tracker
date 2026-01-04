# from django.views.generic import ListView, CreateView, UpdateView, DeleteView
# from django.urls import reverse_lazy
# from .models import Todo
# from django.shortcuts import render
 
# # 1. MAKE SURE THIS FUNCTION EXISTS
# def track_dashboard(request):
#     todos = Todo.objects.all()
    
#     total_count = todos.count()
#     completed_count = todos.filter(is_completed=True).count()
    
#     stats = {
#         'daily': todos.filter(frequency='daily'),
#         'weekly': todos.filter(frequency='weekly'),
#         'monthly': todos.filter(frequency='monthly'),
#         'yearly': todos.filter(frequency='yearly'),
#     }
    
#     context = {
#         'total': total_count,
#         'completed': completed_count,
#         'percentage': (completed_count / total_count * 100) if total_count > 0 else 0,
#         'stats': stats
#     }
#     return render(request, 'todo/dashboard.html', context)

# class TodoListView(ListView):
#     model = Todo
#     template_name = 'todo/todo_list.html'

# class TodoCreateView(CreateView):
#     model = Todo
#     fields = ['title', 'frequency', 'is_completed']
#     success_url = reverse_lazy('todo_list')

# class TodoUpdateView(UpdateView):
#     model = Todo
#     fields = ['title', 'frequency', 'is_completed']
#     success_url = reverse_lazy('todo_list')

# class TodoDeleteView(DeleteView):
#     model = Todo
#     success_url = reverse_lazy('todo_list')

from django.shortcuts import render, redirect, get_object_or_404
from .models import Todo
from django.contrib.auth.models import User

# 1. Dashboard View
# def track_dashboard(request):
#     todos = Todo.objects.all()
#     total = todos.count()
#     completed = todos.filter(is_completed=True).count()
    
#     context = {
#         'total': total,
#         'completed': completed,
#         'percentage': (completed / total * 100) if total > 0 else 0,
#         'stats': {
#             'Daily': todos.filter(frequency='daily'),
#             'Weekly': todos.filter(frequency='weekly'),
#             'Monthly': todos.filter(frequency='monthly'),
#             'Yearly': todos.filter(frequency='yearly'),
#         }
#     }
#     return render(request, 'todo/dashboard.html', context)

# for admin
def track_dashboard(request):
    # If Anil is logged in, show everything
    if request.user.is_staff: 
        todos = Todo.objects.all()
    else:
        # If Rohit is logged in, show only his tasks
        todos = Todo.objects.filter(assigned_to=request.user)

    total = todos.count()
    completed = todos.filter(is_completed=True).count()
    
    # Get all users so Anil can see who has tasks
    all_users = User.objects.all()

    context = {
        'total': total,
        'completed': completed,
        'percentage': (completed / total * 100) if total > 0 else 0,
        'all_users': all_users,
        'stats': {
            'Daily': todos.filter(frequency='daily'),
            'Weekly': todos.filter(frequency='weekly'),
            'Monthly': todos.filter(frequency='monthly'),
            'Yearly': todos.filter(frequency='yearly'),
        }
    }
    return render(request, 'todo/dashboard.html', context)


# 2. List View (All Tasks)
# def todo_list(request):
#     # todos = Todo.objects.all().order_by('-created_at')
#     todos = Todo.objects.all().order_by(user=request.user)
#     # todos = Todo.objects.filter(user=request.user)
#     return render(request, 'todo/todo_list.html', {'todos': todos})

# @login_required
def todo_list(request):
    # 1. Logic: If Admin (Anil), show all. If User (Rohit), show only assigned.
    if request.user.is_staff:
        todos = Todo.objects.all().order_by('-created_at')
    else:
        todos = Todo.objects.filter(assigned_to=request.user).order_by('-created_at')
    
    return render(request, 'todo/todo_list.html', {'todos': todos})
# 3. Create View
# def todo_create(request):
#     if request.method == "POST":
#         title = request.POST.get('title')
#         description = request.POST.get('description')
#         frequency = request.POST.get('frequency')
#         # Checkbox logic
#         is_completed = True if request.POST.get('is_completed') == 'on' else False
        
#         Todo.objects.create(
#             title=title, 
#             description=description, 
#             frequency=frequency, 
#             is_completed=is_completed
#         )
#         return redirect('todo_list')
    
#     return render(request, 'todo/todo_form.html')

# for admin
# In your todo_create view
def todo_create(request):
    # Get all people (Anil, Rohit, Arjun) to show in the dropdown
    users = User.objects.all()

    if request.method == "POST":
        title = request.POST.get('title')
        description = request.POST.get('description')
        frequency = request.POST.get('frequency')
        user_id = request.POST.get('assigned_to') # Get the ID from the form
        
        assignee = User.objects.get(id=user_id) if user_id else request.user
        Todo.objects.create(
            title=title,
            description=description,
            frequency=frequency,
            assigned_to=assignee, # Save the person here
            is_completed=False
        )
        return redirect('todo_list')
    
    return render(request, 'todo/todo_form.html', {'users': users})

# 4. Update View
def todo_update(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    
    if request.method == "POST":
        todo.title = request.POST.get('title')
        todo.description = request.POST.get('description')
        todo.frequency = request.POST.get('frequency')
        todo.is_completed = True if request.POST.get('is_completed') == 'on' else False
        todo.save()
        return redirect('todo_list')
    
    return render(request, 'todo/todo_form.html', {'todo': todo})

# 5. Delete View
def todo_delete(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    if request.method == "POST":
        todo.delete()
        return redirect('todo_list')
    
    return render(request, 'todo/todo_confirm_delete.html', {'todo': todo})












# for jaon support api

# import json
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt

# @csrf_exempt # This allows Postman to work without a CSRF token
# def todo_create(request):
#     if request.method == "POST":
#         # Check if the data is JSON
#         if request.content_type == 'application/json':
#             data = json.loads(request.body)
#             title = data.get('title')
#             description = data.get('description')
#             frequency = data.get('frequency')
#             is_completed = data.get('is_completed', False)
#         else:
#             # Traditional form data
#             title = request.POST.get('title')
#             description = request.POST.get('description')
#             frequency = request.POST.get('frequency')
#             is_completed = True if request.POST.get('is_completed') == 'on' else False

#         Todo.objects.create(
#             title=title,
#             description=description,
#             frequency=frequency,
#             is_completed=is_completed
#         )
        
#         # If it's a JSON request (Postman), return JSON
#         if request.content_type == 'application/json':
#             return JsonResponse({"status": "Task created successfully!"}, status=201)
            
#         return redirect('todo_list')
    
#     return render(request, 'todo/todo_form.html')