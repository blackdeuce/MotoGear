
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        AWS_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = '882638355979'

        ECR_REGISTRY = '882638355979.dkr.ecr.us-east-1.amazonaws.com'

        FRONTEND_REPO = 'motogear-frontend'
        BACKEND_REPO = 'motogear-backend'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -eu

                    docker build \
                      -t $ECR_REGISTRY/$BACKEND_REPO:$BUILD_NUMBER \
                      -f backend/Dockerfile backend

                    docker tag \
                      $ECR_REGISTRY/$BACKEND_REPO:$BUILD_NUMBER \
                      $ECR_REGISTRY/$BACKEND_REPO:latest

                    docker build \
                      -t $ECR_REGISTRY/$FRONTEND_REPO:$BUILD_NUMBER \
                      -f Dockerfile .

                    docker tag \
                      $ECR_REGISTRY/$FRONTEND_REPO:$BUILD_NUMBER \
                      $ECR_REGISTRY/$FRONTEND_REPO:latest
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                    set -eu

                    aws ecr get-login-password \
                      --region $AWS_REGION |
                    docker login \
                      --username AWS \
                      --password-stdin $ECR_REGISTRY
                '''
            }
        }

        stage('Push Images to ECR') {
            steps {
                sh '''
                    set -eu

                    docker push $ECR_REGISTRY/$BACKEND_REPO:$BUILD_NUMBER
                    docker push $ECR_REGISTRY/$BACKEND_REPO:latest

                    docker push $ECR_REGISTRY/$FRONTEND_REPO:$BUILD_NUMBER
                    docker push $ECR_REGISTRY/$FRONTEND_REPO:latest
                '''
            }
        }

        stage('Deploy Containers') {
            steps {
                sh '''
                    set -eu

                    # Require the backend environment file
                    test -s /opt/motogear/backend.env

                    # Create Docker network if it does not exist
                    docker network inspect motogear-net >/dev/null 2>&1 || \
                    docker network create motogear-net

                    # Pull images from ECR
                    docker pull $ECR_REGISTRY/$BACKEND_REPO:$BUILD_NUMBER
                    docker pull $ECR_REGISTRY/$FRONTEND_REPO:$BUILD_NUMBER

                    # Remove previous containers
                    docker rm -f motogear-backend motogear-frontend || true

                    # Start backend
                    docker run -d \
                      --name motogear-backend \
                      --restart unless-stopped \
                      --network motogear-net \
                      --env-file /opt/motogear/backend.env \
                      $ECR_REGISTRY/$BACKEND_REPO:$BUILD_NUMBER

                    # Start frontend
                    docker run -d \
                      --name motogear-frontend \
                      --restart unless-stopped \
                      --network motogear-net \
                      -p 80:80 \
                      $ECR_REGISTRY/$FRONTEND_REPO:$BUILD_NUMBER
                '''
            }
        }
    }

    post {
        success {
            echo 'MotoGear deployment completed successfully!'
        }

        failure {
            echo 'MotoGear pipeline failed. Check the console output.'
        }
    }
}
