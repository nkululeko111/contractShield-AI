import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Camera, Upload, FileText, Image as ImageIcon, Smartphone } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

const { width } = Dimensions.get('window');

const UploadOption = ({ icon, title, description, onPress, color }: any) => (
  <TouchableOpacity style={styles.uploadOption} onPress={onPress}>
    <View style={[styles.uploadIconContainer, { backgroundColor: color + '20' }]}>
      {icon}
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

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleUpload = (method: string) => {
    setIsUploading(true);
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setUploadProgress(0);
        Alert.alert(
          'Upload Complete!',
          'Your contract has been uploaded and analysis will begin shortly.',
          [{ text: 'View Analysis', onPress: () => {} }]
        );
      }
    }, 200);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Contract</Text>
        <Text style={styles.headerSubtitle}>
          Choose how you'd like to upload your contract for AI analysis
        </Text>
      </View>

      {/* Upload Options */}
      <View style={styles.uploadSection}>
        <UploadOption
          icon={<Upload size={24} color="#1E40AF" strokeWidth={2} />}
          title="Upload Document"
          description="Select PDF, DOC, or image files from your device"
          onPress={() => handleUpload('file')}
          color="#1E40AF"
        />

        <UploadOption
          icon={<Camera size={24} color="#059669" strokeWidth={2} />}
          title="Scan with Camera"
          description="Take a photo of your paper contract for instant analysis"
          onPress={() => handleUpload('camera')}
          color="#059669"
        />

        <UploadOption
          icon={<Smartphone size={24} color="#7C3AED" strokeWidth={2} />}
          title="WhatsApp Upload"
          description="Send your contract via WhatsApp for offline analysis"
          onPress={() => handleUpload('whatsapp')}
          color="#7C3AED"
        />

        <UploadOption
          icon={<FileText size={24} color="#EA580C" strokeWidth={2} />}
          title="Type Contract Text"
          description="Paste or type contract text directly for quick review"
          onPress={() => handleUpload('text')}
          color="#EA580C"
        />
      </View>

      {/* Upload Progress */}
      {isUploading && (
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Analyzing Contract...</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{uploadProgress}% Complete</Text>
        </View>
      )}

      {/* Recent Uploads */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Uploads</Text>
        
        <TouchableOpacity style={styles.recentItem}>
          <View style={styles.recentIconContainer}>
            <FileText size={20} color="#1E40AF" strokeWidth={2} />
          </View>
          <View style={styles.recentContent}>
            <Text style={styles.recentTitle}>Employment Contract - ABC Corp</Text>
            <Text style={styles.recentDate}>Analyzed 2 hours ago</Text>
            <View style={styles.recentTags}>
              <View style={[styles.tag, { backgroundColor: '#DC2626' }]}>
                <Text style={styles.tagText}>3 Red Flags</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: '#059669' }]}>
                <Text style={styles.tagText}>2 Loopholes</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.recentItem}>
          <View style={styles.recentIconContainer}>
            <FileText size={20} color="#1E40AF" strokeWidth={2} />
          </View>
          <View style={styles.recentContent}>
            <Text style={styles.recentTitle}>Rental Agreement - CBD Apartment</Text>
            <Text style={styles.recentDate}>Analyzed yesterday</Text>
            <View style={styles.recentTags}>
              <View style={[styles.tag, { backgroundColor: '#059669' }]}>
                <Text style={styles.tagText}>Safe to Sign</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Upload Tips</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tip}>• Ensure document is clear and readable</Text>
          <Text style={styles.tip}>• PDF and DOC files work best</Text>
          <Text style={styles.tip}>• Photos should be well-lit and straight</Text>
          <Text style={styles.tip}>• All pages must be included for complete analysis</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  uploadSection: {
    padding: 20,
  },
  uploadOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  uploadContent: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  uploadDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  progressSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1E40AF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  recentSection: {
    padding: 20,
  },
  recentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recentIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#EBF4FF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  recentDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  recentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  tipsSection: {
    padding: 20,
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 40,
  },
  tipsList: {
    marginTop: 12,
  },
  tip: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 20,
    marginBottom: 4,
  },
});