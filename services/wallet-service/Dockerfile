FROM golang:1.19-alpine
WORKDIR /app
COPY . .
RUN go build -o wallet-service .
EXPOSE 8003
CMD ["./wallet-service"]
