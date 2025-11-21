from django.shortcuts import render
from main.models import Project, Ticket
from main.serializers import ProjectSerializer, TicketSerializer
from rest_framework import APIView


class ProjectList(APIView):
    def get(self, request):
        projects = Project.objects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)


class TicketList(APIView):
    def get(self, request):
        tickets = Ticket.objects.all()
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data)
        
                

# Create your views here.
