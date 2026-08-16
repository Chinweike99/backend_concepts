#!/bin/bash
# test-traffic.sh

while true; do
  # Normal traffic
  curl -s -o /dev/null http://localhost:8080/users
  curl -s -o /dev/null http://localhost:8080/orders
  
  # Simulate some errors (status 404)
  curl -s -o /dev/null http://localhost:8080/notfound
  
  # Simulate database load (latency)
  curl -s -o /dev/null http://localhost:8080/?sleep=200
  
  sleep 0.1
done
