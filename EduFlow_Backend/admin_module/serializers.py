from rest_framework import serializers
from accounts.models import CustomUser
from study_tracker.models import StudySession
from .models import MockTest, Question, MockTestQuestion, StudyMaterial, SystemSettings, RolePermission, APIKey

# ─────────────────────────────────────────
# Question Serializer
# ─────────────────────────────────────────

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

    def validate_subject(self, value):
        if not value:
            raise serializers.ValidationError("Subject is required.")
        valid_subjects = [choice[0] for choice in Question.SUBJECT_CHOICES]
        if value not in valid_subjects:
            raise serializers.ValidationError(f"Invalid subject. Must be one of: {', '.join(valid_subjects)}")
        return value

# ─────────────────────────────────────────
# Study Material Serializer
# ─────────────────────────────────────────

class StudyMaterialSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.name', read_only=True)
    subject_display = serializers.CharField(source='get_subject_display', read_only=True)

    class Meta:
        model = StudyMaterial
        fields = [
            'id', 'title', 'description', 'subject', 'subject_display', 
            'tags', 'file', 'uploaded_by', 'uploaded_by_name', 
            'created_at', 'download_count'
        ]
        read_only_fields = ['uploaded_by', 'download_count', 'created_at']

# ─────────────────────────────────────────
# Mock Test Serializers
# ─────────────────────────────────────────

class MockTestCreateSerializer(serializers.ModelSerializer):
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = MockTest
        fields = ['id', 'title', 'description', 'duration', 'exam_type', 'subject', 'difficulty', 'is_published', 'question_count']

    def get_question_count(self, obj):
        return obj.questions.count()

class MockTestDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = MockTest
        fields = ['id', 'title', 'description', 'duration', 'exam_type', 'subject', 'difficulty', 'is_published', 'questions']

# ─────────────────────────────────────────
# Study Session Serializer
# ─────────────────────────────────────────

class AdminStudySessionSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    subject_display = serializers.CharField(source='get_subject_display', read_only=True)

    class Meta:
        model = StudySession
        fields = ['id', 'user_email', 'user_name', 'subject', 'subject_display', 'duration', 'session_type', 'date', 'created_at']

# ─────────────────────────────────────────
# User Mock Test Serializers (for frontend)
# ─────────────────────────────────────────

class UserMockTestSerializer(serializers.ModelSerializer):
    durationMinutes = serializers.IntegerField(source='duration')
    marking = serializers.SerializerMethodField()
    questions = serializers.SerializerMethodField()

    class Meta:
        model = MockTest
        fields = ['id', 'title', 'description', 'durationMinutes', 'exam_type', 'subject', 'difficulty', 'marking', 'questions']

    def get_marking(self, obj):
        return {
            'correctPoints': 1, # Default
            'incorrectPoints': 0,
            'unansweredPoints': 0
        }

    def get_questions(self, obj):
        questions = obj.questions.all()
        result = []
        for q in questions:
            # Map 'A', 'B', 'C', 'D' to 0, 1, 2, 3
            correct_idx = -1
            if q.correct_option and q.correct_option.strip().upper() in ['A', 'B', 'C', 'D']:
                correct_idx = ord(q.correct_option.strip().upper()) - ord('A')
            
            result.append({
                'id': str(q.id),
                'prompt': q.text,
                'explanation': q.explanation or "",
                'options': [
                    {'label': q.option_a},
                    {'label': q.option_b},
                    {'label': q.option_c},
                    {'label': q.option_d}
                ],
                'correctOptionIndex': correct_idx
            })
        return result

# ─────────────────────────────────────────
# System Settings
# ─────────────────────────────────────────

class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = '__all__'

class RolePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RolePermission
        fields = '__all__'

class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = '__all__'
        read_only_fields = ['created_at']

# ─────────────────────────────────────────
# User Management (Existing)
# ─────────────────────────────────────────

class AdminUserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email', 'role', 'is_active', 'date_joined']

class AdminUserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email', 'role', 'is_active', 'is_staff', 'date_joined']

class AdminUserStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'is_active']
