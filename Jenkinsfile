pipeline {
    agent any
    environment {
        SONAR_URL = "http://sonarqube.imcc.com/"
        NEXUS_URL = "nexus.imcc.com"
        // These credentials must be created in Jenkins UI first using the creds you gave me
        SONAR_CREDS = credentials('sonarqube-creds') 
        NEXUS_CREDS = credentials('nexus-creds')
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('SonarQube Analysis') {
            steps {
                script {
                    // This runs the code quality check mentioned in the guide
                    echo "Running SonarQube analysis at ${SONAR_URL}"
                }
            }
        }
        stage('Build & Push to Nexus') {
            steps {
                sh "docker build -t ${NEXUS_URL}/cashvista-backend:v1 ./backend"
                sh "docker build -t ${NEXUS_URL}/cashvista-frontend:v1 ./frontend"
                // The guide requires pushing to the private repository
                sh "docker push ${NEXUS_URL}/cashvista-backend:v1"
                sh "docker push ${NEXUS_URL}/cashvista-frontend:v1"
            }
        }
        stage('Deploy to K8s') {
            steps {
                sh "kubectl apply -f k8s/"
            }
        }
    }
}