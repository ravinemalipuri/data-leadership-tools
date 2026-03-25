// ============================================================
// Prioritization Board — Azure Infrastructure
// Deploys: Azure Container Apps + Azure Database for PostgreSQL
// Run: az deployment group create --resource-group <rg> --template-file main.bicep --parameters @parameters.json
// ============================================================

@description('Location for all resources')
param location string = resourceGroup().location

@description('Environment name (dev, test, prod)')
param environment string = 'dev'

@description('PostgreSQL admin username')
param dbAdminUser string = 'pbadmin'

@description('PostgreSQL admin password')
@secure()
param dbAdminPassword string

@description('Container registry (leave empty to use Docker Hub)')
param containerRegistry string = ''

var prefix = 'priboard-${environment}'

// ── PostgreSQL Flexible Server ──────────────────────────────
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: '${prefix}-pg'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin:         dbAdminUser
    administratorLoginPassword: dbAdminPassword
    version:                    '16'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays:  7
      geoRedundantBackup:  'Disabled'
    }
  }
}

resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  parent: postgresServer
  name:   'prioritization'
}

// ── Container Apps Environment ──────────────────────────────
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name:     '${prefix}-logs'
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name:     '${prefix}-env'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey:  logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// ── Backend Container App ────────────────────────────────────
resource backendApp 'Microsoft.App/containerApps@2023-05-01' = {
  name:     '${prefix}-backend'
  location: location
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external:   true
        targetPort: 8000
      }
    }
    template: {
      containers: [
        {
          name:  'backend'
          image: empty(containerRegistry) ? 'ravinemalipuri/priboard-backend:latest' : '${containerRegistry}/priboard-backend:latest'
          env: [
            {
              name:  'DATABASE_URL'
              value: 'postgresql+asyncpg://${dbAdminUser}:${dbAdminPassword}@${postgresServer.properties.fullyQualifiedDomainName}:5432/prioritization'
            }
          ]
          resources: {
            cpu:    '0.5'
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

// ── Frontend Container App ───────────────────────────────────
resource frontendApp 'Microsoft.App/containerApps@2023-05-01' = {
  name:     '${prefix}-frontend'
  location: location
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external:   true
        targetPort: 80
      }
    }
    template: {
      containers: [
        {
          name:  'frontend'
          image: empty(containerRegistry) ? 'ravinemalipuri/priboard-frontend:latest' : '${containerRegistry}/priboard-frontend:latest'
          env: [
            {
              name:  'VITE_API_URL'
              value: 'https://${backendApp.properties.configuration.ingress.fqdn}'
            }
          ]
          resources: {
            cpu:    '0.25'
            memory: '0.5Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 2
      }
    }
  }
}

// ── Outputs ──────────────────────────────────────────────────
output frontendUrl string = 'https://${frontendApp.properties.configuration.ingress.fqdn}'
output backendUrl  string = 'https://${backendApp.properties.configuration.ingress.fqdn}'
output dbHost      string = postgresServer.properties.fullyQualifiedDomainName
