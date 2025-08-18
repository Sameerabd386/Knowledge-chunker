# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Add the current directory to Python's path
ENV PYTHONPATH="${PYTHONPATH}:/app"

# Set the NLTK_DATA environment variable to a local path
ENV NLTK_DATA /app/nltk_data

# Copy the backend requirements file and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download the NLTK 'punkt' model to the specified path during the build
RUN python -c "import nltk; nltk.download('punkt', download_dir='/app/nltk_data')"

# Copy the rest of the application code into the container
COPY . .

# Expose the Hugging Face default port
EXPOSE 7860

# Define the command to run your app on port 7860
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
