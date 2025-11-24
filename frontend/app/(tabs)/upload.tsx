import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, ActivityIndicator, Modal, TextInput, Button,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Upload, FileText } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'http://10.0.2.2:5000/api';

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

  const simulateProgress = () => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 90) {
        progress = 90;
        clearInterval(interval);
      }
      setUploadProgress(progress);
    }, 200);
    return interval;
  };

  const handleFileUpload = async () => {
    try {
      const progressInterval = simulateProgress();

      const result: any = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        await uploadFile(result);
      } else {
        clearInterval(progressInterval);
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
    console.log('Starting uploadFile with file:', file);

    // Ensure the URI starts with 'file://'
    const uri = file.uri.startsWith('file://') ? file.uri : 'file://' + file.uri;
    console.log('Normalized URI:', uri);

    // Verify the file exists locally
    const fileInfo = await FileSystem.getInfoAsync(uri);
    console.log('File info:', fileInfo);
    if (!fileInfo.exists) throw new Error('File not found locally.');

    // Prepare form data
    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      name: file.name || 'upload_file',
      type: file.mimeType || 'application/octet-stream',
    } as any);
    console.log('FormData prepared:', formData);

    // Send POST request
    console.log('Sending upload request to:', `http://localhost:5000/api/analyze/upload`);
    const response = await fetch(`${API_BASE_URL}/analyze/upload`, {
      method: 'POST',
      body: formData,
      // Do NOT set 'Content-Type' header manually
    });
    console.log('Response status:', response.status);

    const data = await response.json();
    console.log('Response data:', data);

    if (response.ok && data.success) {
      console.log('Upload and analysis successful:', data);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        router.push({
          pathname: '/analysis',
          params: {
            analysisId: data.id,
            analysis: JSON.stringify(data.analysis),
            fileName: file.name,
          },
        });
      }, 500);
    } else {
      console.log('Server returned an error:', data.error);
      throw new Error(data.error || 'Unable to extract text from file. Make sure it is supported (PDF, DOCX, or Image).');
    }
  } catch (error: any) {
    console.log('Error during upload:', error);
    Alert.alert('Analysis Failed', error.message || 'Could not analyze the file.');
    setIsUploading(false);
    setUploadProgress(0);
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
      const progressInterval = simulateProgress();

      const response = await fetch(`${API_BASE_URL}/analyze/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedText }),
      });

      const data = await response.json();

      if (data.success) {
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          router.push({
            pathname: '/analysis',
            params: {
              analysisId: data.id,
              analysis: JSON.stringify(data.analysis),
              fileName: 'Text Input',
            },
          });
        }, 500);
      } else {
        throw new Error(data.error || 'Text analysis failed.');
      }

      clearInterval(progressInterval);
    } catch (error: any) {
      console.error('Text analysis failed:', error);
      Alert.alert('Analysis Failed', error.message || 'Could not analyze the text.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Contract</Text>
        <Text style={styles.headerSubtitle}>Choose how you'd like to upload your contract for AI analysis</Text>
      </View>

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

      {isUploading && (
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Analyzing Contract...</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(uploadProgress)}% Complete</Text>
        </View>
      )}

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

      <Modal
        visible={textModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTextModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Paste Contract Text</Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Paste contract text here..."
              value={pastedText}
              onChangeText={setPastedText}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setTextModalVisible(false)} />
              <Button title="Analyze" onPress={analyzeText} />
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
  progressSection: { padding: 20, backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 12, marginBottom: 20, alignItems: 'center', elevation: 2 },
  progressTitle: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#1F2937', marginBottom: 16 },
  progressBar: { width: '100%', height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#1E40AF', borderRadius: 4 },
  progressText: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#6B7280' },
  tipsSection: { padding: 20, backgroundColor: '#FEF3C7', marginHorizontal: 20, borderRadius: 12, marginBottom: 40 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter-Bold', color: '#1F2937', marginBottom: 12 },
  tipsList: { marginTop: 12 },
  tip: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#92400E', lineHeight: 20, marginBottom: 4 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000080' },
  modalContent: { backgroundColor: '#fff', width: '90%', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 16, fontFamily: 'Inter-SemiBold', marginBottom: 12 },
  textInput: { borderColor: '#D1D5DB', borderWidth: 1, borderRadius: 8, minHeight: 150, padding: 10, textAlignVertical: 'top', marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
});
