from django.shortcuts import render, redirect, get_object_or_404
from .models import Todo
from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.db.models import Q

# new more filed
def todo_create(request):
    users = User.objects.all()

    if request.method == "POST":
        title = request.POST.get('title')
        description = request.POST.get('description')
        frequency = request.POST.get('frequency')
        priority = request.POST.get('priority')
        status = request.POST.get('status')
        due_date = request.POST.get('due_date')
        category = request.POST.get('category')
        user_id = request.POST.get('assigned_to')
        
        assignee = User.objects.get(id=user_id) if user_id else None
        Todo.objects.create(
            title=title,
            description=description,
            frequency=frequency,
            priority=priority,
            status=status,
            due_date=due_date if due_date else None, # Handles empty date
            category=category,
            assigned_to=assignee,
            created_by=request.user, # Tracks who made the task
            is_completed=False
        )
        return redirect('todo_list')
    
    return render(request, 'todo/todo_form.html', {'users': users})

def todo_update(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    users = User.objects.all() # Added so you can re-assign during update
    
    if request.method == "POST":
        todo.title = request.POST.get('title')
        todo.description = request.POST.get('description')
        todo.frequency = request.POST.get('frequency')
        todo.priority = request.POST.get('priority')
        todo.status = request.POST.get('status')
        todo.category = request.POST.get('category')
        
        # Handle due date (ensure it's not empty string)
        due_date = request.POST.get('due_date')
        todo.due_date = due_date if due_date else None
        
        # Handle Assignment
        user_id = request.POST.get('assigned_to')
        if user_id:
            todo.assigned_to = User.objects.get(id=user_id)
            
        # Handle Completion logic
        todo.is_completed = True if request.POST.get('is_completed') == 'on' else False
        
        todo.save()
        return redirect('todo_list')
    
    return render(request, 'todo/todo_form.html', {'todo': todo, 'users': users})

def todo_delete(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    if request.method == "POST":
        todo.delete()
        return redirect('todo_list')
    
    return render(request, 'todo/todo_confirm_delete.html', {'todo': todo})

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

def todo_list(request):
    # Base Queryset
    if request.user.is_staff or request.user.is_superuser or request.user.username == 'admin':
        # todos = Todo.objects.all()
        todos_list = Todo.objects.all().order_by('-due_date')
    else:
        # User sees tasks they created OR tasks assigned to them
        todos_list = Todo.objects.filter(Q(created_by=request.user) | Q(assigned_to=request.user))    
    
   

    # Capture ALL Filters (Old + New)
    search_query = request.GET.get('search', '')
    status_filter = request.GET.get('status', '')
    priority_filter = request.GET.get('priority', '')
    category_filter = request.GET.get('category', '') # New
    start_date = request.GET.get('start_date', '')   # New
    end_date = request.GET.get('end_date', '')       # New

    # Apply Filters
    if search_query:
        todos_list = todos_list.filter(title__icontains=search_query)
    if status_filter == 'completed':
        todos_list = todos_list.filter(is_completed=True)
    elif status_filter == 'pending':
        todos_list = todos_list.filter(is_completed=False)
    if priority_filter:
        todos_list = todos_list.filter(priority=priority_filter)
    if category_filter:
        todos_list = todos_list.filter(category__icontains=category_filter)
    if start_date:
        todos_list = todos_list.filter(due_date__date__gte=start_date)
    if end_date:
        todos_list = todos_list.filter(due_date__date__lte=end_date)

    # Counters for Chart
    complete_count = todos_list.filter(is_completed=True).count()
    pending_count = todos_list.filter(is_completed=False).count()

    # Pagination
    paginator = Paginator(todos_list, 10)
    page_number = request.GET.get('page')
    todos = paginator.get_page(page_number)

    context = {
        'todos': todos,
        'search_query': search_query,
        'status_filter': status_filter,
        'priority_filter': priority_filter,
        'category_filter': category_filter,
        'start_date': start_date,
        'end_date': end_date,
        'complete_count': complete_count,
        'pending_count': pending_count,
    }
    return render(request, 'todo/todo_list.html', context)

# @login_required
def todo_dashboard(request):
    # 1. USER-WISE DATA FILTERING
    if request.user.is_staff or request.user.is_superuser or request.user.username == 'admin':
        todos = Todo.objects.all()
    else:
        # User sees tasks they created OR tasks assigned to them
        todos = Todo.objects.filter(Q(created_by=request.user) | Q(assigned_to=request.user))

    # 2. GENERAL CALCULATIONS
    total = todos.count()
    completed = todos.filter(is_completed=True).count()
    pending = total - completed
    percentage = (completed / total * 100) if total > 0 else 0

    # 3. PRIORITY DATA (For the Bar Chart)
    priority_data = {
        'low': todos.filter(priority='low').count(),
        'medium': todos.filter(priority='medium').count(),
        'high': todos.filter(priority='high').count(),
        'urgent': todos.filter(priority='urgent').count(),
    }

    # 4. CATEGORIZED STATISTICS (For Stat Cards & Table)
    # This matches your template loop: {% for freq, tasks in stats.items %}
    stats = {
        'Daily': todos.filter(frequency='daily'),
        'Weekly': todos.filter(frequency='weekly'),
        'Monthly': todos.filter(frequency='monthly'),
        'Yearly': todos.filter(frequency='yearly'),
    }

    context = {
        'stats': stats,
        'percentage': percentage,
        'completed_count': completed,
        'pending_count': pending,
        'priority_data': priority_data,
        'total_count': total,
    }
    
    return render(request, 'todo/dashboard.html', context)

 




































# # from django.views.generic import ListView, CreateView, UpdateView, DeleteView
# # from django.urls import reverse_lazy
# # from .models import Todo
# # from django.shortcuts import render
 
# # # 1. MAKE SURE THIS FUNCTION EXISTS
# # def track_dashboard(request):
# #     todos = Todo.objects.all()
    
# #     total_count = todos.count()
# #     completed_count = todos.filter(is_completed=True).count()
    
# #     stats = {
# #         'daily': todos.filter(frequency='daily'),
# #         'weekly': todos.filter(frequency='weekly'),
# #         'monthly': todos.filter(frequency='monthly'),
# #         'yearly': todos.filter(frequency='yearly'),
# #     }
    
# #     context = {
# #         'total': total_count,
# #         'completed': completed_count,
# #         'percentage': (completed_count / total_count * 100) if total_count > 0 else 0,
# #         'stats': stats
# #     }
# #     return render(request, 'todo/dashboard.html', context)

# # class TodoListView(ListView):
# #     model = Todo
# #     template_name = 'todo/todo_list.html'

# # class TodoCreateView(CreateView):
# #     model = Todo
# #     fields = ['title', 'frequency', 'is_completed']
# #     success_url = reverse_lazy('todo_list')

# # class TodoUpdateView(UpdateView):
# #     model = Todo
# #     fields = ['title', 'frequency', 'is_completed']
# #     success_url = reverse_lazy('todo_list')

# # class TodoDeleteView(DeleteView):
# #     model = Todo
# #     success_url = reverse_lazy('todo_list')

# from django.shortcuts import render, redirect, get_object_or_404
# from .models import Todo
# from django.contrib.auth.models import User

# # 1. Dashboard View
# # def track_dashboard(request):
# #     todos = Todo.objects.all()
# #     total = todos.count()
# #     completed = todos.filter(is_completed=True).count()
    
# #     context = {
# #         'total': total,
# #         'completed': completed,
# #         'percentage': (completed / total * 100) if total > 0 else 0,
# #         'stats': {
# #             'Daily': todos.filter(frequency='daily'),
# #             'Weekly': todos.filter(frequency='weekly'),
# #             'Monthly': todos.filter(frequency='monthly'),
# #             'Yearly': todos.filter(frequency='yearly'),
# #         }
# #     }
# #     return render(request, 'todo/dashboard.html', context)

# # for admin
# def track_dashboard(request):
#     # If Anil is logged in, show everything
#     if request.user.is_staff: 
#         todos = Todo.objects.all()
#     else:
#         # If Rohit is logged in, show only his tasks
#         todos = Todo.objects.filter(assigned_to=request.user)

#     total = todos.count()
#     completed = todos.filter(is_completed=True).count()
    
#     # Get all users so Anil can see who has tasks
#     all_users = User.objects.all()

#     context = {
#         'total': total,
#         'completed': completed,
#         'percentage': (completed / total * 100) if total > 0 else 0,
#         'all_users': all_users,
#         'stats': {
#             'Daily': todos.filter(frequency='daily'),
#             'Weekly': todos.filter(frequency='weekly'),
#             'Monthly': todos.filter(frequency='monthly'),
#             'Yearly': todos.filter(frequency='yearly'),
#         }
#     }
#     return render(request, 'todo/dashboard.html', context)


# # 2. List View (All Tasks)
# # def todo_list(request):
# #     # todos = Todo.objects.all().order_by('-created_at')
# #     todos = Todo.objects.all().order_by(user=request.user)
# #     # todos = Todo.objects.filter(user=request.user)
# #     return render(request, 'todo/todo_list.html', {'todos': todos})

# # @login_required
# # def todo_list(request):
# #     # 1. Logic: If Admin (Anil), show all. If User (Rohit), show only assigned.
# #     if request.user.is_staff:
# #         todos = Todo.objects.all().order_by('-created_at')
# #     else:
# #         todos = Todo.objects.filter(assigned_to=request.user).order_by('-created_at')
    
# #     return render(request, 'todo/todo_list.html', {'todos': todos})



# # 3. Create View
# # def todo_create(request):
# #     if request.method == "POST":
# #         title = request.POST.get('title')
# #         description = request.POST.get('description')
# #         frequency = request.POST.get('frequency')
# #         # Checkbox logic
# #         is_completed = True if request.POST.get('is_completed') == 'on' else False
        
# #         Todo.objects.create(
# #             title=title, 
# #             description=description, 
# #             frequency=frequency, 
# #             is_completed=is_completed
# #         )
# #         return redirect('todo_list')
    
# #     return render(request, 'todo/todo_form.html')



# # for admin
# # In your todo_create view
# # def todo_create(request):
# #     # Get all people (Anil, Rohit, Arjun) to show in the dropdown
# #     users = User.objects.all()

# #     if request.method == "POST":
# #         title = request.POST.get('title')
# #         description = request.POST.get('description')
# #         frequency = request.POST.get('frequency')
# #         user_id = request.POST.get('assigned_to') # Get the ID from the form
        
# #         assignee = User.objects.get(id=user_id) if user_id else request.user
# #         Todo.objects.create(
# #             title=title,
# #             description=description,
# #             frequency=frequency,
# #             assigned_to=assignee, # Save the person here
# #             is_completed=False
# #         )
# #         return redirect('todo_list')
    
# #     return render(request, 'todo/todo_form.html', {'users': users})

# # # 4. Update View
# # def todo_update(request, pk):
# #     todo = get_object_or_404(Todo, pk=pk)
    
# #     if request.method == "POST":
# #         todo.title = request.POST.get('title')
# #         todo.description = request.POST.get('description')
# #         todo.frequency = request.POST.get('frequency')
# #         todo.is_completed = True if request.POST.get('is_completed') == 'on' else False
# #         todo.save()
# #         return redirect('todo_list')
    
# #     return render(request, 'todo/todo_form.html', {'todo': todo})

# # # 5. Delete View
# # def todo_delete(request, pk):
# #     todo = get_object_or_404(Todo, pk=pk)
# #     if request.method == "POST":
# #         todo.delete()
# #         return redirect('todo_list')
    
# #     return render(request, 'todo/todo_confirm_delete.html', {'todo': todo})


# # new more filed

# from django.shortcuts import render, redirect, get_object_or_404
# from django.contrib.auth.models import User
# from .models import Todo
# from django.core.paginator import Paginator
# from django.db.models import Q

# def todo_create(request):
#     users = User.objects.all()

#     if request.method == "POST":
#         title = request.POST.get('title')
#         description = request.POST.get('description')
#         frequency = request.POST.get('frequency')
#         priority = request.POST.get('priority')
#         status = request.POST.get('status')
#         due_date = request.POST.get('due_date')
#         category = request.POST.get('category')
#         user_id = request.POST.get('assigned_to')
        
#         assignee = User.objects.get(id=user_id) if user_id else None
        
#         Todo.objects.create(
#             title=title,
#             description=description,
#             frequency=frequency,
#             priority=priority,
#             status=status,
#             due_date=due_date if due_date else None, # Handles empty date
#             category=category,
#             assigned_to=assignee,
#             created_by=request.user, # Tracks who made the task
#             is_completed=False
#         )
#         return redirect('todo_list')
    
#     return render(request, 'todo/todo_form.html', {'users': users})

# def todo_update(request, pk):
#     todo = get_object_or_404(Todo, pk=pk)
#     users = User.objects.all() # Added so you can re-assign during update
    
#     if request.method == "POST":
#         todo.title = request.POST.get('title')
#         todo.description = request.POST.get('description')
#         todo.frequency = request.POST.get('frequency')
#         todo.priority = request.POST.get('priority')
#         todo.status = request.POST.get('status')
#         todo.category = request.POST.get('category')
        
#         # Handle due date (ensure it's not empty string)
#         due_date = request.POST.get('due_date')
#         todo.due_date = due_date if due_date else None
        
#         # Handle Assignment
#         user_id = request.POST.get('assigned_to')
#         if user_id:
#             todo.assigned_to = User.objects.get(id=user_id)
            
#         # Handle Completion logic
#         todo.is_completed = True if request.POST.get('is_completed') == 'on' else False
        
#         todo.save()
#         return redirect('todo_list')
    
#     return render(request, 'todo/todo_form.html', {'todo': todo, 'users': users})

# def todo_delete(request, pk):
#     todo = get_object_or_404(Todo, pk=pk)
#     if request.method == "POST":
#         todo.delete()
#         return redirect('todo_list')
    
#     return render(request, 'todo/todo_confirm_delete.html', {'todo': todo})



# # def todo_list(request):
# #     # 1. Base Queryset
# #     # todo_list = Todo.objects.all()
    
# #     if request.user.is_staff:
# #         # Use 'date' or '-id' since 'created_at' doesn't exist in your model
# #         # expenses = Expense_day_wise.objects.all().order_by('-date')
# #         todo_list = Todo.objects.all().order_by('created_by')
# #     else:
# #         # expenses = Expense_day_wise.objects.filter(user=request.user).order_by('-date')    
# #         todo_list = Todo.objects.all().filter(user=request.user).order_by('created_by')  

# #     # 2. Filtering Logic
# #     search_query = request.GET.get('search', '')
# #     status_filter = request.GET.get('status', '')
# #     priority_filter = request.GET.get('priority', '')

# #     if search_query:
# #         todo_list = todo_list.filter(title__icontains=search_query)
    
# #     if status_filter:
# #         if status_filter == 'completed':
# #             todo_list = todo_list.filter(is_completed=True)
# #         elif status_filter == 'pending':
# #             todo_list = todo_list.filter(is_completed=False)

# #     if priority_filter:
# #         todo_list = todo_list.filter(priority=priority_filter)

# #     # 3. Graph Data Calculation (Calculated on filtered results)
# #     complete_count = todo_list.filter(is_completed=True).count()
# #     pending_count = todo_list.filter(is_completed=False).count()

# #     # 4. Pagination (10 tasks per page)
# #     paginator = Paginator(todo_list, 10)
# #     page_number = request.GET.get('page')
# #     page_obj = paginator.get_page(page_number)

# #     context = {
# #         'todos': page_obj,
# #         'complete_count': complete_count,
# #         'pending_count': pending_count,
# #         'search_query': search_query,
# #         'status_filter': status_filter,
# #         'priority_filter': priority_filter,
# #     }
# #     return render(request, 'todo/todo_list.html', context)


# # def todo_list(request):
# #     # 1. Base Queryset Logic
# #     # If admin, show all. If regular user, show only their own tasks.
# #     if request.user.is_staff:
# #         todo_list = Todo.objects.all()
# #     else:
# #         # Note: Using 'created_by' because that's the field in your Model
# #         todo_list = Todo.objects.filter(created_by=request.user)

# #     # 2. Filtering Logic
# #     search_query = request.GET.get('search', '')
# #     status_filter = request.GET.get('status', '')
# #     priority_filter = request.GET.get('priority', '')

# #     if search_query:
# #         todo_list = todo_list.filter(title__icontains=search_query)
    
# #     if status_filter:
# #         if status_filter == 'completed':
# #             todo_list = todo_list.filter(is_completed=True)
# #         elif status_filter == 'pending':
# #             todo_list = todo_list.filter(is_completed=False)

# #     if priority_filter:
# #         todo_list = todo_list.filter(priority=priority_filter)

# #     # 3. Graph Data Calculation
# #     # We use .count() on the filtered list for the dashboard stats
# #     complete_count = todo_list.filter(is_completed=True).count()
# #     pending_count = todo_list.filter(is_completed=False).count()

# #     # 4. Pagination (10 tasks per page)
# #     # We add an explicit order_by here to ensure stable pagination
# #     paginator = Paginator(todo_list.order_by('-created_at'), 10)
# #     page_number = request.GET.get('page')
# #     page_obj = paginator.get_page(page_number)

# #     context = {
# #         'todos': page_obj,
# #         'complete_count': complete_count,
# #         'pending_count': pending_count,
# #         'search_query': search_query,
# #         'status_filter': status_filter,
# #         'priority_filter': priority_filter,
# #     }
# #     return render(request, 'todo/todo_list.html', context)



# def todo_list(request):
#     # Base Queryset
#     if request.user.is_staff or request.user.is_superuser or request.user.username == 'admin':
#         # todos = Todo.objects.all()
#         todos_list = Todo.objects.all().order_by('-due_date')
#     else:
#         # User sees tasks they created OR tasks assigned to them
#         todos_list = Todo.objects.filter(Q(created_by=request.user) | Q(assigned_to=request.user))    
    
   

#     # Capture ALL Filters (Old + New)
#     search_query = request.GET.get('search', '')
#     status_filter = request.GET.get('status', '')
#     priority_filter = request.GET.get('priority', '')
#     category_filter = request.GET.get('category', '') # New
#     start_date = request.GET.get('start_date', '')   # New
#     end_date = request.GET.get('end_date', '')       # New

#     # Apply Filters
#     if search_query:
#         todos_list = todos_list.filter(title__icontains=search_query)
#     if status_filter == 'completed':
#         todos_list = todos_list.filter(is_completed=True)
#     elif status_filter == 'pending':
#         todos_list = todos_list.filter(is_completed=False)
#     if priority_filter:
#         todos_list = todos_list.filter(priority=priority_filter)
#     if category_filter:
#         todos_list = todos_list.filter(category__icontains=category_filter)
#     if start_date:
#         todos_list = todos_list.filter(due_date__date__gte=start_date)
#     if end_date:
#         todos_list = todos_list.filter(due_date__date__lte=end_date)

#     # Counters for Chart
#     complete_count = todos_list.filter(is_completed=True).count()
#     pending_count = todos_list.filter(is_completed=False).count()

#     # Pagination
#     paginator = Paginator(todos_list, 10)
#     page_number = request.GET.get('page')
#     todos = paginator.get_page(page_number)

#     context = {
#         'todos': todos,
#         'search_query': search_query,
#         'status_filter': status_filter,
#         'priority_filter': priority_filter,
#         'category_filter': category_filter,
#         'start_date': start_date,
#         'end_date': end_date,
#         'complete_count': complete_count,
#         'pending_count': pending_count,
#     }
#     return render(request, 'todo/todo_list.html', context)

# # def todo_dashboard(request):
# #     print(f"Created by: {request.user}")
# #     # Base Data
# #     todos = Todo.objects.all()
# #     # if request.user.is_staff:
# #     #     todos = Todo.objects.all()
# #     # else:
# #     #     todos = Todo.objects.filter(created_by=request.user) 
# #     #     print(f"Created by todos: {todos}")   
        
    
    
# #     total = todos.count()
# #     completed = todos.filter(is_completed=True).count()
    
# #     # Priority Data for Graph
# #     priority_data = {
# #         'low': todos.filter(priority='low').count(),
# #         'medium': todos.filter(priority='medium').count(),
# #         'high': todos.filter(priority='high').count(),
# #         'urgent': todos.filter(priority='urgent').count(),
# #     }

# #     # Calculation for Progress Bar
# #     percentage = (completed / total * 100) if total > 0 else 0

# #     # Categorized Statistics for the Cards
# #     stats = {
# #         'Daily': todos.filter(frequency='daily'),
# #         'Weekly': todos.filter(frequency='weekly'),
# #         'Monthly': todos.filter(frequency='monthly'),
# #         'Yearly': todos.filter(frequency='yearly'),
# #     }

# #     context = {
# #         'stats': stats,
# #         'percentage': percentage,
# #         'completed_count': completed,
# #         'pending_count': total - completed,
# #         'priority_data': priority_data,
# #     }
# #     return render(request, 'todo/dashboard.html', context)

 
# # @login_required
# # def todo_dashboard(request):
# #     if request.user.is_staff:
# #         todos = Todo.objects.all()
# #     else:
# #         todos = Todo.objects.filter(created_by=request.user)

# #     total = todos.count()
# #     completed = todos.filter(is_completed=True).count()
    
# #     priority_data = {
# #         'low': todos.filter(priority='low').count(),
# #         'medium': todos.filter(priority='medium').count(),
# #         'high': todos.filter(priority='high').count(),
# #         'urgent': todos.filter(priority='urgent').count(),
# #     }

# #     percentage = (completed / total * 100) if total > 0 else 0

# #     # Categorized Statistics: We store the QuerySet so the table can loop through them
# #     stats = {
# #         'Daily': todos.filter(frequency='daily'),
# #         'Weekly': todos.filter(frequency='weekly'),
# #         'Monthly': todos.filter(frequency='monthly'),
# #         'Yearly': todos.filter(frequency='yearly'),
# #     }

# #     context = {
# #         'stats': stats,
# #         'percentage': percentage,
# #         'completed_count': completed,
# #         'pending_count': total - completed,
# #         'priority_data': priority_data,
# #     }
# #     return render(request, 'todo/dashboard.html', context)





 
# def todo_dashboard(request):
#     # 1. USER-WISE DATA FILTERING
#     # Admin/Staff sees everything, regular users see only their own tasks
#     if request.user.is_staff or request.user.is_superuser or request.user.username == 'admin':
#         todos = Todo.objects.all()
#     else:
#         # User sees tasks they created OR tasks assigned to them
#         todos = Todo.objects.filter(Q(created_by=request.user) | Q(assigned_to=request.user))

#     # 2. GENERAL CALCULATIONS
#     total = todos.count()
#     completed = todos.filter(is_completed=True).count()
#     pending = total - completed
#     percentage = (completed / total * 100) if total > 0 else 0

#     # 3. PRIORITY DATA (For the Bar Chart)
#     priority_data = {
#         'low': todos.filter(priority='low').count(),
#         'medium': todos.filter(priority='medium').count(),
#         'high': todos.filter(priority='high').count(),
#         'urgent': todos.filter(priority='urgent').count(),
#     }

#     # 4. CATEGORIZED STATISTICS (For Stat Cards & Table)
#     # This matches your template loop: {% for freq, tasks in stats.items %}
#     stats = {
#         'Daily': todos.filter(frequency='daily'),
#         'Weekly': todos.filter(frequency='weekly'),
#         'Monthly': todos.filter(frequency='monthly'),
#         'Yearly': todos.filter(frequency='yearly'),
#     }

#     context = {
#         'stats': stats,
#         'percentage': percentage,
#         'completed_count': completed,
#         'pending_count': pending,
#         'priority_data': priority_data,
#         'total_count': total,
#     }
    
#     return render(request, 'todo/dashboard.html', context)



# # for jaon support api

# # import json
# # from django.http import JsonResponse
# # from django.views.decorators.csrf import csrf_exempt

# # @csrf_exempt # This allows Postman to work without a CSRF token
# # def todo_create(request):
# #     if request.method == "POST":
# #         # Check if the data is JSON
# #         if request.content_type == 'application/json':
# #             data = json.loads(request.body)
# #             title = data.get('title')
# #             description = data.get('description')
# #             frequency = data.get('frequency')
# #             is_completed = data.get('is_completed', False)
# #         else:
# #             # Traditional form data
# #             title = request.POST.get('title')
# #             description = request.POST.get('description')
# #             frequency = request.POST.get('frequency')
# #             is_completed = True if request.POST.get('is_completed') == 'on' else False

# #         Todo.objects.create(
# #             title=title,
# #             description=description,
# #             frequency=frequency,
# #             is_completed=is_completed
# #         )
        
# #         # If it's a JSON request (Postman), return JSON
# #         return redirect('todo_list')
    
# #     return render(request, 'todo/todo_form.html')


# API VIEWSET
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import TodoSerializer

class TodoViewSet(viewsets.ModelViewSet):
    serializer_class = TodoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.is_staff or user.username == 'admin':
            queryset = Todo.objects.all()
        else:
            from django.db.models import Q
            queryset = Todo.objects.filter(Q(created_by=user) | Q(assigned_to=user))

        priority = self.request.query_params.get('priority')
        status = self.request.query_params.get('status')
        category = self.request.query_params.get('category')

        if priority:
            queryset = queryset.filter(priority=priority)
        if status:
            queryset = queryset.filter(status=status)
        if category:
            queryset = queryset.filter(category__icontains=category)

        return queryset.order_by('-id')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)