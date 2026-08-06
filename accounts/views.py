from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm


def signup_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('/')  # change if you have a dashboard URL
    else:
        form = UserCreationForm()

    return render(request, 'accounts/signup.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            login(request, form.get_user())
            return redirect('/')  # change if needed
    else:
        form = AuthenticationForm()

    return render(request, 'accounts/login.html', {'form': form})


def logout_view(request):
    logout(request)
    return redirect('/accounts/login/')


# API REST VIEWS FOR SESSION AUTHENTICATION
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user is not None:
        auth_login(request, user)
        return Response({
            "is_authenticated": True,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_superuser": user.is_superuser,
                "is_staff": user.is_staff
            }
        })
    return Response({"error": "Invalid username or password"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    auth_logout(request)
    return Response({"success": True})

@api_view(['GET'])
@permission_classes([AllowAny])
def session_api(request):
    if request.user.is_authenticated:
        return Response({
            "is_authenticated": True,
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "is_superuser": request.user.is_superuser,
                "is_staff": request.user.is_staff
            }
        })
    return Response({"is_authenticated": False})

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_api(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')
    if not username or not password:
        return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username is already taken"}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(username=username, password=password, email=email)
    auth_login(request, user)
    return Response({
        "is_authenticated": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_superuser": user.is_superuser,
            "is_staff": user.is_staff
        }
    }, status=status.HTTP_201_CREATED)

