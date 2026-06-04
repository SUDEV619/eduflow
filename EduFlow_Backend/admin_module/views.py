import csv
import io
import traceback
from django.db.models import Q, Count, Sum, Avg
from django.core.paginator import Paginator, EmptyPage
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import api_view, permission_classes

from accounts.models import CustomUser
from study_circles.models import StudyCircle, Report
from study_tracker.models import StudySession
from .models import (
    MockTest, Question, MockTestQuestion, 
    StudyMaterial, FavoriteMaterial,
    SystemSettings, RolePermission, APIKey
)
from .permissions import IsAdminUserRole
from .serializers import (
    QuestionSerializer, 
    MockTestCreateSerializer, 
    MockTestDetailSerializer,
    AdminUserListSerializer,
    AdminUserDetailSerializer,
    AdminUserStatusSerializer,
    AdminStudySessionSerializer,
    StudyMaterialSerializer,
    SystemSettingsSerializer,
    RolePermissionSerializer,
    APIKeySerializer
)
from study_circles.serializers import ReportSerializer

# ─────────────────────────────────────────
# Helper
# ─────────────────────────────────────────

ADMIN_PERMISSIONS = [permissions.IsAuthenticated, IsAdminUserRole]

def _error(message, http_status=status.HTTP_400_BAD_REQUEST):
    return Response({"status": "error", "message": message}, status=http_status)

# ─────────────────────────────────────────
# Dashboard & Analytics
# ─────────────────────────────────────────

class AdminDashboardStatsView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def get(self, request):
        try:
            now = timezone.now()
            last_7_days = now - timedelta(days=7)
            
            # 1. Overview Metrics
            total_users = CustomUser.objects.count()
            # Active today (logged in today)
            active_users = CustomUser.objects.filter(last_login__date=now.date()).count()
            
            total_study_minutes = StudySession.objects.aggregate(total=Sum('duration'))['total'] or 0
            total_study_hours = round(float(total_study_minutes) / 60, 1)
            
            total_circles = StudyCircle.objects.count()
            total_materials = StudyMaterial.objects.count()
            total_reports = Report.objects.count()

            # 2. Action Required (Alerts)
            # Latest 5 reports that haven't been resolved (assuming we might add resolved flag later, for now just recent)
            recent_reports = []
            reports_qs = Report.objects.select_related('reporter', 'circle').order_by('-created_at')[:5]
            for r in reports_qs:
                recent_reports.append({
                    "id": r.id,
                    "reporter": r.reporter.name if r.reporter else "Unknown",
                    "message": r.message,
                    "circle_name": r.circle.name if r.circle else "Deleted Circle",
                    "created_at": r.created_at
                })

            # 3. Materials Snapshot
            recent_materials = StudyMaterialSerializer(
                StudyMaterial.objects.order_by('-created_at')[:5], 
                many=True
            ).data
            
            trending_materials = StudyMaterialSerializer(
                StudyMaterial.objects.order_by('-download_count')[:5], 
                many=True
            ).data

            # 4. Study Circles Snapshot
            recent_circles = []
            circles_qs = StudyCircle.objects.order_by('-created_at')[:5]
            for c in circles_qs:
                recent_circles.append({
                    "id": c.id,
                    "name": c.name,
                    "members_count": c.members.count(),
                    "created_at": c.created_at
                })

            # 5. User Growth (Last 7 days)
            user_growth = CustomUser.objects.filter(date_joined__gte=last_7_days) \
                .annotate(day=TruncDate('date_joined')) \
                .values('day') \
                .annotate(count=Count('id')) \
                .order_by('day')

            return Response({
                "status": "success",
                "data": {
                    "overview": {
                        "total_users": total_users,
                        "active_users": active_users,
                        "total_study_hours": total_study_hours,
                        "total_circles": total_circles,
                        "total_materials": total_materials,
                        "total_reports": total_reports,
                    },
                    "alerts": {
                        "recent_reports": recent_reports,
                        "flagged_circles_count": Report.objects.values('circle').annotate(c=Count('id')).filter(c__gt=5).count()
                    },
                    "materials": {
                        "recent": recent_materials,
                        "trending": trending_materials
                    },
                    "circles": {
                        "recent": recent_circles
                    },
                    "user_growth": list(user_growth)
                }
            })
        except Exception as e:
            return _error(f"Dashboard error: {str(e)}", status.HTTP_500_INTERNAL_SERVER_ERROR)

