import { Component, OnInit ,Injector, Injectable } from '@angular/core';
import { Storage } from 'aws-amplify';
import { API } from 'aws-amplify';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
// @Injectable({
//   providedIn: 'root'
// })
export class HomeComponent implements OnInit{  
  uploadStatus: string = '';
  selectedFile: File | null = null;
  apiResponse: any;
  selectedFiles: File[] = [];
  uniqueFolder = this.generateUniqueFolderName();
  

  constructor() { console.log(this.uniqueFolder) }
  
  ngOnInit(): void {
    this.fetchData(); // Fetch data when the component initializes
  }

  onFileSelected(event: any){
    this.selectedFiles = event.target.files;
  }
  
  async uploadFiles(event: Event): Promise<void> {
    event.preventDefault();
  
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      return;
    }
    console.log('Uploading file function executed...')
    
    const bucketName = 'img-detection-rekognition184222-dev'; // Replace with your actual bucket name
    // const uniqueFolder = this.generateUniqueFolderName();
  
    try {
      const uploadPromises = Array.from(this.selectedFiles).map(async (file) => {
        const filePath = `${this.uniqueFolder}/${file.name}`;
        try {
          await Storage.put(filePath, file, {
            bucket: bucketName,
            contentType: file.type
          });
          console.log('File uploaded successfully:', filePath);
          // You can perform any further actions after successful upload for each file
        } catch (error) {
          console.error('Error uploading file:', error);
          // Handle upload error for each file
        }
      });
  
      await Promise.all(uploadPromises);
      console.log('All files uploaded successfully!');
      // Perform any further actions after all files are uploaded
    } catch (error) {
      console.error('Error uploading files:', error);
      // Handle overall upload error
    }
  }
  

  async fetchData() {
    const folderName = this.uniqueFolder; // Replace with the actual folder name

    try {
      const response = await API.post('rekApi', '/items/process_folder', {
        body: {
          folder_name: folderName
        }
      });
      this.apiResponse = response; // Assign the API response

    } catch (error) {
      console.error('API Error:', error);
    }

  }

  generateUniqueFolderName(): string {
    // Generate a unique folder name based on your preferred logic
    const timestamp = Date.now();
    const uniqueIdentifier = Math.random().toString(36).substring(2);
    return `${timestamp}-${uniqueIdentifier}`;
  }

  onSubmit() {
    // Handle form submission if needed
  }

}
