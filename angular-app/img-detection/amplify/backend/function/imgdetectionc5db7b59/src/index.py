from flask import Flask, app, request, jsonify
import boto3
import io
from PIL import Image
from flask_cors import CORS
import awsgi

app = Flask(__name__)
CORS(app)

BASE_ROUTE = "/items"

def convert_image_format(image_bytes, target_format='JPEG'):
    """Converts the image format using PIL."""
    image = Image.open(io.BytesIO(image_bytes))
    converted_image = io.BytesIO()
    image.save(converted_image, format=target_format)
    return converted_image.getvalue()

def show_custom_labels(model, bucket, photo, min_confidence):
    """Calls the Rekognition API to detect custom labels in the image."""
    client = boto3.client('rekognition')
    s3 = boto3.client('s3')
    response = s3.get_object(Bucket=bucket, Key=photo)
    image_bytes = response['Body'].read()
    try:
        converted_image_bytes = convert_image_format(image_bytes)
    except Exception as e:
        print(f"Error converting image format for {photo}: {e}")
        return []
    response = client.detect_custom_labels(
        Image={'Bytes': converted_image_bytes},
        MinConfidence=min_confidence,
        ProjectVersionArn=model
    )
    return response['CustomLabels']

@app.route(BASE_ROUTE + '/process_folder', methods=['POST'])
def process_folder():
    """Handles POST requests to process images in a specified folder."""
    data = request.get_json()
    
    folder_name = data.get('folder_name')
    bucket = 'img-detection-rekognition184222-dev'  # Update with your bucket name
    model = 'arn:aws:rekognition:us-east-1:217127050792:project/logoClassification/version/logoClassification.2023-08-29T17.53.45/1693313626637'
    min_confidence = 50

    prefix = f'{folder_name}/'
    s3 = boto3.client('s3')
    
    objects = s3.list_objects_v2(Bucket=bucket, Prefix=prefix)

    results = []

    for obj in objects.get('Contents', []):
        photo = obj['Key']
        custom_labels = show_custom_labels(model, bucket, photo, min_confidence)
        
        if custom_labels:
            for label in custom_labels:
                result = {
                    'image_path': f"s3://{bucket}/{photo}",
                    'image_name': photo,
                    'label_name': label['Name'],
                    'confidence': label['Confidence']
                }
                results.append(result)

    return jsonify(results)

def handler(event, context):
    return awsgi.response(app, event, context)