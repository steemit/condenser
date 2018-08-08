pipeline {
  agent {
    docker {
      image 'node:8'
      args '-p 9002:8080'
    }

  }
  stages {
    stage('Build') {
      steps {
        sh 'npm install'
        sh 'npm run build'
      }
    }
    stage('Test') {
      steps {
        sh 'npm run test'
      }
    }
  }
}