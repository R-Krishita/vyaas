// src/screens/WelcomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

const WelcomeScreen = ({ navigation }) => {
    const { t } = useLanguage();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.emoji}>🌿</Text>
                    <Text style={styles.title}>{t('welcome_title')}</Text>
                    <Text style={styles.subtitle}>
                        {t('welcome_subtitle')}
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('OTPLogin', { isSignup: false })}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.loginButtonText}>{t('login_button')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.signupButton}
                        onPress={() => navigation.navigate('OTPLogin', { isSignup: true })}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.signupButtonText}>{t('signup_button')}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footerText}>
                    {t('terms_text')}
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        padding: SPACING.xl,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    emoji: {
        fontSize: 80,
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: FONTS.sizes.lg,
        color: COLORS.textSecondary,
        textAlign: 'center',
        maxWidth: '80%',
    },
    buttonContainer: {
        width: '100%',
        marginBottom: SPACING.xl,
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        marginBottom: SPACING.md,
        ...SHADOWS.md,
    },
    loginButtonText: {
        color: COLORS.textLight,
        fontSize: FONTS.sizes.lg,
        fontWeight: 'bold',
    },
    signupButton: {
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    signupButtonText: {
        color: COLORS.primary,
        fontSize: FONTS.sizes.lg,
        fontWeight: 'bold',
    },
    footerText: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
});

export default WelcomeScreen;
