import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Info, Zap } from 'lucide-react-native';

interface AnalysisItem {
  type: 'red-flag' | 'loophole' | 'safe' | 'info';
  title: string;
  description: string;
  details: string;
  severity: 'high' | 'medium' | 'low';
}

interface AnalysisResultsProps {
  results: AnalysisItem[];
  contractTitle: string;
  score: number;
}

export default function AnalysisResults({ results, contractTitle, score }: AnalysisResultsProps) {
  const getIcon = (type: string, severity: string) => {
    const color = severity === 'high' ? '#DC2626' : severity === 'medium' ? '#F59E0B' : '#059669';
    
    switch (type) {
      case 'red-flag':
        return <AlertTriangle size={20} color={color} strokeWidth={2} />;
      case 'loophole':
        return <Zap size={20} color={color} strokeWidth={2} />;
      case 'safe':
        return <CheckCircle size={20} color={color} strokeWidth={2} />;
      default:
        return <Info size={20} color={color} strokeWidth={2} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#DC2626';
      case 'medium': return '#F59E0B';
      case 'low': return '#059669';
      default: return '#1E40AF';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.contractTitle}>{contractTitle}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Safety Score</Text>
          <Text style={[styles.score, { color: getSeverityColor(score >= 80 ? 'low' : score >= 60 ? 'medium' : 'high') }]}>
            {score}/100
          </Text>
        </View>
      </View>

      {/* Results */}
      <View style={styles.resultsContainer}>
        {results.map((item, index) => (
          <View key={index} style={[styles.resultCard, { borderLeftColor: getSeverityColor(item.severity) }]}>
            <View style={styles.resultHeader}>
              <View style={[styles.resultIconContainer, { backgroundColor: getSeverityColor(item.severity) + '20' }]}>
                {getIcon(item.type, item.severity)}
              </View>
              <View style={styles.resultContent}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultDescription}>{item.description}</Text>
              </View>
            </View>
            <Text style={styles.resultDetails}>{item.details}</Text>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.primaryAction}>
          <Text style={styles.primaryActionText}>Generate Counter-Offer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>Consult Lawyer (R500/hour)</Text>
        </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contractTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  score: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  resultsContainer: {
    padding: 20,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 16,
  },
  resultDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  actionContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  primaryAction: {
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  primaryActionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  secondaryAction: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E40AF',
  },
  secondaryActionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
  },
});