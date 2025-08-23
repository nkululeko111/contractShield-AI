import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { User, Settings, CreditCard, Bell, Globe, Shield, LogOut, Crown, FileText, ChartBar as BarChart3 } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

const ProfileOption = ({ icon, title, subtitle, onPress, showArrow = true }: any) => (
  <TouchableOpacity style={styles.profileOption} onPress={onPress}>
    <View style={styles.optionIconContainer}>
      {icon}
    </View>
    <View style={styles.optionContent}>
      <Text style={styles.optionTitle}>{title}</Text>
      {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
    </View>
    {showArrow && (
      <Text style={styles.optionArrow}>›</Text>
    )}
  </TouchableOpacity>
);

const SubscriptionCard = () => (
  <View style={styles.subscriptionCard}>
    <View style={styles.subscriptionHeader}>
      <Crown size={20} color="#F59E0B" strokeWidth={2} />
      <Text style={styles.subscriptionTitle}>Pro Plan</Text>
    </View>
    <Text style={styles.subscriptionDescription}>
      Unlimited contract analysis with advanced features
    </Text>
    <View style={styles.subscriptionFeatures}>
      <Text style={styles.subscriptionFeature}>• Unlimited uploads</Text>
      <Text style={styles.subscriptionFeature}>• Advanced loophole detection</Text>
      <Text style={styles.subscriptionFeature}>• Negotiation templates</Text>
      <Text style={styles.subscriptionFeature}>• Priority support</Text>
    </View>
    <TouchableOpacity style={styles.upgradeButton}>
      <Text style={styles.upgradeButtonText}>Upgrade to Pro - R199/month</Text>
    </TouchableOpacity>
  </View>
);

const UsageStats = () => (
  <View style={styles.usageCard}>
    <Text style={styles.usageTitle}>This Month's Usage</Text>
    <View style={styles.usageStats}>
      <View style={styles.usageStat}>
        <FileText size={16} color="#1E40AF" strokeWidth={2} />
        <Text style={styles.usageNumber}>12</Text>
        <Text style={styles.usageLabel}>Contracts</Text>
      </View>
      <View style={styles.usageStat}>
        <Shield size={16} color="#DC2626" strokeWidth={2} />
        <Text style={styles.usageNumber}>8</Text>
        <Text style={styles.usageLabel}>Red Flags</Text>
      </View>
      <View style={styles.usageStat}>
        <BarChart3 size={16} color="#059669" strokeWidth={2} />
        <Text style={styles.usageNumber}>R15K</Text>
        <Text style={styles.usageLabel}>Saved</Text>
      </View>
    </View>
  </View>
);

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <User size={32} color="#1E40AF" strokeWidth={2} />
        </View>
        <Text style={styles.profileName}>Thabo Mthembu</Text>
        <Text style={styles.profileEmail}>thabo.mthembu@email.com</Text>
        <View style={styles.planBadge}>
          <Text style={styles.planBadgeText}>Free Plan</Text>
        </View>
      </View>

      {/* Usage Stats */}
      <UsageStats />

      {/* Subscription Card */}
      <SubscriptionCard />

      {/* Profile Options */}
      <View style={styles.optionsSection}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <ProfileOption
          icon={<User size={20} color="#6B7280" strokeWidth={2} />}
          title="Personal Information"
          subtitle="Update your profile details"
          onPress={() => {}}
        />
        
        <ProfileOption
          icon={<CreditCard size={20} color="#6B7280" strokeWidth={2} />}
          title="Billing & Subscription"
          subtitle="Manage your plan and payment methods"
          onPress={() => {}}
        />
        
        <View style={styles.profileOption}>
          <View style={styles.optionIconContainer}>
            <Bell size={20} color="#6B7280" strokeWidth={2} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Push Notifications</Text>
            <Text style={styles.optionSubtitle}>Get alerts for contract updates</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
            thumbColor={notificationsEnabled ? '#1E40AF' : '#F3F4F6'}
          />
        </View>

        <View style={styles.profileOption}>
          <View style={styles.optionIconContainer}>
            <Shield size={20} color="#6B7280" strokeWidth={2} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Biometric Security</Text>
            <Text style={styles.optionSubtitle}>Use fingerprint to access app</Text>
          </View>
          <Switch
            value={biometricsEnabled}
            onValueChange={setBiometricsEnabled}
            trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
            thumbColor={biometricsEnabled ? '#1E40AF' : '#F3F4F6'}
          />
        </View>
        
        <ProfileOption
          icon={<Globe size={20} color="#6B7280" strokeWidth={2} />}
          title="Language Preferences"
          subtitle="English, isiZulu, Afrikaans, isiXhosa"
          onPress={() => {}}
        />
      </View>

      {/* App Settings */}
      <View style={styles.optionsSection}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <ProfileOption
          icon={<Settings size={20} color="#6B7280" strokeWidth={2} />}
          title="General Settings"
          subtitle="App preferences and defaults"
          onPress={() => {}}
        />
        
        <ProfileOption
          icon={<FileText size={20} color="#6B7280" strokeWidth={2} />}
          title="Privacy Policy"
          subtitle="How we protect your data"
          onPress={() => {}}
        />
        
        <ProfileOption
          icon={<Shield size={20} color="#6B7280" strokeWidth={2} />}
          title="Terms of Service"
          subtitle="Usage terms and conditions"
          onPress={() => {}}
        />
      </View>

      {/* Logout */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton}>
          <LogOut size={16} color="#DC2626" strokeWidth={2} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Version Info */}
      <View style={styles.versionSection}>
        <Text style={styles.versionText}>ContractShield AI v1.0.0</Text>
        <Text style={styles.versionSubtext}>Made in South Africa 🇿🇦</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#EBF4FF',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  planBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  planBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
  },
  usageCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  usageTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  usageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  usageStat: {
    alignItems: 'center',
  },
  usageNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  usageLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  subscriptionCard: {
    backgroundColor: '#FFFBEB',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#92400E',
    marginLeft: 8,
  },
  subscriptionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    marginBottom: 16,
    lineHeight: 20,
  },
  subscriptionFeatures: {
    marginBottom: 20,
  },
  subscriptionFeature: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    marginBottom: 4,
  },
  upgradeButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  optionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  profileOption: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 16,
  },
  optionArrow: {
    fontSize: 20,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
    marginLeft: 8,
  },
  versionSection: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});