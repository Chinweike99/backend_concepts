# Stage 1
FROM golang:1.25 AS builder

WORKDIR /app

COPY go.mod .

COPY . .

# RUN go build -o server
RUN CGO_ENABLED=0 GOOS=linux go build -o server

# Stage 2
# FROM alpine:latest
FROM scratch

WORKDIR /app

COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]