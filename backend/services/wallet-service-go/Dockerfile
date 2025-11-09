FROM golang:1.22-alpine AS build
WORKDIR /app
COPY go.mod ./
COPY main.go ./
RUN go build -o wallet-service

FROM alpine:3.19
WORKDIR /app
COPY --from=build /app/wallet-service ./wallet-service
EXPOSE 8003
ENTRYPOINT ["/app/wallet-service"]