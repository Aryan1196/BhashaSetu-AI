from django.db import models

class LessonRecord(models.Model):
    title = models.CharField(max_length=255, default="Lesson")
    grade = models.CharField(max_length=50, default="Class 3")
    subject = models.CharField(max_length=100, default="Science")
    source_lang = models.CharField(max_length=50, default="English")
    target_lang = models.CharField(max_length=50, default="Odia")
    transcript = models.TextField(default="", blank=True)
    direct_translation = models.TextField(default="", blank=True)
    pedagogical_adaptation = models.TextField(default="", blank=True)
    key_points = models.JSONField(default=list, blank=True)
    example = models.TextField(default="", blank=True)
    learner_question = models.TextField(default="", blank=True)
    qa_history = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "lessons"

class CurriculumDoc(models.Model):
    name = models.CharField(max_length=255)
    grade = models.CharField(max_length=50, default="Class 3")
    subject = models.CharField(max_length=100, default="Science")
    lang = models.CharField(max_length=50, default="Odia")
    status = models.CharField(max_length=50, default="Ready")
    num_chunks = models.IntegerField(default=12)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "documents"

class QuizResultRecord(models.Model):
    topic = models.CharField(max_length=255, default="Water Cycle")
    score = models.IntegerField(default=3)
    total = models.IntegerField(default=3)
    percentage = models.FloatField(default=100.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "quiz_results"

class Student(models.Model):
    name = models.CharField(max_length=255)
    grade = models.CharField(max_length=50, default="Class 3")
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "students"
