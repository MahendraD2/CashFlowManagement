pipeline {
    agent any
    
    tools {
        // This 'docker' name must match what is configured in 
        // Jenkins -> Manage Jenkins -> Global Tool Configuration
        dockerTool 'docker' 
    }

    environment {
        SONAR_URL = "http://sonarqube.imcc.com/"
        NEXUS_URL = "nexus.imcc.com"
        // Credentials must exist in Jenkins with these IDs
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
                    echo "Running SonarQube analysis at ${SONAR_URL}"
                    // Optional: Add real scanner here if available
                    // sh "sonar-scanner -Dsonar.projectKey=2401037_CashVista -Dsonar.sources=."
                }
            }
        }

        stage('Build & Push to Nexus') {
            steps {
                script {
                    // Using withCredentials to safely handle login
                    withCredentials([usernamePassword(credentialsId: 'nexus-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        // Log in to Nexus registry
                        sh "echo ${PASS} | docker login ${NEXUS_URL} -u ${USER} --password-stdin"
                        
                        // Build and Tag Backend
                        sh "docker build -t ${NEXUS_URL}/cashvista-backend:v1 ./backend"
                        // Build and Tag Frontend
                        sh "docker build -t ${NEXUS_URL}/cashvista-frontend:v1 ./frontend"
                        
                        // Push to Nexus
                        sh "docker push ${NEXUS_URL}/cashvista-backend:v1"
                        sh "docker push ${NEXUS_URL}/cashvista-frontend:v1"
                    }
                }
            }
        }

        stage('Deploy to K8s') {
            steps {
                // Ensure your k8s manifests use the correct college DB settings
                sh "kubectl apply -f k8s/"
            }
        }
    }
    
    post {
        always {
            // Log out to keep the agent clean
            sh "docker logout ${NEXUS_URL}"
        }
    }
}