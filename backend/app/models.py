from django.db import models

class LessonRecord(models.Model):
    title = models.CharField(max_length=255, default="Lesson")
    grade = models.CharField(max_length=50, default="Class 3")
    subject = models.CharField(max_length=100, default="Science")
    source_lang = models.CharField(max_length=50, default="English")
    target_lang = models.CharField(max_length=50, default="Odia")
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
