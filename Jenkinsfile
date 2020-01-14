#! /usr/bin/env groovy
pipeline{
    agent {
        dockerfile {
            filename 'Dockerfile'
            args '--network="host"'
        }
    }
    stages{
        stage("Parallel Tests"){
            parallel{
                stage("Frontend Tests"){
                    agent{
                        dockerfile{
                            dir 'frontend'
                            filename 'Dockerfile-CI'
                            args '-e CI=true'
                        }
                    }
                    steps {
                        sh "ls -la"
                        sh "cat frontend/package.json"
                        sh "yarn --cwd frontend/ install --verbose"
                        sh "yarn list -g"
                        sh "yarn --cwd frontend/ test --exit"
                    }
                }
                stage("Backend Tests"){
                    agent{
                        dockerfile{
                            filename 'Dockerfile'
                        }
                    }
                    steps {
                        sh "./setup-env.sh"
                        sh "docker-compose -f docker-compose-CI.test.yml build"
                        sh "docker-compose -f docker-compose-CI.test.yml up --abort-on-container-exit"
                        sh 'docker cp "$(docker-compose -f docker-compose-CI.test.yml ps -a -q django)":app/ndis_calculator/coverage.xml ./backend/ndis_calculator/coverage.xml'
                        cobertura coberturaReportFile: 'backend/ndis_calculator/coverage.xml'
                    }
                    post{
                        always{
                            sh "docker-compose -f docker-compose-CI.test.yml down -v"
                        }
                    }
                }
            }
        }
        stage("Setup Env Vars, Build and Run New Images"){
            when {
                not {
                    branch 'develop'
                }
            }
            steps{
                sh "./setup-env.sh"
                sh "docker-compose -f docker-compose-CI.yml build"
                sh "docker-compose -f docker-compose-CI.yml up -d"
            }
        }
        stage("Deploy to Dev Environment"){
            when{
                branch 'develop'
            }
            steps{
                sh "./setup-env.dev.sh"
                sh "docker-compose -f docker-compose-prod.yml down -v"
                sh "docker-compose -f docker-compose-prod.yml build"
                sh "docker-compose -f docker-compose-prod.yml up -d"
            }
        }
        stage("Run Health Check Script"){
            steps{
                sh "./healthCheck.sh"
            }
        }
    }
    post{
        always{
            script{
                if (env.BRANCH_NAME != 'develop') {
                    sh "docker-compose -f docker-compose-CI.yml down -v"
                }
            }
        }
    }
}
