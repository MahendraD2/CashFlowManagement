pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli
    command: ["cat"]
    tty: true
  - name: kubectl
    image: bitnami/kubectl:latest
    command: ["cat"]
    tty: true
    securityContext:
      runAsUser: 0
  - name: dind
    image: docker:dind
    securityContext:
      privileged: true
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
"""
        }
    }
    environment {
        APP_NAME = "cashvista"
        IMAGE_TAG = "latest"
        
        // FIXED: Updated with your Roll Number
        REGISTRY_REPO = "2401037" 
        
        REGISTRY_URL = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
        SONAR_HOST_URL = "http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000"
        SONAR_PROJECT = "cashvista" 
    }
    stages {
        stage('Build Docker Image') {
            steps {
                container('dind') {
                    sh "sleep 15"
                    sh "docker build -t \$APP_NAME:\$IMAGE_TAG ."
                }
            }
        }
        stage('Login to Docker Registry') {
            steps {
                container('dind') {
                    // Credentials for student
                    sh "docker login nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 -u student -p Imcc@2025"
                }
            }
        }
        stage('Build - Tag - Push Image') {
            steps {
                container('dind') {
                    sh "docker tag \$APP_NAME:\$IMAGE_TAG \$REGISTRY_URL/\$REGISTRY_REPO/\$APP_NAME:\$IMAGE_TAG"
                    sh "docker push \$REGISTRY_URL/\$REGISTRY_REPO/\$APP_NAME:\$IMAGE_TAG"
                }
            }
        }
        stage('Deploy Application') {
            steps {
                container('kubectl') {
                    dir('k8s') {
                        // FIXED: Updated commands to use your Namespace (Roll No)
                        sh "kubectl apply -f deployment.yaml -n 2401037"
                        sh "kubectl apply -f service.yaml -n 2401037"
                        sh "kubectl apply -f ingress.yaml -n 2401037"
                    }
                }
            }
        }
    }
}