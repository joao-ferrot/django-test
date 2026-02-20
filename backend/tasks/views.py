from django.shortcuts import render, redirect
from django.contrib.auth import authenticate
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Task 
from .serializers import TaskSerializer


@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
    return Response({'error': 'Credenciais inválidas'}, status=status.HTTP_401_UNAUTHORIZED)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

# Create your views here.

def task_page(request):
    if request.method == 'POST':
        title = request.POST.get('title')

        if title:
            Task.objects.create(title=title)
            
            return redirect('task_page')
    task=Task.objects.all().order_by('-created_at')
    return render(request, 'tasks/task_page.html', {'tasks': task})
    
def task_complete(request, task_id):
        task = Task.objects.get(id=task_id)
        task.completed = True
        task.save()
        return redirect('task_page')
    
def task_delete(request,task_id):
        task = Task.objects.get(id=task_id)
        task.delete()
        return redirect('task_page')
