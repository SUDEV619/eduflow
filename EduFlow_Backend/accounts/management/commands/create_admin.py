from django.core.management.base import BaseCommand
from accounts.models import CustomUser


class Command(BaseCommand):
    help = 'Create an admin user for EduFlow'

    def add_arguments(self, parser):
        parser.add_argument('--name',     default='Admin',              help='Full name of the admin')
        parser.add_argument('--email',    default='admin@eduflow.com',  help='Admin email')
        parser.add_argument('--password', default='Admin@123',          help='Admin password')

    def handle(self, *args, **options):
        email    = options['email']
        name     = options['name']
        password = options['password']

        if CustomUser.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Admin with email "{email}" already exists.'))
            return

        user = CustomUser.objects.create_user(
            email=email,
            name=name,
            password=password,
            role='ADMIN',
            is_staff=True,
            is_superuser=True,
        )
        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Admin created successfully!\n'
            f'   Name    : {user.name}\n'
            f'   Email   : {user.email}\n'
            f'   Password: {password}\n'
            f'   Role    : {user.role}\n'
        ))
