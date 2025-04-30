from rest_framework import serializers
from .models import CustomUser
from .models import BlogPost
    
from rest_framework import serializers
from .models import BlogPost, Category, Comment, Like
from .models import Friendship

class UserSignUpSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'first_name', 'last_name', 'profile_picture']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            profile_picture=validated_data.get('profile_picture', None)
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class BlogPostSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'content', 'image', 'tags', 'category', 'is_published', 'created_at', 'author_name']

    def get_author_name(self, obj):
        return obj.author.email if obj.author else "Unknown"  # Change this if you want to use `name`

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'post', 'user', 'created_at']
        
from rest_framework import serializers
from .models import Comment

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at']

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import FriendRequest, BlockedUser

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']

from rest_framework import serializers
from .models import FriendRequest

class FriendRequestSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    receiver = serializers.SerializerMethodField()

    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'status']

    def get_sender(self, obj):
        return {
            "id": obj.sender.id,
            "first_name": obj.sender.first_name,
            "last_name": obj.sender.last_name,
            "email": obj.sender.email
        }

    def get_receiver(self, obj):
        return {
            "id": obj.receiver.id,
            "first_name": obj.receiver.first_name,
            "last_name": obj.receiver.last_name,
            "email": obj.receiver.email
        }


class BlockedUserSerializer(serializers.ModelSerializer):
    blocker = UserSerializer(read_only=True)
    blocked = UserSerializer(read_only=True)

    class Meta:
        model = BlockedUser
        fields = ['id', 'blocker', 'blocked', 'created_at']

   

class FriendshipSerializer(serializers.ModelSerializer):
    user1 = UserSerializer(read_only=True)
    user2 = UserSerializer(read_only=True)

    class Meta:
        model = Friendship
        fields = ['id', 'user1', 'user2', 'created_at']
 
