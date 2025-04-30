from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from .models import FavoriteDestination, Destination, Favorite

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """Custom admin for the CustomUser model using email authentication."""
    
    # ✅ Display correct fields in Django Admin
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')  # ✅ Search by email instead of username
    ordering = ('email',)  # ✅ Order users by email instead of username

    # ✅ Update fieldsets to remove username and use email
    fieldsets = (
        (None, {'fields': ('email', 'password', 'first_name', 'last_name', 'profile_picture')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'groups', 'user_permissions')}),
    )

    # ✅ Ensure email is used in the "Add User" form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'profile_picture', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )

    # ✅ Override get_ordering to remove username reference
    def get_ordering(self, request):
        return ['email']



@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(FavoriteDestination)
class FavoriteDestinationAdmin(admin.ModelAdmin):
    list_display = ('user', 'destination', 'added_on')
    search_fields = ('user__email', 'destination__name')

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'country_code', 'added_at')
    search_fields = ('user__email', 'country_code')
    list_filter = ('added_at',) # Add a filter for the added_at field.

from django.contrib import admin
from .models import BlogPost, Category, Comment, Like

class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'is_published', 'created_at')
    list_filter = ('is_published', 'category')
    search_fields = ('title', 'author__username', 'tags')

class CommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'user', 'created_at')
    search_fields = ('post__title', 'user__username')

class LikeAdmin(admin.ModelAdmin):
    list_display = ('post', 'user', 'created_at')

admin.site.register(BlogPost, BlogPostAdmin)
admin.site.register(Category)
admin.site.register(Comment, CommentAdmin)
admin.site.register(Like, LikeAdmin)