from django.db.models.functions import TruncDate, TruncMonth, TruncHour
from django.utils import timezone
from datetime import timedelta

class AdminAnalyticsView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def get(self, request):
        try:
            now = timezone.now()
            last_30_days = now - timedelta(days=30)
            last_7_days = now - timedelta(days=7)

            # 1. Overview Summary
            total_users = CustomUser.objects.count()
            active_users_daily = CustomUser.objects.filter(last_login__date=now.date()).count()
            active_users_weekly = CustomUser.objects.filter(last_login__gte=last_7_days).count()
            
            total_study_minutes = StudySession.objects.aggregate(total=Sum('duration'))['total'] or 0
            total_study_hours = round(float(total_study_minutes) / 60, 1)
            
            avg_study_time_per_user = 0
            if total_users > 0:
                avg_study_time_per_user = round(total_study_hours / total_users, 1)

            from mock_tests.models import TestAttempt
            total_tests_attempted = TestAttempt.objects.count()
            avg_accuracy = TestAttempt.objects.aggregate(avg=Avg('score'))['avg'] or 0
            
            active_circles = StudyCircle.objects.filter(is_active=True).count()

            overview = {
                "total_users": total_users,
                "active_users_daily": active_users_daily,
                "active_users_weekly": active_users_weekly,
                "total_study_hours": total_study_hours,
                "avg_study_time_per_user": avg_study_time_per_user,
                "total_tests_attempted": total_tests_attempted,
                "avg_accuracy": round(float(avg_accuracy), 1),
                "active_circles": active_circles,
            }

            # 2. User Growth (Daily for last 30 days)
            user_growth = CustomUser.objects.filter(date_joined__gte=last_30_days) \
                .annotate(day=TruncDate('date_joined')) \
                .values('day') \
                .annotate(count=Count('id')) \
                .order_by('day')

            # 3. Study Activity Trends
            study_trends_raw = StudySession.objects.filter(created_at__gte=last_30_days) \
                .annotate(day=TruncDate('created_at')) \
                .values('day') \
                .annotate(hours=Sum('duration')) \
                .order_by('day')
            
            study_trends_list = []
            for item in study_trends_raw:
                study_trends_list.append({
                    "date": str(item['day']),
                    "hours": round(float(item['hours'] or 0) / 60, 1)
                })

            # 4. Subject-wise Analysis
            subject_analysis = StudySession.objects.values('subject') \
                .annotate(hours=Sum('duration'), count=Count('id')) \
                .order_by('-hours')
            
            subject_analysis_list = []
            for item in subject_analysis:
                subject_analysis_list.append({
                    "subject": item['subject'],
                    "hours": round(float(item['hours'] or 0) / 60, 1),
                    "count": item['count']
                })

            # 5. Mock Test Performance
            subject_accuracy = TestAttempt.objects.values('mock_test__subject') \
                .annotate(avg_score=Avg('score')) \
                .order_by('-avg_score')

            # 6. Peak Study Hours
            peak_hours = StudySession.objects.annotate(peak_hour=TruncHour('created_at')) \
                .values('peak_hour') \
                .annotate(count=Count('id')) \
                .order_by('peak_hour')

            # 7. Study Circle Activity
            circle_stats = {
                "total_circles": StudyCircle.objects.count(),
                "active_circles": active_circles,
                "total_reports": Report.objects.count(),
                "most_reported": [] # Safe default
            }
            
            try:
                # Attempt to get top reported circles
                circle_list_data = AdminStudyCircleListView().get(request).data
                if 'data' in circle_list_data:
                    circle_stats["most_reported"] = circle_list_data['data'][:5]
            except:
                pass

            # 8. Smart Insights
            insights = []
            if total_users > 0:
                insights.append(f"Platform has reached {total_users} registered users.")
            
            if len(subject_analysis_list) > 0:
                top_subject = subject_analysis_list[0]['subject'].replace('_', ' ').title()
                insights.append(f"'{top_subject}' is currently the most studied subject.")

            if total_tests_attempted > 100:
                insights.append(f"High engagement with {total_tests_attempted} mock test attempts.")

            return Response({
                "status": "success",
                "data": {
                    "overview": overview,
                    "user_growth": list(user_growth),
                    "study_trends": study_trends_list,
                    "subject_analysis": subject_analysis_list,
                    "subject_accuracy": list(subject_accuracy),
                    "peak_hours": list(peak_hours),
                    "circle_stats": circle_stats,
                    "insights": insights
                }
            })
        except Exception as e:
            print(f"ANALYTICS ERROR: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Server processing error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ─────────────────────────────────────────
# User Management
# ─────────────────────────────────────────

class AdminUserListView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def get(self, request):
        search = request.query_params.get('search', '')
        status_filter = request.query_params.get('status', 'all')
        page_number = request.query_params.get('page', 1)

        users = CustomUser.objects.all().order_by('-date_joined')

        if search:
            users = users.filter(Q(name__icontains=search) | Q(email__icontains=search))
        
        if status_filter == 'active':
            users = users.filter(is_active=True)
        elif status_filter == 'inactive':
            users = users.filter(is_active=False)

        paginator = Paginator(users, 10)  # 10 users per page
        try:
            page_obj = paginator.page(page_number)
        except EmptyPage:
            return Response({
                "status": "success",
                "data": [],
                "pagination": {
                    "page": int(page_number),
                    "total_pages": paginator.num_pages,
                    "count": paginator.count
                }
            })

        serializer = AdminUserListSerializer(page_obj.object_list, many=True)
        
        return Response({
            "status": "success",
            "data": serializer.data,
            "pagination": {
                "page": page_obj.number,
                "total_pages": paginator.num_pages,
                "count": paginator.count
            }
        })

class AdminUserDetailView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def get_object(self, pk):
        try:
            return CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return _error("User not found", status.HTTP_404_NOT_FOUND)
        serializer = AdminUserDetailSerializer(user)
        return Response({
            "status": "success",
            "data": serializer.data
        })

    def put(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return _error("User not found", status.HTTP_404_NOT_FOUND)
        serializer = AdminUserDetailSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "data": serializer.data
            })
        return _error(serializer.errors)

    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return _error("User not found", status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response({
            "status": "success",
            "message": "User deleted successfully"
        })

class AdminUserStatusView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def patch(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
            is_active = request.data.get('is_active')
            if is_active is not None:
                user.is_active = is_active
                user.save()
                status_str = "activated" if user.is_active else "deactivated"
                return Response({
                    "status": "success", 
                    "message": f"User {status_str} successfully",
                    "is_active": user.is_active
                })
            return _error("is_active field is required")
        except CustomUser.DoesNotExist:
            return _error("User not found", status.HTTP_404_NOT_FOUND)

# ─────────────────────────────────────────
# Question Bank APIs
# ─────────────────────────────────────────

class AdminQuestionListView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def get(self, request):
        subject = request.query_params.get('subject')
        subjects_str = request.query_params.get('subjects')
        difficulty = request.query_params.get('difficulty')
        search = request.query_params.get('search')
        page_number = request.query_params.get('page', 1)

        questions = Question.objects.all().order_by('-created_at')

        if subject:
            questions = questions.filter(subject__iexact=subject)
        elif subjects_str:
            subject_list = [s.strip() for s in subjects_str.split(',') if s.strip()]
            if subject_list:
                questions = questions.filter(subject__in=subject_list)
        
        if difficulty:
            questions = questions.filter(difficulty__iexact=difficulty)
        if search:
            questions = questions.filter(text__icontains=search)

        paginator = Paginator(questions, 10)  # 10 questions per page
        try:
            page_obj = paginator.page(page_number)
        except EmptyPage:
            return Response({
                "status": "success",
                "data": [],
                "pagination": {
                    "page": int(page_number),
                    "total_pages": paginator.num_pages,
                    "count": paginator.count
                }
            })

        serializer = QuestionSerializer(page_obj.object_list, many=True)
        return Response({
            "status": "success",
            "data": serializer.data,
            "pagination": {
                "page": page_obj.number,
                "total_pages": paginator.num_pages,
                "count": page_obj.paginator.count
            }
        })

    def post(self, request):
        serializer = QuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "data": serializer.data,
                "message": "Question added successfully"
            }, status=status.HTTP_201_CREATED)
        return _error(serializer.errors)

