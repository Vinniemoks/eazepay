import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FAQ_DATA = [
  {
    question: 'How do I create a virtual card?',
    answer: 'Go to Cards tab, tap the + button, select currency and amount, then confirm.',
  },
  {
    question: 'How do I top up my wallet?',
    answer: 'Tap Top Up on home screen, enter amount, and complete M-Pesa payment.',
  },
  {
    question: 'Is biometric payment secure?',
    answer: 'Yes! We use bank-level encryption and your biometric data never leaves your device.',
  },
  {
    question: 'What currencies are supported?',
    answer: 'We support KES, USD, EUR, and GBP for virtual cards.',
  },
  {
    question: 'How long does card creation take?',
    answer: 'Virtual cards are created instantly and ready to use immediately.',
  },
];

export const HelpScreen = ({ navigation }: any) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@eazepay.com');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+254700000000');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/254700000000');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Contact Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        
        <TouchableOpacity style={styles.contactItem} onPress={handleCallSupport}>
          <View style={[styles.contactIcon, { backgroundColor: '#10B98120' }]}>
            <Icon name="phone" size={24} color="#10B981" />
          </View>
          <View style={styles.contactContent}>
            <Text style={styles.contactTitle}>Call Us</Text>
            <Text style={styles.contactSubtitle}>+254 700 000 000</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={handleContactSupport}>
          <View style={[styles.contactIcon, { backgroundColor: '#6366F120' }]}>
            <Icon name="email" size={24} color="#6366F1" />
          </View>
          <View style={styles.contactContent}>
            <Text style={styles.contactTitle}>Email Us</Text>
            <Text style={styles.contactSubtitle}>support@eazepay.com</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={handleWhatsApp}>
          <View style={[styles.contactIcon, { backgroundColor: '#10B98120' }]}>
            <Icon name="whatsapp" size={24} color="#10B981" />
          </View>
          <View style={styles.contactContent}>
            <Text style={styles.contactTitle}>WhatsApp</Text>
            <Text style={styles.contactSubtitle}>Chat with us</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#CBD5E1" />
        </TouchableOpacity>
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        {FAQ_DATA.map((faq, index) => (
          <TouchableOpacity
            key={index}
            style={styles.faqItem}
            onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Icon
                name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#64748B"
              />
            </View>
            {expandedIndex === index && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Links</Text>
        
        <TouchableOpacity style={styles.linkItem}>
          <Icon name="file-document" size={20} color="#6366F1" />
          <Text style={styles.linkText}>User Guide</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.linkItem}>
          <Icon name="video" size={20} color="#6366F1" />
          <Text style={styles.linkText}>Video Tutorials</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.linkItem}>
          <Icon name="shield-check" size={20} color="#6366F1" />
          <Text style={styles.linkText}>Security Tips</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  faqItem: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
    lineHeight: 20,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  linkText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
  },
});
