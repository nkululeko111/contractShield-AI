import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, ActivityIndicator, Modal, TextInput, Button, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Upload, FileText, X, CheckCircle, Loader } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');

// Determine API base URL based on environment
const getAPIBaseURL = () => {
  try {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api'
        : 'http://10.0.2.2:5000/api';
    }
  } catch (e) {
    // Fallback for React Native
  }
  return 'http://localhost:5000/api'; // Default
};

const API_BASE_URL = getAPIBaseURL();

const UploadOption = ({ icon, title, description, onPress, color, loading }: any) => (
  <TouchableOpacity
    style={[styles.uploadOption, loading && styles.uploadOptionDisabled]}
    onPress={onPress}
    disabled={loading}
  >
    <View style={[styles.uploadIconContainer, { backgroundColor: color + '20' }]}>
      {loading ? <ActivityIndicator size="small" color={color} /> : icon}
    </View>
    <View style={styles.uploadContent}>
      <Text style={styles.uploadTitle}>{title}</Text>
      <Text style={styles.uploadDescription}>{description}</Text>
    </View>
  </TouchableOpacity>
);

export default function UploadScreen() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [recentUploads, setRecentUploads] = useState([]);
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    loadRecentUploads();
  }, []);

  const loadRecentUploads = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analyses/recent`);
      const data = await response.json();
      setRecentUploads(data);
    } catch (error) {
      console.log('Failed to load recent uploads:', error);
    }
  };

  if (!fontsLoaded) return null;

  const handleFileUpload = async () => {
    try {
      setIsUploading(true);

      const result: any = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success' || (!result.canceled && result.assets)) {
        const fileToUpload = result.assets ? result.assets[0] : result;
        await uploadFile(fileToUpload);
      } else {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Failed to select file. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadFile = async (file: any) => {
  try {
    console.log('=== Starting uploadFile ===');
    console.log('File object:', file);
    setSelectedFile(file);
    setUploadStatus('uploading');
    setUploadProgress(10);

    // For web: Check if it's a blob or file object
    const isWeb = typeof window !== 'undefined' && (file instanceof File || file.uri?.startsWith('blob:'));
    console.log('Is web environment:', isWeb);

    // Only verify file locally if not on web
    if (!isWeb) {
      const uri = file.uri.startsWith('file://') ? file.uri : 'file://' + file.uri;
      console.log('Normalized URI:', uri);

      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        console.log('File info:', fileInfo);
        if (!fileInfo.exists) throw new Error('File not found locally.');
      } catch (fsError: any) {
        console.warn('File system check skipped (may be on web):', fsError.message);
      }
    }

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev < 85) return prev + Math.random() * 20;
        return prev;
      });
    }, 300);

    // Prepare form data - handle both web File and React Native file objects
    const formData = new FormData();
    
    // For web with blob URI + base64 (Expo)
    if (isWeb && file.uri?.startsWith('blob:') && file.base64) {
      console.log('Converting base64 to blob for web upload');
      try {
        // The base64 field is a data URL, extract the actual base64 part
        let base64Data = file.base64;
        console.log('Raw base64 field (first 100 chars):', base64Data.substring(0, 100));
        
        // If it starts with "data:", it's a data URL
        if (base64Data.startsWith('data:')) {
          // Extract base64 part after comma
          const parts = base64Data.split(',');
          if (parts.length === 2) {
            base64Data = parts[1];
            console.log('Extracted base64 from data URL');
          }
        }
        
        // Convert base64 to blob
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: file.mimeType || 'application/octet-stream' });
        formData.append('file', blob, file.name);
        console.log('Blob created and appended to FormData, size:', blob.size);
      } catch (blobError) {
        console.error('Error converting base64:', blobError);
        throw new Error('Failed to process file for upload');
      }
    } else if (isWeb && file instanceof File) {
      // Web: use File object directly
      console.log('Using web File object');
      formData.append('file', file, file.name);
    } else {
      // React Native: use uri-based approach
      console.log('Using React Native file object');
      const uri = file.uri.startsWith('file://') ? file.uri : 'file://' + file.uri;
      formData.append('file', {
        uri: uri,
        name: file.name || 'upload_file',
        type: file.mimeType || 'application/octet-stream',
      } as any);
    }
    
    console.log('FormData prepared with file:', file.name, 'Type:', file.mimeType || file.type);

    // Send POST request
    const endpoint = `${API_BASE_URL}/analyze/upload`;
    console.log('Sending upload request to:', endpoint);
    setUploadStatus('analyzing');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
    
    clearInterval(uploadInterval);
    setUploadProgress(90);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Server error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (data.success && data.analysis) {
      console.log('Upload and analysis successful!');
      console.log('Analysis ID:', data.id);
      console.log('Analysis score:', data.analysis.score);
      setUploadProgress(100);
      setUploadStatus('complete');
      
      setTimeout(() => {
        console.log('Navigating to analysis page...');
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStatus('idle');
        setSelectedFile(null);
        router.push({
          pathname: '/analysis',
          params: {
            analysisId: data.id || 'unknown',
            analysis: JSON.stringify(data.analysis),
            fileName: file.name || 'unknown',
          },
        });
      }, 1000);
    } else {
      const errorMsg = data.error || 'Analysis did not return success';
      console.error('Analysis error:', errorMsg);
      throw new Error(errorMsg || 'Unable to extract text from file. Make sure it is supported (PDF, DOCX, or Image).');
    }
  } catch (error: any) {
    console.error('=== Error during upload ===');
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    Alert.alert('Analysis Failed', error.message || 'Could not analyze the file.');
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStatus('idle');
    setSelectedFile(null);
  }
};

  const analyzeText = async () => {
    if (!pastedText.trim()) {
      Alert.alert('No text', 'Please paste your contract text.');
      return;
    }
    setTextModalVisible(false);
    try {
      setIsUploading(true);
      setUploadStatus('analyzing');
      setUploadProgress(20);

      const response = await fetch(`${API_BASE_URL}/analyze/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedText }),
      });

      setUploadProgress(80);
      const data = await response.json();

      if (data.success) {
        setUploadProgress(100);
        setUploadStatus('complete');
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setUploadStatus('idle');
          setPastedText('');
          router.push({
            pathname: '/analysis',
            params: {
              analysisId: data.id,
              analysis: JSON.stringify(data.analysis),
              fileName: 'Text Input',
            },
          });
        }, 1000);
      } else {
        throw new Error(data.error || 'Text analysis failed.');
      }
    } catch (error: any) {
      console.error('Text analysis failed:', error);
      Alert.alert('Analysis Failed', error.message || 'Could not analyze the text.');
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatus('idle');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Contract</Text>
        <Text style={styles.headerSubtitle}>Choose how you'd like to upload your contract for AI analysis</Text>
      </View>

      {!isUploading ? (
        <>
          <View style={styles.uploadSection}>
            <UploadOption
              icon={<Upload size={24} color="#1E40AF" />}
              title="Upload Document"
              description="Select PDF, DOC, or image files from your device"
              onPress={handleFileUpload}
              color="#1E40AF"
              loading={isUploading}
            />

            <UploadOption
              icon={<FileText size={24} color="#EA580C" />}
              title="Paste Contract Text"
              description="Paste or type contract text directly for analysis"
              onPress={() => setTextModalVisible(true)}
              color="#EA580C"
              loading={isUploading}
            />
          </View>

          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>Upload Tips</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tip}>• Ensure document is clear and readable</Text>
              <Text style={styles.tip}>• PDF and DOC files work best</Text>
              <Text style={styles.tip}>• All pages must be included for complete analysis</Text>
              <Text style={styles.tip}>• Images will use OCR to extract text</Text>
              <Text style={styles.tip}>• Text input should be accurate and complete</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.uploadingContainer}>
          {/* File Preview */}
          {selectedFile && (
            <View style={styles.filePreviewCard}>
              <View style={styles.filePreviewIcon}>
                <FileText size={32} color="#1E40AF" strokeWidth={1.5} />
              </View>
              <View style={styles.filePreviewContent}>
                <Text style={styles.filePreviewName}>{selectedFile.name}</Text>
                <Text style={styles.filePreviewSize}>
                  {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Size unknown'}
                </Text>
              </View>
            </View>
          )}

          {/* Status Messages */}
          <View style={styles.statusContainer}>
            {uploadStatus === 'uploading' && (
              <>
                <View style={styles.statusIconUploading}>
                  <Loader size={32} color="#1E40AF" strokeWidth={2} />
                </View>
                <Text style={styles.statusTitle}>Uploading File...</Text>
                <Text style={styles.statusSubtitle}>Your document is being uploaded to our server</Text>
              </>
            )}

            {uploadStatus === 'analyzing' && (
              <>
                <View style={styles.statusIconAnalyzing}>
                  <Loader size={32} color="#EA580C" strokeWidth={2} />
                </View>
                <Text style={styles.statusTitle}>Analyzing Contract...</Text>
                <Text style={styles.statusSubtitle}>Our AI is extracting and analyzing the document</Text>
              </>
            )}

            {uploadStatus === 'complete' && (
              <>
                <View style={styles.statusIconComplete}>
                  <CheckCircle size={32} color="#059669" strokeWidth={2} />
                </View>
                <Text style={styles.statusTitle}>Analysis Complete!</Text>
                <Text style={styles.statusSubtitle}>Redirecting to results...</Text>
              </>
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(uploadProgress)}% Complete</Text>
          </View>
        </View>
      )}

      <Modal
        visible={textModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTextModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Paste Contract Text</Text>
              <TouchableOpacity onPress={() => setTextModalVisible(false)}>
                <X size={24} color="#1F2937" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Paste contract text here..."
              value={pastedText}
              onChangeText={setPastedText}
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setTextModalVisible(false);
                  setPastedText('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.analyzeButton, !pastedText.trim() && styles.analyzeButtonDisabled]}
                onPress={analyzeText}
                disabled={!pastedText.trim()}
              >
                <Text style={styles.analyzeButtonText}>Analyze</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 24, fontFamily: 'Inter-Bold', color: '#1F2937', marginBottom: 8 },
  headerSubtitle: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#6B7280', lineHeight: 20 },
  uploadSection: { padding: 20 },
  uploadOption: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  uploadOptionDisabled: { opacity: 0.6 },
  uploadIconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  uploadContent: { flex: 1 },
  uploadTitle: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#1F2937', marginBottom: 4 },
  uploadDescription: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#6B7280', lineHeight: 20 },
  
  uploadingContainer: { 
    padding: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  
  filePreviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    elevation: 2,
  },
  filePreviewIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  filePreviewContent: { flex: 1 },
  filePreviewName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  filePreviewSize: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  
  statusContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    width: '100%',
  },
  
  statusIconUploading: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  
  statusIconAnalyzing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  
  statusIconComplete: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  
  statusTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  
  statusSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  
  progressSection: { 
    padding: 20, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginBottom: 20, 
    alignItems: 'center', 
    elevation: 2,
    width: '100%',
  },
  progressBar: { width: '100%', height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#1E40AF', borderRadius: 4 },
  progressText: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#6B7280' },
  
  tipsSection: { padding: 20, backgroundColor: '#FEF3C7', marginHorizontal: 20, borderRadius: 12, marginBottom: 40 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter-Bold', color: '#1F2937', marginBottom: 12 },
  tipsList: { marginTop: 12 },
  tip: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#92400E', lineHeight: 20, marginBottom: 4 },
  
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000040' },
  modalContent: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#1F2937' },
  textInput: { 
    borderColor: '#D1D5DB', 
    borderWidth: 1, 
    borderRadius: 8, 
    minHeight: 150, 
    padding: 12, 
    textAlignVertical: 'top', 
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1F2937',
  },
  modalButtons: { 
    flexDirection: 'row', 
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  analyzeButton: {
    backgroundColor: '#1E40AF',
  },
  analyzeButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  analyzeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
});
