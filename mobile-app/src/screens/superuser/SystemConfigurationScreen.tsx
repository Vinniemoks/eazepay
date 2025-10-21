import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';

export const SystemConfigurationScreen = () => {
  const [selectedTab, setSelectedTab] = useState<
    'general' | 'transactions' | 'integrations' | 'security' | 'notifications'
  >('general');

  const [config, setConfig] = useState({
    platformName: 'Eazepay',
    supportEmail: 'support@eazepay.com',
    supportPhone: '+254700000000',
    maintenanceMode: false,
    sendFee: 50,
    withdrawalFee: 100,
    depositFee: 0,
    dailyLimit: 100000,
    monthlyLimit: 1000000,
    minAmount: 10,
    maxAmount: 500000,
    mpesaEnabled: true,
    bankTransferEnabled: true,
    sessionTimeout: 15,
    require2FA: true,
    passwordMinLength: 8,
  });

  const handleSave = () => {
    Alert.alert('Success', 'Configuration saved successfully', [
      {
        text: 'OK',
        onPress: () => {
          // TODO: Call save config API
        },
      },
    ]);
  };

  const renderGeneralTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Platform Settings</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Platform Name</Text>
        <TextInput
          style={styles.input}
          value={config.platformName}
          onChangeText={(text) => setConfig({ ...config, platformName: text })}
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Support Email</Text>
        <TextInput
          style={styles.input}
          value={config.supportEmail}
          onChangeText={(text) => setConfig({ ...config, supportEmail: text })}
          keyboardType="email-address"
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Support Phone</Text>
        <TextInput
          style={styles.input}
          value={config.supportPhone}
          onChangeText={(text) => setConfig({ ...config, supportPhone: text })}
          keyboardType="phone-pad"
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.switchGroup}>
        <View>
          <Text style={styles.switchLabel}>Maintenance Mode</Text>
          <Text style={styles.switchDescription}>Disable user access for maintenance</Text>
        </View>
        <Switch
          value={config.maintenanceMode}
          onValueChange={(value) => setConfig({ ...config, maintenanceMode: value })}
          trackColor={{ false: '#334155', true: '#667eea' }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );

  const renderTransactionsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Transaction Fees</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Send Money Fee (KES)</Text>
        <TextInput
          style={styles.input}
          value={config.sendFee.toString()}
          onChangeText={(text) => setConfig({ ...config, sendFee: parseInt(text) || 0 })}
          keyboardType="numeric"
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Withdrawal Fee (KES)</Text>
        <TextInput
          style={styles.input}
          value={config.withdrawalFee.toString()}
          onChangeText={(text) => setConfig({ ...config, withdrawalFee: parseInt(text) || 0 })}
          keyboardType="numeric"
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Deposit Fee (KES)</Text>
        <TextInput
          style={styles.input}
          value={config.depositFee.toString()}
          onChangeText={(text) => setConfig({ ...config, depositFee: parseInt(text) || 0 })}
          keyboardType="numeric"
          placeholderTextColor="#64748b"
        />
      </View>

      <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Transaction Limits</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Daily Limit (KES)</Text>
        <TextInput
          style={styles.input}
          value={config.dailyLimit.toString()}
          onChangeText={(text) => setConfig({ ...config, dailyLimit: parseInt(text) || 0 })}
          keyboardType="numeric"
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Monthly Limit (KES)</Text>
        <TextInput
          style={styles.input}
          value={config.monthlyLimit.toString()}
          onChangeText={(text) => setConfig({ ...config, monthlyLimit: parseInt(text) || 0 })}
          keyboardType="numeric"
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Minimum Amount (KES)</Text>
        <TextInput
          style={styles.input}
          value={config.minAmount.toString()}
          onChangeText={(text) => setConfig({ ...config, minAmount: parseInt(text) || 0 })}
          keyboardType="numeric"
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Maximum Amount (KES)</Text>
        <TextInput
          style={styles.input}
          value={config.maxAmount.toString()}
          onChangeText={(text) => setConfig({ ...config, maxAmount: parseInt(text) || 0 })}
          keyboardType="numeric"
          placeholderTextColor="#64748b"
        />
      </View>
    </View>
  );

  const renderIntegrationsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Payment Integrations</Text>

      <View style={styles.switchGroup}>
        <View>
          <Text style={styles.switchLabel}>M-Pesa Integration</Text>
          <Text style={styles.switchDescription}>Enable M-Pesa payments</Text>
        </View>
        <Switch
          value={config.mpesaEnabled}
          onValueChange={(value) => setConfig({ ...config, mpesaEnabled: value })}
          trackColor={{ false: '#334155', true: '#667eea' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.switchGroup}>
        <View>
          <Text style={styles.switchLabel}>Bank Transfer</Text>
          <Text style={styles.switchDescription}>Enable bank transfers</Text>
        </View>
        <Switch
          value={config.bankTransferEnabled}
          onValueChange={(value) => setConfig({ ...config, bankTransferEnabled: value })}
          trackColor={{ false: '#334155', true: '#667eea' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ℹ️ Integration credentials are managed separately in the secure vault
        </Text>
      </View>
    </View>
  );

  const renderSecurityTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Security Settings</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Session Timeout (minutes)</Text>
        <TextInput
          style={styles.input}
          value={config.sessionTimeout.toString()}
          onChangeText={(text) => setConfig({ ...config, sessionTimeout: parseInt(text) || 0 })}
          keyboardType="numeric"
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password Minimum Length</Text>
        <TextInput
          style={styles.input}
          value={config.passwordMinLength.toString()}
          onChangeText={(text) =>
            setConfig({ ...config, passwordMinLength: parseInt(text) || 0 })
          }
          keyboardType="numeric"
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.switchGroup}>
        <View>
          <Text style={styles.switchLabel}>Require 2FA</Text>
          <Text style={styles.switchDescription}>Require two-factor authentication</Text>
        </View>
        <Switch
          value={config.require2FA}
          onValueChange={(value) => setConfig({ ...config, require2FA: value })}
          trackColor={{ false: '#334155', true: '#667eea' }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Notification Settings</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          📧 Email and SMS notification templates can be customized in the templates section
        </Text>
      </View>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Manage Email Templates</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Manage SMS Templates</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Push Notification Settings</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'general' && styles.tabActive]}
          onPress={() => setSelectedTab('general')}
        >
          <Text style={[styles.tabText, selectedTab === 'general' && styles.tabTextActive]}>
            General
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'transactions' && styles.tabActive]}
          onPress={() => setSelectedTab('transactions')}
        >
          <Text style={[styles.tabText, selectedTab === 'transactions' && styles.tabTextActive]}>
            Transactions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'integrations' && styles.tabActive]}
          onPress={() => setSelectedTab('integrations')}
        >
          <Text style={[styles.tabText, selectedTab === 'integrations' && styles.tabTextActive]}>
            Integrations
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'security' && styles.tabActive]}
          onPress={() => setSelectedTab('security')}
        >
          <Text style={[styles.tabText, selectedTab === 'security' && styles.tabTextActive]}>
            Security
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'notifications' && styles.tabActive]}
          onPress={() => setSelectedTab('notifications')}
        >
          <Text style={[styles.tabText, selectedTab === 'notifications' && styles.tabTextActive]}>
            Notifications
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Tab Content */}
      <ScrollView style={styles.content}>
        {selectedTab === 'general' && renderGeneralTab()}
        {selectedTab === 'transactions' && renderTransactionsTab()}
        {selectedTab === 'integrations' && renderIntegrationsTab()}
        {selectedTab === 'security' && renderSecurityTab()}
        {selectedTab === 'notifications' && renderNotificationsTab()}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Configuration</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#667eea',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  sectionTitleSpaced: {
    marginTop: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 13,
    color: '#94a3b8',
  },
  infoBox: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  saveContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  saveButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
