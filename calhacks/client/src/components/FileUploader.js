import React, { useState } from "react";

export const FileUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      // You can perform actions with the selected file here
      // For example, you can send it to your backend for processing.
      console.log("Selected file:", selectedFile);
    }
  };

  return (
    <div>
      <h1>Upload a File</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Process Document</button>
    </div>
  );
};
