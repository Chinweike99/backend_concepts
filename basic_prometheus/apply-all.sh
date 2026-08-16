#!/bin/bash

echo "🚀 Deploying Monitoring Stack to Kubernetes..."

# 1. Create namespace
echo "📁 Creating namespace..."
kubectl apply -f namespace.yaml

# 2. Deploy Go Application
echo "🔄 Deploying Go Application..."
kubectl apply -f go-app/configmap.yaml
kubectl apply -f go-app/deployment.yaml
kubectl apply -f go-app/service.yaml

# 3. Deploy Prometheus
echo "📊 Deploying Prometheus..."
kubectl apply -f prometheus/configmap.yaml
kubectl apply -f prometheus/rules.yaml
kubectl apply -f prometheus/deployment.yaml
kubectl apply -f prometheus/service.yaml

# 4. Deploy Alertmanager
echo "🔔 Deploying Alertmanager..."
kubectl apply -f alertmanager/configmap.yaml
kubectl apply -f alertmanager/deployment.yaml
kubectl apply -f alertmanager/service.yaml

# 5. Deploy Grafana
echo "📈 Deploying Grafana..."
kubectl apply -f grafana/datasource-configmap.yaml
kubectl apply -f grafana/dashboard-configmap.yaml
kubectl apply -f grafana/deployment.yaml
kubectl apply -f grafana/service.yaml

echo "✅ Deployment complete!"

echo ""
echo "📋 Checking status..."
kubectl get pods -n monitoring
kubectl get svc -n monitoring

echo ""
echo "🌐 Access services:"
echo "  - Prometheus:  kubectl port-forward -n monitoring svc/prometheus-service 9090:9090"
echo "  - Alertmanager: kubectl port-forward -n monitoring svc/alertmanager-service 9093:9093"
echo "  - Grafana:     kubectl port-forward -n monitoring svc/grafana-service 3000:3000"
echo "  - Grafana NodePort: $(kubectl get svc -n monitoring grafana-service -o jsonpath='{.spec.ports[0].nodePort}')"