class AdminQuestionDetailView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def get_object(self, pk):
        try:
            return Question.objects.get(pk=pk)
        except Question.DoesNotExist:
            return None

    def get(self, request, pk):
        question = self.get_object(pk)
        if not question:
            return _error("Question not found", status.HTTP_404_NOT_FOUND)
        serializer = QuestionSerializer(question)
        return Response({
            "status": "success",
            "data": serializer.data
        })

    def put(self, request, pk):
        question = self.get_object(pk)
        if not question:
            return _error("Question not found", status.HTTP_404_NOT_FOUND)
        
        serializer = QuestionSerializer(question, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "data": serializer.data
            })
        return _error(serializer.errors)

    def delete(self, request, pk):
        question = self.get_object(pk)
        if not question:
            return _error("Question not found", status.HTTP_404_NOT_FOUND)
        
        question.delete()
        return Response({
            "status": "success",
            "message": "Question deleted successfully"
        })

class AdminQuestionBulkDeleteView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def post(self, request):
        question_ids = request.data.get('question_ids', [])
        if not isinstance(question_ids, list) or not question_ids:
            return _error("question_ids must be a non-empty list")

        try:
            questions = Question.objects.filter(id__in=question_ids)
            deleted_count = questions.count()
            
            # Optional: Check if any questions are used in mock tests
            # if MockTestQuestion.objects.filter(question__in=questions).exists():
            #     return _error("Some questions are assigned to mock tests and cannot be deleted.")

            questions.delete()
            
            return Response({
                "status": "success",
                "message": f"Successfully deleted {deleted_count} questions",
                "deleted_count": deleted_count
            })
        except Exception as e:
            return _error(f"Error during bulk deletion: {str(e)}")

