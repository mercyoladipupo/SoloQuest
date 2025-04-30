from django.contrib.auth import authenticate
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password
from django.http import JsonResponse
from .models import Favorite, CustomUser, FavoriteDestination, Destination
from .serializers import UserSignUpSerializer
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from .models import Category
from .serializers import CategorySerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import BlogPost, Comment, Like
from .serializers import BlogPostSerializer, CommentSerializer
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .serializers import BlogPostSerializer
from django.db import models



# ---------------------------
# ✅ Return the actual CSRF token to the frontend
# ---------------------------
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'csrftoken': get_token(request)})

# ---------------------------
# ✅ User Registration & Authentication
# ---------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    data = request.data

    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

    if not check_password(current_password, user.password):
        return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8:
        return Response({"error": "New password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)

class SignUpView(generics.CreateAPIView):
    serializer_class = UserSignUpSerializer
    permission_classes = [AllowAny]

class SignInView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            })
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# ---------------------------
# ✅ Favorites Endpoints (Country Codes)
# ---------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_country_favorites(request):
    favorites = Favorite.objects.filter(user=request.user)
    data = [{"country_code": fav.country_code} for fav in favorites]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_favorite(request):
    country_code = request.data.get("country_code")
    if Favorite.objects.filter(user=request.user, country_code=country_code).exists():
        return Response({"error": "Country already in favorites."}, status=status.HTTP_400_BAD_REQUEST)
    Favorite.objects.create(user=request.user, country_code=country_code)
    return Response({"success": "Favorite added."}, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_favorite(request, country_code):
    Favorite.objects.filter(user=request.user, country_code=country_code).delete()
    return Response({"success": "Favorite removed."}, status=status.HTTP_200_OK)

# ---------------------------
# ✅ Favorite Destinations (Destination Objects)
# ---------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_destination_favorites(request): #changed name to get_destination_favorites to avoid conflict
    favorites = FavoriteDestination.objects.filter(user=request.user).select_related('destination')
    favorite_list = [{"id": fav.destination.id, "name": fav.destination.name} for fav in favorites]
    return Response(favorite_list)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite_destination(request, destination_id): #modified to be an api view.
    destination = get_object_or_404(Destination, id=destination_id)
    favorite, created = FavoriteDestination.objects.get_or_create(user=request.user, destination=destination)
    
    if not created:
        favorite.delete()
        return Response({"message": "Removed from favorites", "status": "removed"})
    
    return Response({"message": "Added to favorites", "status": "added"})

# ---------------------------
# ✅ User Registration API (Sign-Up)
# ---------------------------
class RegisterView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        profile_picture = request.FILES.get("profile_picture")

        if not email or not password or not first_name or not last_name:
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        if CustomUser.objects.filter(email=email).exists():
            return Response({"error": "Email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
            profile_picture=profile_picture
        )
        user.set_password(password)
        user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "profile_picture": user.profile_picture.url if user.profile_picture else None
            }
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def like_post(request, post_id):
    try:
        post = BlogPost.objects.get(id=post_id)
        post.likes_count += 1  # Increment the like count
        post.save()
        return Response({'likes_count': post.likes_count}, status=200)
    except BlogPost.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)

from .models import Comment
from .serializers import CommentSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # ✅ Require user to be logged in
def add_comment(request, post_id):
    try:
        post = BlogPost.objects.get(id=post_id)
        comment = Comment.objects.create(
            post=post,
            user=request.user,
            content=request.data.get('content')
        )
        return Response(CommentSerializer(comment).data, status=201)
    except BlogPost.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)


class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Allow read without authentication

    def perform_create(self, serializer):
        """ Assign the currently authenticated user as the author """
        serializer.save(author=self.request.user)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import BlogPost

class LikePostView(APIView):
    def post(self, request, post_id):
        post = get_object_or_404(BlogPost, id=post_id)
        post.likes_count += 1
        post.save()
        return Response({'likes_count': post.likes_count}, status=status.HTTP_200_OK)
    
from .models import Comment
from .serializers import CommentSerializer

