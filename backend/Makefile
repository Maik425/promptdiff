.PHONY: run build migrate test lint tidy

run:
	go run cmd/server/main.go

build:
	go build -o bin/promptdiff cmd/server/main.go

migrate:
	psql $(DATABASE_URL) -f migrations/001_init.sql

test:
	go test -race ./...

lint:
	golangci-lint run ./...

tidy:
	go mod tidy