# ─────────────────────────────────────────
# CSV Upload API
# ─────────────────────────────────────────

class AdminQuestionCSVUploadView(APIView):
    permission_classes = ADMIN_PERMISSIONS
    parser_classes = [MultiPartParser]

    def post(self, request):
        try:
            if 'file' not in request.FILES:
                return _error("No file uploaded")
            
            csv_file = request.FILES['file']
            if not csv_file.name.endswith('.csv'):
                return _error("Invalid file format. Please upload a CSV")

            try:
                # Use utf-8-sig to handle Byte Order Mark (BOM) from Excel CSVs
                decoded_file = csv_file.read().decode('utf-8-sig')
                io_string = io.StringIO(decoded_file)
                
                # Normalize headers: strip spaces, lowercase, and replace spaces with underscores
                raw_reader = csv.reader(io_string)
                try:
                    headers = next(raw_reader)
                except StopIteration:
                    return _error("CSV file is empty")
                    
                normalized_headers = [h.strip().lower().replace(' ', '_') for h in headers]
                
                required_headers = ['question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'subject', 'topic', 'difficulty', 'marks']
                missing_headers = [h for h in required_headers if h not in normalized_headers]
                if missing_headers:
                    return _error(f"Invalid CSV format. Missing columns: {', '.join(missing_headers)}")

                # Create DictReader and use it to consume the rest of the io_string
                reader = csv.DictReader(io_string, fieldnames=normalized_headers)
            except Exception as e:
                return _error(f"Failed to parse CSV structure: {str(e)}")

            questions_to_create = []
            failed_rows = []
            
            valid_options = ['A', 'B', 'C', 'D']
            valid_difficulties = ['Easy', 'Medium', 'Hard']
            valid_subjects = [choice[0] for choice in Question.SUBJECT_CHOICES]

            for row_index, row in enumerate(reader, start=1):
                try:
                    errors = []
                    
                    # Simple non-empty validation
                    required_fields = ['question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'subject', 'topic', 'difficulty', 'marks']
                    for field in required_fields:
                        if not row.get(field) or str(row.get(field)).strip() == '':
                            errors.append(f"Missing {field}")
                    
                    if errors:
                        failed_rows.append({"row": row_index, "error": "; ".join(errors)})
                        continue

                    # Data normalization & validation
                    correct = row['correct_option'].strip().upper()
                    if correct not in valid_options:
                        errors.append(f"Invalid correct_option {correct}")
                    
                    diff = row['difficulty'].strip().capitalize()
                    if diff not in valid_difficulties:
                        errors.append(f"Invalid difficulty {diff}")
                    
                    subject = row['subject'].strip().lower()
                    if subject not in valid_subjects:
                        errors.append(f"Invalid subject {subject}")

                    try:
                        marks = int(row['marks'])
                    except (ValueError, TypeError):
                        errors.append(f"Invalid marks value: {row['marks']}")

                    # Length validation for options (max 255)
                    for opt_field in ['option_a', 'option_b', 'option_c', 'option_d']:
                        if len(row[opt_field]) > 255:
                            errors.append(f"{opt_field} exceeds 255 characters")

                    if errors:
                        failed_rows.append({"row": row_index, "error": "; ".join(errors)})
                        continue

                    questions_to_create.append(Question(
                        text=row['question'],
                        option_a=row['option_a'],
                        option_b=row['option_b'],
                        option_c=row['option_c'],
                        option_d=row['option_d'],
                        correct_option=correct,
                        subject=row['subject'],
                        topic=row['topic'],
                        difficulty=diff,
                        marks=marks,
                        explanation=row.get('explanation', '')
                    ))
                except Exception as e:
                    failed_rows.append({"row": row_index, "error": f"Unexpected error: {str(e)}"})

            if questions_to_create:
                try:
                    Question.objects.bulk_create(questions_to_create)
                except Exception as e:
                    return _error(f"Database error during bulk create: {str(e)}")

            return Response({
                "status": "success",
                "data": {
                    "success_count": len(questions_to_create),
                    "failed_rows": failed_rows
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return _error(f"Server error during upload: {str(e)}", status.HTTP_500_INTERNAL_SERVER_ERROR)

# ─────────────────────────────────────────
# Mock Test APIs
# ─────────────────────────────────────────

class AdminMockTestListCreateView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def get(self, request):
        exam_type = request.query_params.get('exam_type')
        subject = request.query_params.get('subject')
        subjects_str = request.query_params.get('subjects')
        search = request.query_params.get('search')

        tests = MockTest.objects.all().order_by('-created_at')

        if exam_type:
            tests = tests.filter(exam_type=exam_type)
        if subject:
            tests = tests.filter(subject=subject)
        elif subjects_str:
            subject_list = [s.strip() for s in subjects_str.split(',') if s.strip()]
            if subject_list:
                tests = tests.filter(subject__in=subject_list)
        if search:
            tests = tests.filter(Q(title__icontains=search) | Q(description__icontains=search))

        serializer = MockTestCreateSerializer(tests, many=True)
        return Response({
            "status": "success",
            "data": serializer.data
        })

    def post(self, request):
        serializer = MockTestCreateSerializer(data=request.data)
        if serializer.is_valid():
            test = serializer.save()
            return Response({
                "status": "success",
                "data": serializer.data,
                "message": "Mock test created successfully"
            }, status=status.HTTP_201_CREATED)
        return _error(serializer.errors)

class AdminMockTestDetailView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def get(self, request, pk):
        try:
            test = MockTest.objects.get(pk=pk)
        except MockTest.DoesNotExist:
            return _error("Mock test not found", status.HTTP_404_NOT_FOUND)
        
        questions = test.questions.all()
        total_marks = questions.aggregate(Sum('marks'))['marks__sum'] or 0

        # Use serializer for consistent data structure
        test_data = MockTestCreateSerializer(test).data
        test_data['total_marks'] = total_marks
        
        question_data = QuestionSerializer(questions, many=True).data

        return Response({
            "status": "success",
            "data": {
                "test": test_data,
                "questions": question_data,
                "total_marks": total_marks
            }
        })

    def patch(self, request, pk):
        try:
            test = MockTest.objects.get(pk=pk)
        except MockTest.DoesNotExist:
            return _error("Mock test not found", status.HTTP_404_NOT_FOUND)
        
        serializer = MockTestCreateSerializer(test, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                test = serializer.save()
                status_str = "published" if test.is_published else "unpublished"
                return Response({
                    "status": "success",
                    "message": f"Mock test {status_str} successfully",
                    "data": MockTestCreateSerializer(test).data
                })
            except Exception as e:
                return _error(f"Database error while saving: {str(e)}")
        
        return _error(serializer.errors)

    def delete(self, request, pk):
        try:
            test = MockTest.objects.get(pk=pk)
        except MockTest.DoesNotExist:
            return _error("Mock test not found", status.HTTP_404_NOT_FOUND)
        
        test.delete()
        return Response({
            "status": "success",
            "message": "Mock test deleted successfully"
        })

class AdminMockTestAddQuestionsView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def post(self, request, pk):
        try:
            test = MockTest.objects.get(pk=pk)
        except MockTest.DoesNotExist:
            return _error("Mock test not found", status.HTTP_404_NOT_FOUND)
        
        question_ids = request.data.get('question_ids', [])
        if not isinstance(question_ids, list):
            return _error("question_ids must be a list")

        added_count = 0
        for q_id in question_ids:
            try:
                question = Question.objects.get(pk=q_id)
                if not MockTestQuestion.objects.filter(mock_test=test, question=question).exists():
                    MockTestQuestion.objects.create(mock_test=test, question=question)
                    added_count += 1
            except Question.DoesNotExist:
                continue
        
        return Response({
            "status": "success",
            "data": {
                "message": f"Successfully added {added_count} questions",
                "total_questions": test.questions.count()
            }
        })

class AdminMockTestBulkAddQuestionsView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def post(self, request, pk):
        try:
            mock_test = MockTest.objects.get(pk=pk)
        except MockTest.DoesNotExist:
            return _error("Mock test not found", status.HTTP_404_NOT_FOUND)

        ids = request.data.get("question_ids", [])
        if not isinstance(ids, list):
            return _error("question_ids must be a list")

        questions = Question.objects.filter(id__in=ids)
        added_count = 0
        
        for q in questions:
            if not MockTestQuestion.objects.filter(mock_test=mock_test, question=q).exists():
                MockTestQuestion.objects.create(mock_test=mock_test, question=q)
                added_count += 1

        return Response({
            "status": "success",
            "message": f"Successfully added {added_count} questions",
            "total_questions": mock_test.questions.count()
        })

class AdminMockTestSetQuestionsView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def post(self, request, pk):
        try:
            mock_test = MockTest.objects.get(pk=pk)
        except MockTest.DoesNotExist:
            return _error("Mock test not found", status.HTTP_404_NOT_FOUND)

        ids = request.data.get("question_ids", [])
        if not isinstance(ids, list):
            return _error("question_ids must be a list")

        # Clear existing questions
        MockTestQuestion.objects.filter(mock_test=mock_test).delete()

        # Add new questions
        questions = Question.objects.filter(id__in=ids)
        for q in questions:
            MockTestQuestion.objects.create(mock_test=mock_test, question=q)

        return Response({
            "status": "success",
            "message": f"Successfully set {questions.count()} questions",
            "total_questions": mock_test.questions.count()
        })

# ─────────────────────────────────────────
# Study Sessions
# ─────────────────────────────────────────

class AdminStudySessionListView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def get(self, request):
        sessions = StudySession.objects.all().order_by('-created_at')
        
        # Optional filtering
        user_id = request.query_params.get('user_id')
        if user_id:
            sessions = sessions.filter(user_id=user_id)
            
        paginator = Paginator(sessions, 20)
        page_number = request.query_params.get('page', 1)
        try:
            page_obj = paginator.page(page_number)
        except EmptyPage:
            return Response({"status": "success", "data": [], "pagination": {}})

        serializer = AdminStudySessionSerializer(page_obj.object_list, many=True)
        return Response({
            "status": "success",
            "data": serializer.data,
            "pagination": {
                "page": page_obj.number,
                "total_pages": paginator.num_pages,
                "count": paginator.count
            }
        })

# ─────────────────────────────────────────
# Study Circle Management
# ─────────────────────────────────────────

class AdminStudyCircleListView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def get(self, request):
        status_filter = request.query_params.get('status', 'all')
        search = request.query_params.get('search', '')
        sort_reports = request.query_params.get('sort_reports', 'false')
        
        circles = StudyCircle.objects.all().order_by('-created_at')
        
        if search:
            circles = circles.filter(
                Q(name__icontains=search) | 
                Q(created_by__email__icontains=search) |
                Q(created_by__name__icontains=search)
            )
            
        if status_filter == 'active':
            circles = circles.filter(is_active=True)
        elif status_filter == 'disabled':
            circles = circles.filter(is_active=False)

        data = []
        for c in circles:
            try:
                # Count unique users who reported this circle
                report_count = Report.objects.filter(circle=c, report_type="circle").values("reporter").distinct().count()
                
                data.append({
                    "id": c.id,
                    "name": c.name,
                    "creator": c.created_by.name if c.created_by else "Unknown",
                    "creator_email": c.created_by.email if c.created_by else "Unknown",
                    "members": c.members.count(),
                    "members_count": c.members.count(), # Backward compatibility for frontend if needed
                    "created_at": c.created_at,
                    "status": "Active" if c.is_active else "Disabled",
                    "is_active": c.is_active,
                    "reports": report_count,
                    "reports_count": report_count, # Backward compatibility
                })
            except Exception as e:
                print(f"ERROR processing circle {c.id}: {str(e)}")

        # Sort by reports if requested
        if sort_reports == 'true' or request.query_params.get('sort') == 'reports':
            data = sorted(data, key=lambda x: x['reports'], reverse=True)

        return Response({
            "status": "success",
            "data": data
        })

class AdminStudyCircleDetailView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def get(self, request, pk):
        circle = get_object_or_404(StudyCircle, pk=pk)
        reports = Report.objects.filter(circle=circle, report_type="circle").order_by('-created_at')
        
        members_data = [{
            "id": m.id,
            "name": m.name,
            "email": m.email
        } for m in circle.members.all()]

        return Response({
            "status": "success",
            "data": {
                "id": circle.id,
                "name": circle.name,
                "description": circle.description,
                "subject": circle.subject,
                "creator": {
                    "name": circle.created_by.name,
                    "email": circle.created_by.email
                },
                "is_active": circle.is_active,
                "is_private": circle.is_private,
                "created_at": circle.created_at,
                "members": members_data,
                "reports": ReportSerializer(reports, many=True).data
            }
        })

    def patch(self, request, pk):
        circle = get_object_or_404(StudyCircle, pk=pk)
        is_active = request.data.get('is_active')
        if is_active is not None:
            circle.is_active = is_active
            circle.save()
            return Response({
                "status": "success",
                "message": f"Circle {'activated' if is_active else 'disabled'} successfully",
                "is_active": circle.is_active
            })
        return _error("is_active field is required")

    def post(self, request, pk):
        # Allow POST to /circles/<id>/ to toggle status as per some patterns
        circle = get_object_or_404(StudyCircle, pk=pk)
        circle.is_active = not circle.is_active
        circle.save()
        return Response({
            "status": "success",
            "message": f"Circle {'activated' if circle.is_active else 'disabled'} successfully",
            "is_active": circle.is_active
        })

    def delete(self, request, pk):
        circle = get_object_or_404(StudyCircle, pk=pk)
        circle.delete()
        return Response({
            "status": "success",
            "message": "Study circle deleted permanently"
        })

# ─────────────────────────────────────────
# Study Materials Management
# ─────────────────────────────────────────

class AdminStudyMaterialListCreateView(APIView):
    permission_classes = ADMIN_PERMISSIONS
    parser_classes = [MultiPartParser]

    def get(self, request):
        subject = request.query_params.get('subject')
        search = request.query_params.get('search')
        
        materials = StudyMaterial.objects.all().order_by('-created_at')
        
        if subject:
            materials = materials.filter(subject=subject)
        if search:
            materials = materials.filter(Q(title__icontains=search) | Q(description__icontains=search) | Q(tags__icontains=search))
            
        serializer = StudyMaterialSerializer(materials, many=True)
        return Response({
            "status": "success",
            "data": serializer.data
        })

    def post(self, request):
        serializer = StudyMaterialSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            return Response({
                "status": "success",
                "message": "Study material uploaded successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return _error(serializer.errors)

class AdminStudyMaterialDetailView(APIView):
    permission_classes = ADMIN_PERMISSIONS
    parser_classes = [MultiPartParser]

    def get_object(self, pk):
        try:
            return StudyMaterial.objects.get(pk=pk)
        except StudyMaterial.DoesNotExist:
            return None

    def get(self, request, pk):
        material = self.get_object(pk)
        if not material:
            return _error("Study material not found", status.HTTP_404_NOT_FOUND)
        serializer = StudyMaterialSerializer(material)
        return Response({
            "status": "success",
            "data": serializer.data
        })

    def put(self, request, pk):
        material = self.get_object(pk)
        if not material:
            return _error("Study material not found", status.HTTP_404_NOT_FOUND)
        
        serializer = StudyMaterialSerializer(material, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "message": "Study material updated successfully",
                "data": serializer.data
            })
        return _error(serializer.errors)

    def delete(self, request, pk):
        material = self.get_object(pk)
        if not material:
            return _error("Study material not found", status.HTTP_404_NOT_FOUND)
        
        material.delete()
        return Response({
            "status": "success",
            "message": "Study material deleted successfully"
        })

# ─────────────────────────────────────────
# User Side Study Materials
# ─────────────────────────────────────────

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_materials(request):
    subject = request.GET.get('subject')
    search = request.GET.get('search')
    tab = request.GET.get('tab', 'all') # all, trending, recent, favorites

    materials = StudyMaterial.objects.all()

    if subject and subject != 'all':
        materials = materials.filter(subject=subject)

    if search:
        materials = materials.filter(Q(title__icontains=search) | Q(description__icontains=search) | Q(tags__icontains=search))

    if tab == 'trending':
        materials = materials.order_by('-download_count')[:15]
    elif tab == 'recent':
        materials = materials.order_by('-created_at')[:15]
    elif tab == 'favorites':
        fav_ids = FavoriteMaterial.objects.filter(user=request.user).values_list('material_id', flat=True)
        materials = materials.filter(id__in=fav_ids).order_by('-created_at')
    else:
        materials = materials.order_by('-created_at')

    # Add favorite status
    user_favs = FavoriteMaterial.objects.filter(user=request.user).values_list('material_id', flat=True)
    
    data = []
    for m in materials:
        data.append({
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "subject": m.subject,
            "subject_display": m.get_subject_display(),
            "tags": m.tags,
            "file": m.file.url if m.file else None,
            "downloads": m.download_count,
            "is_favorite": m.id in user_favs,
            "created_at": m.created_at
        })

    return Response({"status": "success", "data": data})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def download_material(request, id):
    material = get_object_or_404(StudyMaterial, id=id)
    material.download_count += 1
    material.save()
    return Response({"status": "success", "file": material.file.url})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_favorite(request, id):
    material = get_object_or_404(StudyMaterial, id=id)
    fav, created = FavoriteMaterial.objects.get_or_create(user=request.user, material=material)
    
    if not created:
        fav.delete()
        return Response({"status": "success", "action": "removed"})
    
    return Response({"status": "success", "action": "added"})

# ─────────────────────────────────────────
# Admin System Settings
# ─────────────────────────────────────────

class AdminSettingsView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def get(self, request):
        settings = SystemSettings.get_settings()
        serializer = SystemSettingsSerializer(settings)
        return Response({
            "status": "success",
            "data": serializer.data
        })

class AdminUpdateSettingsView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def post(self, request):
        settings = SystemSettings.get_settings()
        serializer = SystemSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "message": "System settings updated successfully",
                "data": serializer.data
            })
        return _error(serializer.errors)

class AdminRolePermissionListView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def get(self, request):
        permissions = RolePermission.objects.all()
        serializer = RolePermissionSerializer(permissions, many=True)
        return Response({
            "status": "success",
            "data": serializer.data
        })

    def post(self, request):
        role = request.data.get('role')
        if not role:
            return _error("Role name is required")
        
        perm, created = RolePermission.objects.get_or_create(role=role)
        serializer = RolePermissionSerializer(perm, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "message": f"Permissions for role '{role}' updated",
                "data": serializer.data
            })
        return _error(serializer.errors)

class AdminAPIKeyListView(APIView):
    permission_classes = ADMIN_PERMISSIONS

    def get(self, request):
        keys = APIKey.objects.all()
        serializer = APIKeySerializer(keys, many=True)
        return Response({
            "status": "success",
            "data": serializer.data
        })

    def post(self, request):
        import secrets
        import string
        
        name = request.data.get('name', 'New API Key')
        new_key = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(40))
        
        api_key = APIKey.objects.create(name=name, key=new_key)
        serializer = APIKeySerializer(api_key)
        return Response({
            "status": "success",
            "message": "API key generated successfully",
            "data": serializer.data
        })

    def patch(self, request, pk):
        api_key = get_object_or_404(APIKey, pk=pk)
        is_active = request.data.get('is_active')
        if is_active is not None:
            api_key.is_active = is_active
            api_key.save()
            return Response({
                "status": "success",
                "message": f"API key {'activated' if is_active else 'deactivated'}"
            })
        return _error("is_active field is required")

    def delete(self, request, pk):
        api_key = get_object_or_404(APIKey, pk=pk)
        api_key.delete()
        return Response({
            "status": "success",
            "message": "API key deleted permanently"
        })
