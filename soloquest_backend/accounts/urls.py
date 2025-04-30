from django.urls import path
from . import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogPostViewSet, CommentViewSet, CategoryViewSet
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogPostViewSet, LikePostView, CommentPostView
from django.urls import path
from .views import get_country_favorites
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, FriendRequestViewSet, FriendshipViewSet, BlockedUserViewSet, send_friend_request
from django.urls import path
from .views import CommentDetailView
from .views import update_itinerary
from django.urls import path
from .views import accept_friend_request, delete_friend_request

router = DefaultRouter()
router.register(r'posts', BlogPostViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'categories', CategoryViewSet) 
router.register(r'posts', BlogPostViewSet, basename="posts")
router.register(r'users', UserViewSet, basename="user")
router.register(r'users', UserViewSet, basename="users")
router.register(r'friends', FriendshipViewSet, basename="friends")
router.register(r'friend-requests', FriendRequestViewSet, basename="friend-requests")
router.register(r'blocked-users', BlockedUserViewSet, basename="blocked-users")



urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('destination-favorites/', views.get_destination_favorites, name='destination_favorites'),
    path('favorites/add/', views.add_favorite, name='add_favorite'),
    path('favorites/remove/<str:country_code>/', views.remove_favorite, name='remove_favorite'),
    path('api/signup/', views.SignUpView.as_view(), name='api-signup'),
    path('api/signin/', views.SignInView.as_view(), name='api-signin'),
    path('api/get-csrf-token/', views.get_csrf_token, name='get-csrf-token'),
    path("change-password/", views.change_password, name="change_password"),
    path('favorite-destinations/<int:destination_id>/toggle/', views.toggle_favorite_destination, name='toggle_favorite_destination'),
    path('', include(router.urls)),
    path('posts/<int:post_id>/like/', LikePostView.as_view(), name="like-post"),
    path('posts/<int:post_id>/comment/', CommentPostView.as_view(), name="comment-post"),
    path('country-favorites/', get_country_favorites, name='country-favorites'),
    path('api/', include(router.urls)),  # ✅ This should be correctly defined
    path("api/send-friend-request/<int:user_id>/", send_friend_request, name="send_friend_request"),
    path('api/delete-friend-request/<int:request_id>/', views.delete_friend_request, name='delete-friend-request'),
    path("api/itinerary/", views.create_itinerary, name="create-itinerary"),
    path("api/my-itineraries/", views.get_user_itineraries, name="my-itineraries"),
    path("api/delete-itinerary/<int:id>/", views.delete_itinerary, name="delete_itinerary"),
    path('comments/<int:comment_id>/', CommentDetailView.as_view(), name='comment-detail'),
    path("api/update-itinerary/<int:id>/", update_itinerary, name="update-itinerary"),
    path("api/accept-friend-request/<int:request_id>/", accept_friend_request, name="accept-friend-request"),
    path("api/delete-friend-request/<int:request_id>/", delete_friend_request, name="delete-friend-request"),

]


