from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import SignUpSerializer, LoginSerializer

class SignUpView(APIView):
    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "status": "success", 
                    "message": "User registered successfully",
                    "token": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "name": user.name,
                        "email": user.email,
                        "role": user.role
                    }
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"status": "error", "message": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

class LoginView(APIView):
    def post(self, request):
        try:
            print(f"Login attempt for data: {request.data}")
            serializer = LoginSerializer(data=request.data)
            if serializer.is_valid():
                email = serializer.validated_data['email']
                password = serializer.validated_data['password']
                print(f"Attempting authenticate with username: {email}")
                
                # Use username=email as it's more standard in Django authenticate
                user = authenticate(request, username=email, password=password)
                print(f"Authenticate returned: {user}")
                
                if not user:
                    # Fallback check for debugging
                    try:
                        from .models import CustomUser
                        potential_user = CustomUser.objects.filter(email=email).first()
                        if potential_user:
                            print(f"User found in DB: {potential_user.email}, is_active={potential_user.is_active}")
                            if potential_user.check_password(password):
                                print("Manual password check SUCCEEDED! Something is wrong with authenticate()")
                                user = potential_user
                            else:
                                print("Manual password check FAILED.")
                        else:
                            print(f"User NOT found in DB for email: {email}")
                    except Exception as e2:
                        print(f"Fallback check failed: {e2}")
                
                if user:
                    refresh = RefreshToken.for_user(user)
                    return Response(
                        {
                            "status": "success", 
                            "message": "Login successful",
                            "token": str(refresh.access_token),
                            "refresh": str(refresh),
                            "user": {
                                "name": user.name,
                                "email": user.email,
                                "role": user.role
                            }
                        },
                        status=status.HTTP_200_OK
                    )
                print("Authentication failed: user is None")
                return Response(
                    {"status": "error", "message": "Invalid email or password"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            print(f"Serializer invalid: {serializer.errors}")
            return Response(
                {"status": "error", "message": "Invalid email or password"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"CRASH in LoginView: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {"status": "error", "message": f"Server error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
