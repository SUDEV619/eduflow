from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import models
from .models import TestAttempt, AttemptAnswer # Keep these for now
from .serializers import TestAttemptSerializer
from admin_module.models import MockTest, Question # Use admin models
from admin_module.serializers import UserMockTestSerializer
from notifications.utils import create_notification

class MockTestListView(generics.ListAPIView):
    serializer_class = UserMockTestSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        exam_type = self.request.query_params.get('exam_type')
        subject = self.request.query_params.get('subject')
        search = self.request.query_params.get('search')

        # Return only published tests that have at least one question
        queryset = MockTest.objects.filter(is_published=True).annotate(
            q_count=models.Count('questions')
        ).filter(q_count__gt=0).order_by('-created_at')

        if exam_type:
            queryset = queryset.filter(exam_type=exam_type)
        if subject:
            queryset = queryset.filter(subject=subject)
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(description__icontains=search))
            
        return queryset

class MockTestDetailView(generics.RetrieveAPIView):
    queryset = MockTest.objects.filter(is_published=True)
    serializer_class = UserMockTestSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'id'

class StartAttemptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # pk is MockTest ID (string)
        mock_test = get_object_or_404(MockTest, pk=pk)
        
        attempt = TestAttempt.objects.create(
            user=request.user, 
            mock_test=mock_test,
            started_at=timezone.now()
        )
        serializer = TestAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class SubmitAttemptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # pk is the Attempt ID (integer)
        attempt = get_object_or_404(TestAttempt, pk=pk, user=request.user)
        
        if attempt.submitted_at:
             return Response({"error": "Attempt already submitted"}, status=status.HTTP_400_BAD_REQUEST)
        
        attempt.submitted_at = timezone.now()
        
        # Expecting answers as { question_id: option_index }
        answers_data = request.data.get('answers', {})
        
        mock_test = attempt.mock_test
        questions = mock_test.questions.all()
        
        score = 0.0
        
        # Create AttemptAnswer records
        attempt.answers.all().delete()
        
        # In the admin Question model, correct_option is 'A', 'B', 'C', or 'D'
        option_map = ['A', 'B', 'C', 'D']

        for q in questions:
            option_idx = answers_data.get(str(q.id))
            
            selected_option_str = None
            is_correct = False
            
            if option_idx is not None and isinstance(option_idx, int):
                if 0 <= option_idx < 4:
                    selected_option_str = option_map[option_idx]
                    is_correct = (selected_option_str == q.correct_option)
            
            AttemptAnswer.objects.create(
                attempt=attempt,
                question=q,
                selected_option_str=selected_option_str
            )
            
            if is_correct:
                score += q.marks
        
        attempt.score = score
        attempt.save()

        # Create notification
        create_notification(
            request.user,
            "Mock Test Completed",
            f"You have completed '{mock_test.title}' with a score of {score}.",
            "mock"
        )
        
        serializer = TestAttemptSerializer(attempt)
        return Response(serializer.data)

class UserAttemptsView(generics.ListAPIView):
    serializer_class = TestAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TestAttempt.objects.filter(user=self.request.user).order_by('-started_at')
