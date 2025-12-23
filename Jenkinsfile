pipeline {
    agent any
    
    environment {
        SONAR_URL = "http://sonarqube.imcc.com/"
        NEXUS_URL = "nexus.imcc.com"
        SONAR_CREDS = credentials('sonarqube-creds') 
        NEXUS_CREDS = credentials('nexus-creds')
        // Trying the other common path for institutional servers
        DOCKER_BIN = "/usr/local/bin/docker"
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
                    // This command will help us find where docker is if the path fails again
                    sh "whereis docker || true"
                    sh "which docker || true"

                    withCredentials([usernamePassword(credentialsId: 'nexus-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        // Using the new path variable
                        sh "echo ${PASS} | ${DOCKER_BIN} login ${NEXUS_URL} -u ${USER} --password-stdin"
                        
                        sh "${DOCKER_BIN} build -t ${NEXUS_URL}/cashvista-backend:v1 ./backend"
                        sh "${DOCKER_BIN} build -t ${NEXUS_URL}/cashvista-frontend:v1 ./frontend"
                        
                        sh "${DOCKER_BIN} push ${NEXUS_URL}/cashvista-backend:v1"
                        sh "${DOCKER_BIN} push ${NEXUS_URL}/cashvista-frontend:v1"
                    }
                }
            }
        }

        stage('Deploy to K8s') {
            steps {
                sh "kubectl apply -f k8s/"
            }
        }
    }
    
    post {
        always {
            // Use '|| true' so the logout doesn't crash the whole build if docker isn't found
            sh "${DOCKER_BIN} logout ${NEXUS_URL} || true"
        }
    }
}
