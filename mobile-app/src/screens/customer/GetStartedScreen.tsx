import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const GetStartedScreen = () => {
    const navigation = useNavigation();
    const [language, setLanguage] = useState<'en' | 'sw'>('en');

    const handleCreateAccount = () => {
        navigation.navigate('Register');
    };

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'sw' : 'en');
    };

    const text = {
        en: {
            welcome: 'Welcome to Eazepay',
            subtitle: 'Secure mobile payments made easy',
            createAccount: 'Create Account',
            login: 'Login',
            language: 'Language: English',
        },
        sw: {
            welcome: 'Karibu Eazepay',
            subtitle: 'Malipo ya simu salama na rahisi',
            createAccount: 'Fungua Akaunti',
            login: 'Ingia',
            language: 'Lugha: Kiswahili',
        },
    };

    const t = text[language];

    return (
        <View style={styles.container}>
            {/* Language Selector */}
            <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
                <Text style={styles.languageText}>{t.language}</Text>
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoContainer}>
                <View style={styles.logoPlaceholder}>
                    <Text style={styles.logoText}>Eazepay</Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title}>{t.welcome}</Text>
                <Text style={styles.subtitle}>{t.subtitle}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleCreateAccount}
                >
                    <Text style={styles.primaryButtonText}>{t.createAccount}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleLogin}
                >
                    <Text style={styles.secondaryButtonText}>{t.login}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    languageButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    languageText: {
        color: '#667eea',
        fontSize: 14,
        fontWeight: '600',
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 40,
        alignItems: 'center',
        marginBottom: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#667eea',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#667eea',
    },
    secondaryButtonText: {
        color: '#667eea',
        fontSize: 16,
        fontWeight: '600',
    },
});
