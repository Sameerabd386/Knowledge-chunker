# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Add the current directory to Python's path
ENV PYTHONPATH="${PYTHONPATH}:/app"

# Create a directory for NLTK data and set the environment variable
RUN mkdir -p /app/nltk_data
ENV NLTK_DATA /app/nltk_data

# Copy the backend requirements file and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 7860

# Define the command to run your app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
