import os
import django
import datetime

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agro_pte_tracker.settings')
django.setup()

from django.contrib.auth.models import User
from employees.models import Employee
from projects.models import Project
from tasks.models import Task
from expenses.models import Expense
from todo.models import Todo

def seed():
    print("Starting database seeding...")

    # Ensure a default manager superuser exists
    admin_user, created = User.objects.get_or_create(
        username='manager',
        defaults={
            'email': 'manager@agro.com',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('agro1234')
        admin_user.save()
        print("Created default admin user: manager / agro1234")
    else:
        print("Default admin user 'manager' already exists.")

    # 1. Create Employees
    employees_data = [
        {'name': 'Ramesh Patel', 'email': 'ramesh@agro.com', 'phone': '9876543210', 'designation': 'Field Supervisor'},
        {'name': 'Sunita Sharma', 'email': 'sunita@agro.com', 'phone': '9876543211', 'designation': 'Irrigation Engineer'},
        {'name': 'Vikram Singh', 'email': 'vikram@agro.com', 'phone': '9876543212', 'designation': 'Tractor Operator'},
        {'name': 'Anil Mehta', 'email': 'anil@agro.com', 'phone': '9876543213', 'designation': 'Agronomist'},
    ]

    employees = []
    for emp_info in employees_data:
        emp, created = Employee.objects.get_or_create(
            email=emp_info['email'],
            defaults={
                'name': emp_info['name'],
                'phone': emp_info['phone'],
                'designation': emp_info['designation']
            }
        )
        employees.append(emp)
        if created:
            print(f"Seeded Employee: {emp.name}")

    # 2. Create Projects
    projects_data = [
        {
            'name': 'Organic Wheat Cultivation',
            'description': 'Implementing fully organic wheat crop sowing, bio-fertilizer schedules, and solar water pump pipelines on Block A.',
            'start_date': datetime.date(2026, 5, 1),
            'end_date': datetime.date(2026, 11, 30),
            'manager': employees[0] # Ramesh Patel
        },
        {
            'name': 'Drip Canopy Greenhouse',
            'description': 'Setting up greenhouse structures, automated temperature sensors, and drip water nozzles in Block B.',
            'start_date': datetime.date(2026, 6, 10),
            'end_date': datetime.date(2026, 9, 25),
            'manager': employees[1] # Sunita Sharma
        },
    ]

    projects = []
    for proj_info in projects_data:
        proj, created = Project.objects.get_or_create(
            name=proj_info['name'],
            defaults={
                'description': proj_info['description'],
                'start_date': proj_info['start_date'],
                'end_date': proj_info['end_date'],
                'manager': proj_info['manager']
            }
        )
        projects.append(proj)
        if created:
            print(f"Seeded Project: {proj.name}")

    # 3. Create Tasks
    tasks_data = [
        {
            'title': 'Drip Emitter Pipeline Layout',
            'description': 'Layout the secondary PVC pipes and install 2L/h drip emitters across Block B greenhouse rows.',
            'assigned_to': employees[1], # Sunita
            'project': projects[1], # Greenhouse
            'status': 'In Progress',
            'deadline': datetime.date(2026, 7, 15)
        },
        {
            'title': 'Organic Compost Spreading',
            'description': 'Load tractor with bio-compost and spread evenly across Block A cultivation field rows.',
            'assigned_to': employees[2], # Vikram
            'project': projects[0], # Wheat
            'status': 'Pending',
            'deadline': datetime.date(2026, 6, 30)
        },
        {
            'title': 'Soil pH and Nitrogen Test',
            'description': 'Take soil core samples from 5 points in Block A and perform a laboratory pH and macro-nutrient analysis.',
            'assigned_to': employees[3], # Anil
            'project': projects[0], # Wheat
            'status': 'Completed',
            'deadline': datetime.date(2026, 6, 20)
        },
    ]

    for task_info in tasks_data:
        task, created = Task.objects.get_or_create(
            title=task_info['title'],
            project=task_info['project'],
            defaults={
                'description': task_info['description'],
                'assigned_to': task_info['assigned_to'],
                'status': task_info['status'],
                'deadline': task_info['deadline']
            }
        )
        if created:
            print(f"Seeded Task: {task.title}")

    # 4. Create Expenses
    expenses_data = [
        {
            'title': '50 Bags Organic Vermicompost',
            'project': projects[0], # Wheat
            'employee': employees[0], # Ramesh
            'amount': 7500.00,
            'description': 'Invoice VC-2026-98 purchased from Agro Fertilizers Ltd.'
        },
        {
            'title': 'Automated Humidity Controller Sensors',
            'project': projects[1], # Greenhouse
            'employee': employees[1], # Sunita
            'amount': 4200.00,
            'description': '3 sensor probes for greenhouse microclimate regulation.'
        },
        {
            'title': 'Tractor Diesel Refueling',
            'project': projects[0], # Wheat
            'employee': employees[2], # Vikram
            'amount': 1500.00,
            'description': '40 liters diesel fuel for field tilling.'
        },
    ]

    for exp_info in expenses_data:
        exp, created = Expense.objects.get_or_create(
            title=exp_info['title'],
            amount=exp_info['amount'],
            defaults={
                'project': exp_info['project'],
                'employee': exp_info['employee'],
                'description': exp_info['description']
            }
        )
        if created:
            print(f"Seeded Expense: {exp.title}")

    # 4b. Create Expense_day_wise (Daily/Category spends)
    from expenses.models import Expense_day_wise
    day_wise_data = [
        {'date': datetime.date(2026, 6, 25), 'category': 'monthexpences', 'amount': 8400.00, 'description': 'Monthly warehouse utility bills and internet.', 'user': admin_user},
        {'date': datetime.date(2026, 6, 24), 'category': 'transport', 'amount': 1200.00, 'description': 'Diesel refill for delivery van.', 'user': admin_user},
        {'date': datetime.date(2026, 6, 22), 'category': 'food', 'amount': 450.00, 'description': 'Lunch catering for field crew workers.', 'user': admin_user},
        {'date': datetime.date(2026, 5, 18), 'category': 'rent', 'amount': 15000.00, 'description': 'Monthly lease payment for greenhouse land.', 'user': admin_user},
        {'date': datetime.date(2026, 5, 10), 'category': 'shopping', 'amount': 2500.00, 'description': 'New security locks for warehouse gates.', 'user': admin_user},
        {'date': datetime.date(2026, 4, 15), 'category': 'other', 'amount': 950.05, 'description': 'Office stationary and folders.', 'user': admin_user},
    ]

    for dw_info in day_wise_data:
        dw_exp, created = Expense_day_wise.objects.get_or_create(
            date=dw_info['date'],
            category=dw_info['category'],
            amount=dw_info['amount'],
            user=dw_info['user'],
            defaults={'description': dw_info['description']}
        )
        if created:
            print(f"Seeded Day-Wise Expense: {dw_exp.category} - {dw_exp.amount}")

    # 5. Create Todos
    todos_data = [
        {
            'title': 'Inspect reservoir pump valves',
            'description': 'Verify check-valves are holding pressure on the main solar water reservoir supply.',
            'category': 'Maintenance',
            'priority': 'high',
            'is_completed': False,
            'created_by': admin_user
        },
        {
            'title': 'Verify bio-fertilizer supply quantity',
            'description': 'Check stock of organic compost bags in Warehouse 2 storage racks.',
            'category': 'Inventory',
            'priority': 'medium',
            'is_completed': True,
            'created_by': admin_user
        },
        {
            'title': 'Submit weekly weather analysis report',
            'description': 'Compile rainfall forecasts and humidity indices for upcoming seed sowing scheduling.',
            'category': 'Analysis',
            'priority': 'urgent',
            'is_completed': False,
            'created_by': admin_user
        },
    ]

    for todo_info in todos_data:
        todo, created = Todo.objects.get_or_create(
            title=todo_info['title'],
            defaults={
                'description': todo_info['description'],
                'category': todo_info['category'],
                'priority': todo_info['priority'],
                'is_completed': todo_info['is_completed'],
                'created_by': todo_info['created_by']
            }
        )
        if created:
            print(f"Seeded Todo: {todo.title}")

    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed()
