pipeline {
    agent any

    environment {
        // The application files already live here on this EC2 instance.
        APP_DIR = '/opt/telecom-copilot'

        // CHANGE ONLY THIS LINE to your Docker Hub repository.
        IMAGE_REPO = 'YOUR_DOCKERHUB_USERNAME/telecom-complaint-copilot'
    }

    stages {
        stage('Check application folder') {
            steps {
                sh '''
                    test -d "$APP_DIR"
                    test -f "$APP_DIR/Dockerfile"
                    echo "Building application from: $APP_DIR"
                '''
            }
        }

        stage('Build Docker image') {
            steps {
                sh '''
                    docker build \
                      -t "$IMAGE_REPO:$BUILD_NUMBER" \
                      -t "$IMAGE_REPO:latest" \
                      "$APP_DIR"
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_TOKEN'
                )]) {
                    sh '''
                        echo "$DOCKERHUB_TOKEN" | docker login \
                          -u "$DOCKERHUB_USER" \
                          --password-stdin

                        docker push "$IMAGE_REPO:$BUILD_NUMBER"
                        docker push "$IMAGE_REPO:latest"

                        docker logout
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Docker image pushed successfully: ${IMAGE_REPO}:${BUILD_NUMBER} and ${IMAGE_REPO}:latest"
        }
        failure {
            echo 'Build failed. Check the Jenkins console output.'
        }
    }
}
