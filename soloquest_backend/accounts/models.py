from datetime import date
from typing import Any, Dict, List, Tuple  # Added Dict along with List and Tuple
from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.exceptions import ValidationError
from datetime import date
from typing import Any, Dict, List, Tuple
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.exceptions import ValidationError
from django.utils.timezone import now



class Destination(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class FavoriteDestination(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # One user → many favorites
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE)  # Each favorite is linked to one destination
    added_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'destination')  # Prevents duplicate favorites

    def __str__(self):
        return f"{self.user.email} - {self.destination.name}"

class Favorite(models.Model):
    """
    Minimal Favorite model that links a user to a country code they have favorited.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorites"
    )
    country_code = models.CharField(max_length=3)
    added_at = added_at = models.DateTimeField(default=now)

    class Meta:
        unique_together = ('user', 'country_code')
        ordering = ['-added_at']



class Friendship(models.Model):
    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="friendship_user1",  # Changed from 'sent_requests'
        on_delete=models.CASCADE
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="friendship_user2",  # Changed from 'received_requests'
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user1', 'user2')

    def __str__(self):
        return f"{self.user1} is friends with {self.user2}"


class CustomUser(AbstractUser):
    """Defines the custom user model with email as the unique identifier."""
    
    # Removing username since we use email instead
    username = None  # Removes the username field from AbstractUser
    name = models.CharField(max_length=150, blank=False, default='Unknown')
    email = models.EmailField(unique=True, null=False, blank=False)
    date_of_birth = models.DateField(null=False, blank=False, default=date(2000, 1, 1))
    profile_picture = models.ImageField(upload_to="profile_pictures/", null=True, blank=True)

    # Friends system with custom Friendship model
    friends = models.ManyToManyField(
        'self',
        symmetrical=False,
        through='Friendship',
        through_fields=('user1', 'user2'),
        blank=True
    )

    # Django Authentication Fix
    USERNAME_FIELD = 'email'  # Now Django uses email for authentication
    REQUIRED_FIELDS = ['name', 'date_of_birth']  # Removed 'username'

    """Resolve clashes with the default reverse relations."""
    groups = models.ManyToManyField(
        Group,
        blank=True,
        related_name='customuser_set',
        related_query_name='customuser'
    )
    user_permissions = models.ManyToManyField(
        Permission,
        blank=True,
        related_name='customuser_set',
        related_query_name='customuser'
    )
    
    def __str__(self) -> str:
        """Returns the user's email as a string representation."""
        return self.email
    

class Category(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class BlogPost(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()
    image = models.ImageField(upload_to='blog_images/', null=True, blank=True)
    tags = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    likes_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title

class Comment(models.Model):
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Like(models.Model):
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    
from django.db import models
from django.conf import settings

from django.db import models
from django.conf import settings

class FriendRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined')
    ]

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="friend_requests_sent",  # Changed from 'sent_requests'
        on_delete=models.CASCADE
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="friend_requests_received",  # Changed from 'received_requests'
        on_delete=models.CASCADE
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('sender', 'receiver')

    def __str__(self):
        return f"{self.sender} -> {self.receiver} ({self.status})"


class BlockedUser(models.Model):
    blocker = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="blocking", on_delete=models.CASCADE)
    blocked = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="blocked", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('blocker', 'blocked')

    def __str__(self):
        return f"{self.blocker} blocked {self.blocked}"
    
from django.db import models
from django.contrib.auth.models import User

class Itinerary(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"

class ItineraryItem(models.Model):
    itinerary = models.ForeignKey(Itinerary, on_delete=models.CASCADE, related_name='items')
    date = models.DateField()
    time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=200)
    activity = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.date} - {self.location}"


