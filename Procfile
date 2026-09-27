web: bash bin/railway-start.sh
worker-default: QUEUE=default,critical CONCURRENCY=2 bash bin/celery-worker.sh
worker-nira: QUEUE=nira CONCURRENCY=2 bash bin/celery-worker.sh
worker-notify: QUEUE=notify CONCURRENCY=2 bash bin/celery-worker.sh
worker-sms: QUEUE=sms CONCURRENCY=1 bash bin/celery-worker.sh
beat: bash bin/celery-beat.sh
release: python manage.py migrate --noinput
