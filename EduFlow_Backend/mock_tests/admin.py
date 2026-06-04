from django.contrib import admin
from .models import MockTest, Question, Option, TestAttempt, AttemptAnswer

class OptionInline(admin.TabularInline):
    model = Option
    extra = 4

class QuestionAdmin(admin.ModelAdmin):
    inlines = [OptionInline]
    list_display = ('prompt', 'mock_test', 'order')
    list_filter = ('mock_test',)

class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1

class MockTestAdmin(admin.ModelAdmin):
    inlines = [QuestionInline]
    list_display = ('title', 'difficulty', 'duration_minutes', 'created_at')
    list_filter = ('difficulty', 'created_at')
    search_fields = ('title', 'description')

class AttemptAnswerInline(admin.TabularInline):
    model = AttemptAnswer
    readonly_fields = ('question', 'selected_option_str')
    can_delete = False
    extra = 0

class TestAttemptAdmin(admin.ModelAdmin):
    inlines = [AttemptAnswerInline]
    list_display = ('user', 'mock_test', 'started_at', 'submitted_at', 'score')
    list_filter = ('mock_test', 'submitted_at')
    readonly_fields = ('started_at', 'submitted_at', 'score')

admin.site.register(MockTest, MockTestAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(TestAttempt, TestAttemptAdmin)