class CommentPostView(APIView):
    def post(self, request, post_id):
        post = get_object_or_404(BlogPost, id=post_id)
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(post=post, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import BlogPost, Comment
from .serializers import CommentSerializer

class CommentCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # ✅ Require authentication

    def post(self, request, post_id):
        try:
            post = BlogPost.objects.get(id=post_id)
        except BlogPost.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

        # Ensure user is authenticated
        if request.user.is_anonymous:
            return Response({"error": "User must be authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(post=post, user=request.user)  # ✅ Assign logged-in user
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .models import BlogPost, Comment
from .serializers import CommentSerializer

class CommentView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure user is logged in

    def post(self, request, post_id):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            post = BlogPost.objects.get(id=post_id)
        except BlogPost.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(post=post, user=request.user)  # Ensure a user is assigned
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import models  
from .models import FriendRequest, Friendship, BlockedUser
from .serializers import FriendRequestSerializer, FriendshipSerializer, BlockedUserSerializer, UserSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request, user_id):
    sender = request.user  # ✅ Get logged-in user (the sender)
    receiver = get_object_or_404(CustomUser, id=user_id)  # ✅ Get recipient

    if sender.id == receiver.id:
        return Response({"error": "You cannot send a request to yourself."}, status=400)

    if FriendRequest.objects.filter(sender=sender, receiver=receiver, status="pending").exists():
        return Response({"error": "Friend request already sent."}, status=400)

    friend_request = FriendRequest.objects.create(sender=sender, receiver=receiver, status="pending")

    return Response({
        "message": "Friend request sent successfully!",
        "request_id": friend_request.id,
        "sender": {
            "id": sender.id,
            "first_name": sender.first_name,
            "last_name": sender.last_name,
            "email": sender.email
        },
        "receiver": {
            "id": receiver.id,
            "first_name": receiver.first_name,
            "last_name": receiver.last_name,
            "email": receiver.email
        }
    }, status=201)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_friend_request(request, request_id):
    """Deletes a friend request"""
    friend_request = get_object_or_404(FriendRequest, id=request_id)

    # Ensure only the sender or receiver can delete the request
    if friend_request.sender != request.user and friend_request.receiver != request.user:
        return Response({"error": "Unauthorized"}, status=403)

    friend_request.delete()
    return Response({"message": "Friend request deleted successfully"}, status=200)



User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().exclude(is_superuser=True)  # Exclude admin users
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    # ✅ Send Friend Request
    @action(detail=True, methods=['POST'])
    def send_friend_request(self, request, pk=None):
        receiver = get_object_or_404(User, id=pk)
        sender = request.user

        if sender == receiver:
            return Response({"error": "You cannot send a request to yourself."}, status=status.HTTP_400_BAD_REQUEST)

        if FriendRequest.objects.filter(sender=sender, receiver=receiver, status="pending").exists():
            return Response({"error": "Friend request already sent."}, status=status.HTTP_400_BAD_REQUEST)

        FriendRequest.objects.create(sender=sender, receiver=receiver, status="pending")
        return Response({"message": "Friend request sent successfully."}, status=status.HTTP_201_CREATED)

    # ✅ Accept Friend Request
    @action(detail=True, methods=['POST'])
    def accept_friend_request(self, request, pk=None):
        friend_request = get_object_or_404(FriendRequest, id=pk, receiver=request.user, status="pending")
        friend_request.status = "accepted"
        friend_request.save()

        # Create a Friendship entry
        Friendship.objects.create(user1=friend_request.sender, user2=friend_request.receiver)

        return Response({"message": "Friend request accepted."}, status=status.HTTP_200_OK)

    # ✅ Decline Friend Request
    @action(detail=True, methods=['POST'])
    def decline_friend_request(self, request, pk=None):
        friend_request = get_object_or_404(FriendRequest, id=pk, receiver=request.user, status="pending")
        friend_request.status = "declined"
        friend_request.save()
        return Response({"message": "Friend request declined."}, status=status.HTTP_200_OK)

    # ✅ Remove Friend
    @action(detail=True, methods=['POST'])
    def remove_friend(self, request, pk=None):
        sender = request.user
        receiver = get_object_or_404(User, id=pk)

        friendship = Friendship.objects.filter(
            models.Q(user1=sender, user2=receiver) | models.Q(user1=receiver, user2=sender)
        )
        
        if friendship.exists():
            friendship.delete()
            return Response({"message": "Friend removed successfully."}, status=status.HTTP_200_OK)
        return Response({"error": "You are not friends."}, status=status.HTTP_400_BAD_REQUEST)

    # ✅ Block User
    @action(detail=True, methods=['POST'])
    def block_user(self, request, pk=None):
        blocker = request.user
        blocked = get_object_or_404(User, id=pk)

        if BlockedUser.objects.filter(blocker=blocker, blocked=blocked).exists():
            return Response({"error": "User already blocked."}, status=status.HTTP_400_BAD_REQUEST)

        BlockedUser.objects.create(blocker=blocker, blocked=blocked)
        return Response({"message": "User blocked successfully."}, status=status.HTTP_201_CREATED)

    # ✅ Unblock User
    @action(detail=True, methods=['POST'])
    def unblock_user(self, request, pk=None):
        blocker = request.user
        blocked = get_object_or_404(User, id=pk)

        BlockedUser.objects.filter(blocker=blocker, blocked=blocked).delete()
        return Response({"message": "User unblocked successfully."}, status=status.HTTP_200_OK)

    # ✅ Get List of Friends
    @action(detail=False, methods=['GET'])
    def my_friends(self, request):
        user = request.user
        friendships = Friendship.objects.filter(models.Q(user1=user) | models.Q(user2=user))
        friend_users = [fr.user2 if fr.user1 == user else fr.user1 for fr in friendships]
        return Response(UserSerializer(friend_users, many=True).data)

# ✅ Friend Request ViewSet
class FriendRequestViewSet(viewsets.ModelViewSet):
    queryset = FriendRequest.objects.all()
    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

# ✅ Friendship ViewSet
class FriendshipViewSet(viewsets.ModelViewSet):
    queryset = Friendship.objects.all()
    serializer_class = FriendshipSerializer
    permission_classes = [permissions.IsAuthenticated]

# ✅ Blocked User ViewSet
class BlockedUserViewSet(viewsets.ModelViewSet):
    queryset = BlockedUser.objects.all()
    serializer_class = BlockedUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.backends import TokenBackend
from django.conf import settings
from .models import Itinerary, ItineraryItem

User = get_user_model()

@csrf_exempt
def create_itinerary(request):
    if request.method == "POST":
        try:
            # ✅ Use SimpleJWT's TokenBackend to validate token
            auth_header = request.headers.get("Authorization", "")
            parts = auth_header.split()

            if len(parts) != 2 or parts[0].lower() != "bearer":
                return JsonResponse({"error": "Invalid or missing Authorization header"}, status=401)

            token = parts[1]

            # Use TokenBackend to decode
            backend = TokenBackend(algorithm='HS256', signing_key=settings.SECRET_KEY)
            payload = backend.decode(token, verify=True)
            user_id = payload.get("user_id")

            if not user_id:
                return JsonResponse({"error": "User not found in token"}, status=401)

            user = User.objects.get(id=user_id)

            data = json.loads(request.body)
            title = data.get("title")
            items = data.get("items", [])

            if not title:
                return JsonResponse({"error": "Missing title"}, status=400)

            itinerary = Itinerary.objects.create(user=user, title=title)

            for item in items:
                ItineraryItem.objects.create(
                    itinerary=itinerary,
                    date=item.get("date"),
                    time=item.get("time") or None,
                    location=item.get("location"),
                    activity=item.get("activity", ""),
                    notes=item.get("notes", "")
                )

            return JsonResponse({"message": "Itinerary created successfully"}, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid method"}, status=405)



from rest_framework_simplejwt.backends import TokenBackend
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Itinerary


def login_required_json(view_func):
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        return view_func(request, *args, **kwargs)
    return _wrapped_view


@csrf_exempt
def get_user_itineraries(request):
    if request.method == "GET":
        try:
            # ✅ Decode the access token
            auth_header = request.headers.get("Authorization", "")
            parts = auth_header.split()

            if len(parts) != 2 or parts[0].lower() != "bearer":
                return JsonResponse({"error": "Invalid or missing Authorization header"}, status=401)

            token = parts[1]
            backend = TokenBackend(algorithm='HS256', signing_key=settings.SECRET_KEY)
            payload = backend.decode(token, verify=True)
            user_id = payload.get("user_id")

            itineraries = Itinerary.objects.filter(user_id=user_id).order_by("-created_at")

            data = []
            for itinerary in itineraries:
                items = itinerary.items.all().values("date", "time", "location", "activity", "notes")
                data.append({
                    "id": itinerary.id,
                    "title": itinerary.title,
                    "created_at": itinerary.created_at.strftime("%Y-%m-%d %H:%M"),
                    "items": list(items)
                })

            return JsonResponse(data, safe=False)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid method"}, status=405)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Itinerary  # adjust if needed


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_itinerary(request, id):
    try:
        itinerary = Itinerary.objects.get(id=id, user=request.user)
        itinerary.delete()
        return Response({"message": "Itinerary deleted successfully."}, status=status.HTTP_200_OK)
    except Itinerary.DoesNotExist:
        return Response({"error": "Itinerary not found."}, status=status.HTTP_404_NOT_FOUND)

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Comment
from .serializers import CommentSerializer

class CommentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, comment_id):
        comment = Comment.objects.filter(id=comment_id).first()

        if not comment:
            return Response({"error": "Comment not found"}, status=404)

        if comment.user != request.user:
            return Response({"error": "You can only edit your own comments."}, status=403)

        serializer = CommentSerializer(comment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, comment_id):
        comment = Comment.objects.select_related('post', 'user').filter(id=comment_id).first()

        if not comment:
            return Response({"error": "Comment not found"}, status=404)

        if comment.user != request.user and comment.post.author != request.user:
            return Response({"error": "Only the comment author or post author can delete this comment."}, status=403)

        comment.delete()
        return Response({"message": "Comment deleted successfully."}, status=204)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Itinerary, ItineraryItem

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_itinerary(request, id):
    try:
        itinerary = Itinerary.objects.get(id=id, user=request.user)
    except Itinerary.DoesNotExist:
        return Response({"error": "Itinerary not found."}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    title = data.get("title")
    items = data.get("items")

    if not title or not isinstance(items, list):
        return Response({"error": "Invalid data provided."}, status=status.HTTP_400_BAD_REQUEST)

    itinerary.title = title
    itinerary.save()

    # Remove old items
    itinerary.items.all().delete()

    # Add updated items
    for item in items:
        ItineraryItem.objects.create(
            itinerary=itinerary,
            date=item.get("date"),
            time=item.get("time") or None,
            location=item.get("location"),
            activity=item.get("activity"),
            notes=item.get("notes", "")
        )

    updated_data = {
        "id": itinerary.id,
        "title": itinerary.title,
        "created_at": itinerary.created_at.strftime("%Y-%m-%d %H:%M"),
        "items": items
    }

    return Response(updated_data, status=status.HTTP_200_OK)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import FriendRequest, Friendship

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_friend_request(request, request_id):
    friend_request = get_object_or_404(FriendRequest, id=request_id, receiver=request.user, status="pending")
    friend_request.status = "accepted"
    friend_request.save()

    # Create the friendship
    Friendship.objects.create(user1=friend_request.sender, user2=friend_request.receiver)

    return Response({"message": "Friend request accepted."}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_friend_request(request, request_id):
    friend_request = get_object_or_404(FriendRequest, id=request_id)

    if friend_request.sender != request.user and friend_request.receiver != request.user:
        return Response({"error": "You are not authorized to delete this request."}, status=status.HTTP_403_FORBIDDEN)

    friend_request.delete()
    return Response({"message": "Friend request deleted."}, status=status.HTTP_200_OK)

