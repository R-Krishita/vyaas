// src/context/LanguageContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRANSLATIONS } from '../constants/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        // Load saved language on startup
        const loadLanguage = async () => {
            try {
                const savedLang = await AsyncStorage.getItem('userLanguage');
                if (savedLang) {
                    setLanguage(savedLang);
                }
            } catch (error) {
                console.log('Error loading language', error);
            }
        };
        loadLanguage();
    }, []);

    const changeLanguage = async (langCode) => {
        try {
            setLanguage(langCode);
            await AsyncStorage.setItem('userLanguage', langCode);
        } catch (error) {
            console.log('Error saving language', error);
        }
    };

    // Translation helper
    const t = (key) => {
        const langData = TRANSLATIONS[language] || TRANSLATIONS['en'];
        return langData[key] || TRANSLATIONS['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
