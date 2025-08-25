FROM python:3.11-alpine

# Install system dependencies for OpenCV
RUN apk update && apk add --no-cache \
    opencv \
    opencv-dev \
    libstdc++ \
    libgcc \
    musl

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Remove opencv-python from requirements since we're using system OpenCV
RUN grep -v "opencv-python" requirements.txt > requirements_no_opencv.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements_no_opencv.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8001

# Command to run the application
CMD ["python", "main.py"]