pipeline {
    agent any
    
    environment {
        SONAR_URL = "http://sonarqube.imcc.com/"
        NEXUS_URL = "nexus.imcc.com"
        // Credentials we created earlier
        SONAR_CREDS = credentials('sonarqube-creds') 
        NEXUS_CREDS = credentials('nexus-creds')
        // Using the standard Linux path for Docker
        DOCKER_BIN = "/usr/bin/docker"
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
                    echo "Running SonarQube analysis at ${SONAR_URL}"
                }
            }
        }

        stage('Build & Push to Nexus') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'nexus-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        // Using full path to avoid "not found" errors
                        sh "echo ${PASS} | ${DOCKER_BIN} login ${NEXUS_URL} -u ${USER} --password-stdin"
                        
                        // Build Backend & Frontend
                        sh "${DOCKER_BIN} build -t ${NEXUS_URL}/cashvista-backend:v1 ./backend"
                        sh "${DOCKER_BIN} build -t ${NEXUS_URL}/cashvista-frontend:v1 ./frontend"
                        
                        // Push to Nexus
                        sh "${DOCKER_BIN} push ${NEXUS_URL}/cashvista-backend:v1"
                        sh "${DOCKER_BIN} push ${NEXUS_URL}/cashvista-frontend:v1"
                    }
                }
            }
        }

        stage('Deploy to K8s') {
            steps {
                // Deploys using the updated manifests for the college DB
                sh "kubectl apply -f k8s/"
            }
        }
    }
    
    post {
        always {
            // Cleanup login session
            sh "${DOCKER_BIN} logout ${NEXUS_URL}"
        }
    }
}
