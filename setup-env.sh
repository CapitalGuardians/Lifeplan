export DJANGO_PORT=$((($RANDOM % 999) + 8000))
export REACT_PORT=$((($RANDOM % 999) + 3000))
echo -e "DOCKER_DJANGO_PORT=$DJANGO_PORT\nDOCKER_REACT_PORT=$REACT_PORT" > ".env"
