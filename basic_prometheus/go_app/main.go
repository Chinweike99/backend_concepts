package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var httpRequestsTotal = prometheus.NewCounterVec(
	prometheus.CounterOpts{
		Name: "http_requests_total",
		Help: "Total number of HTTP requests",
	},
	[]string{"method", "endpoint", "status"},
)

var activeRequests = prometheus.NewGauge(
	prometheus.GaugeOpts{
		Name: "active_requests",
		Help: "Number of HTTP requests currently being processed",
	},
)

var httpRequestDuration = prometheus.NewHistogramVec(
	prometheus.HistogramOpts{
		Name:    "http_request_duration_seconds",
		Help:    "HTTP request duration in seconds",
		Buckets: prometheus.DefBuckets,
	},
	[]string{"method", "endpoint", "status"},
)

type statusResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (w *statusResponseWriter) WriteHeader(code int) {
	w.statusCode = code
	w.ResponseWriter.WriteHeader(code)
}

func (w *statusResponseWriter) Write(body []byte) (int, error) {
	if w.statusCode == 0 {
		w.statusCode = http.StatusOK
	}
	return w.ResponseWriter.Write(body)
}

func metricsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/metrics" {
			next.ServeHTTP(w, r)
			return
		}

		start := time.Now()
		activeRequests.Inc()

		sw := &statusResponseWriter{
			ResponseWriter: w,
		}

		next.ServeHTTP(sw, r)

		duration := time.Since(start).Seconds()
		activeRequests.Dec()

		status := strconv.Itoa(sw.statusCode)

		httpRequestsTotal.WithLabelValues(
			r.Method,
			r.URL.Path,
			status,
		).Inc()

		httpRequestDuration.WithLabelValues(
			r.Method,
			r.URL.Path,
			status,
		).Observe(duration)
	})
}

func main() {
	prometheus.MustRegister(httpRequestsTotal)
	prometheus.MustRegister(activeRequests)
	prometheus.MustRegister(httpRequestDuration)

	mux := http.NewServeMux()

	// Health endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "OK")
	})

	// Root endpoint
	// mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
	// 	// Simulate some work with random delay
	// 	time.Sleep(time.Duration(rand.Intn(50)) * time.Millisecond)
	// 	fmt.Fprintln(w, "Hello from Go!")
	// })

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Check if it's the root path
		if r.URL.Path == "/" {
			// Simulate some work with random delay
			time.Sleep(time.Duration(rand.Intn(50)) * time.Millisecond)
			fmt.Fprintln(w, "Hello from Go!")
			return
		}
		
		// All other paths return 404
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintf(w, "404 Not Found: %s\n", r.URL.Path)
	})

	// Users endpoint
	mux.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
		// Simulate database query
		time.Sleep(time.Duration(rand.Intn(100)) * time.Millisecond)
		
		// Randomly return errors (10% chance)
		if rand.Intn(10) == 0 {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintln(w, "Database error")
			return
		}
		
		fmt.Fprintln(w, "Users endpoint - List of users")
	})

	// Orders endpoint
	mux.HandleFunc("/orders", func(w http.ResponseWriter, r *http.Request) {
		// Simulate slower endpoint
		time.Sleep(time.Duration(rand.Intn(200)) * time.Millisecond)
		fmt.Fprintln(w, "Orders endpoint - List of orders")
	})

	// Metrics endpoint
	mux.Handle("/metrics", promhttp.Handler())

	handler := metricsMiddleware(mux)

	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}