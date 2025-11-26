# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Working directory in the container
WORKDIR /app

# Copy the requirement file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Run the app
# Run the app
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
