import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Upload, FileText, Camera } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';

interface ContractUploadProps {
  onUploadComplete: (file: any) => void;
}

export default function ContractUpload({ onUploadComplete }: ContractUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async () => {
    try {
      setIsUploading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        onUploadComplete(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraUpload = () => {
    Alert.alert(
      'Camera Upload',
      'Camera functionality will open to scan your contract.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.uploadArea}>
        <Upload size={48} color="#6B7280" strokeWidth={1.5} />
        <Text style={styles.uploadTitle}>Upload Your Contract</Text>
        <Text style={styles.uploadSubtitle}>
          Drag and drop or tap to select a file
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
            onPress={handleFileUpload}
            disabled={isUploading}
          >
            <FileText size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.uploadButtonText}>
              {isUploading ? 'Uploading...' : 'Choose File'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cameraButton}
            onPress={handleCameraUpload}
          >
            <Camera size={16} color="#1E40AF" strokeWidth={2} />
            <Text style={styles.cameraButtonText}>Scan with Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.supportedFormats}>
        <Text style={styles.supportedTitle}>Supported Formats</Text>
        <Text style={styles.supportedText}>PDF, DOC, DOCX, JPG, PNG</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  uploadArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  uploadTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  uploadButton: {
    backgroundColor: '#1E40AF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  uploadButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  cameraButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1E40AF',
  },
  cameraButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
    marginLeft: 8,
  },
  supportedFormats: {
    alignItems: 'center',
    marginTop: 16,
  },
  supportedTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 4,
  },
  supportedText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});