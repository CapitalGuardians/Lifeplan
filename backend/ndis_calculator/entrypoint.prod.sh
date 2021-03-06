timeout 120 bash -c 'until echo > /dev/tcp/db/3306; do sleep 2; done' > /dev/null 2>&1
python manage.py makemigrations --no-input
python manage.py migrate --no-input
python manage.py collectstatic
python manage.py loaddata budgeting/fixtures/*
gunicorn ndis_calculator.wsgi:application --bind 0.0.0.0:8000
