from rest_framework import serializers
from .models import TestAttempt, AttemptAnswer
from admin_module.models import MockTest, Question

class AttemptAnswerSerializer(serializers.ModelSerializer):
    question_id = serializers.PrimaryKeyRelatedField(source='question', read_only=True)
    selected_option_index = serializers.SerializerMethodField()

    class Meta:
        model = AttemptAnswer
        fields = ['question_id', 'selected_option_index']

    def get_selected_option_index(self, obj):
        if not obj.selected_option_str:
            return None
        
        option_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3}
        return option_map.get(obj.selected_option_str)

class TestAttemptSerializer(serializers.ModelSerializer):
    answers = serializers.SerializerMethodField()
    mock_test_title = serializers.CharField(source='mock_test.title', read_only=True)
    
    class Meta:
        model = TestAttempt
        fields = ['id', 'user', 'mock_test', 'mock_test_title', 'started_at', 'submitted_at', 'score', 'answers']
    
    def get_answers(self, obj):
        # Return as a dictionary { question_id: option_index } to match frontend expectation
        result = {}
        option_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3}
        for ans in obj.answers.all():
            if ans.selected_option_str:
                result[str(ans.question.id)] = option_map.get(ans.selected_option_str)
        return result
