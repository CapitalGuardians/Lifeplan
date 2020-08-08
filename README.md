# ndis-financial-planner

This project is the brainchild of Capital Guardians: An intelligent estimator for the NIDS, aiming to facilitate access for all potential participants.

## Technology Overview

This is a containerised project aiming to achieve simple production deployment: Three containers are specified

Database - simple mysql container based on the official image. Further investigation required, unlikely to be suitable for production.

## How to Run A Development build

### If You're Developing Backend

We are using git pre-commit hooks to lint and format the Python code, ensuring only good codes are committed to the repository.

To achieve this, you need to do the following (just once):

1. You need to have Python3 installed
2. Run `pip install -r backend/ndis_calculator/requirements-dev.txt`
3. Run `pre-commit install -c backend/ndis_calculator/.pre-commit-config.yaml`

### With Docker

`docker-compose build`
followed by
`docker-compose up`

When complete ctrl-c to end process,
`docker-compose down`
to remove containers and clean up.

### Without Docker

#### Frontend

1. Install yarn
2. `cd Lifeplan/frontend/`
3. Install dependencies with `yarn`
4. Start the server with `yarn run start-dockerless`
5. The frontend server is now located at localhost:3000

#### Backend

1. Make sure you have done the pip install instructions above
2. Install and start MySQL service at localhost:3306, create a database called ndis
3. Create a .env file at Lifeplan/backend/ndis_calculator/ with contents:
   `DATABASE_HOST="127.0.0.1"`
   `DATABASE_PASSWORD=""`
4. `cd Lifeplan/backend/ndis_calculator/
5. Create the Django migration files with `python manage.py makemigrations`
6. Migrate the database structures to the ndis db with `python manage.py migrate`
7. Pre-fill the db with initial data with `python manage.py loaddata budgeting`
8. Start the server with `python manage.py runserver`
9. The backend server is now located at localhost:8000

## Settings

Django settings can be found in backend/ndis_calculator/ndis_calculator/settings.py. We will expand these settings to encompass production-ready settings. Only settings appropriate for development will be committed to the repository, production-ready will remain private.

## Deployment

If the develop branch is currently building, the app will be deployed at http://lifeplan.yefta.com/
Please note HTTPS is not currently enabled and as such, only enter dummy data over the internet!

## API

The API is documented in OpenAPI specification using Swagger. The api.yaml file in Lifeplan/backend/ndis_calculator can be viewed at https://editor.swagger.io/
