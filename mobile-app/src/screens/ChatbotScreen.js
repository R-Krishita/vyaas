// src/screens/ChatbotScreen.js
// AI-powered chatbot for Ayurvedic crop assistance

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { chatbotAPI } from '../services/api';

const quickReplies = [
  'Pest help',
  'Watering tips',
  'Fertilizer guide',
  'Market prices',
];

const ChatbotScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "🤖 Hi! I'm your Ayurvedic Crop Assistant!\n\nI can help you with:\n• Crop-specific questions\n• Pest & disease solutions\n• Best farming practices\n• Market insights\n\nHow can I help you today?",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await chatbotAPI.askQuestion(inputText);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.reply || getPlaceholderResponse(inputText),
        quickReplies: response.quick_replies,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: getPlaceholderResponse(inputText),
        quickReplies: ['Pest help', 'Watering tips'],
      };
      setMessages((prev) => [...prev, botMessage]);
    }

    setIsTyping(false);
  };

  const getPlaceholderResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('yellow') || lowerQuery.includes('leaves')) {
      return "🌿 Yellow leaves can indicate:\n\n1. 💧 Overwatering - reduce watering frequency\n2. 🌱 Nitrogen deficiency - add organic compost\n3. 🦠 Root rot - check drainage\n\n✅ Quick fix: Let soil dry between waterings and apply neem cake fertilizer.";
    }
    if (lowerQuery.includes('pest') || lowerQuery.includes('insect')) {
      return "🐛 For natural pest control:\n\n1. Neem oil spray (5ml/liter)\n2. Garlic-chili solution\n3. Yellow sticky traps\n4. Companion planting with marigolds\n\n💡 Apply early morning or evening for best results.";
    }
    if (lowerQuery.includes('water')) {
      return "💧 Watering tips for Ayurvedic crops:\n\n• Tulsi: Every 3-4 days\n• Ashwagandha: Weekly (drought tolerant)\n• Turmeric: Keep moist, not waterlogged\n\n⏰ Best time: Early morning";
    }
    if (lowerQuery.includes('price') || lowerQuery.includes('market')) {
      return "📊 Current market trends:\n\n• Tulsi: ₹150-180/kg (stable)\n• Ashwagandha: ₹300-400/kg (rising)\n• Turmeric: ₹80-120/kg (seasonal)\n\n💡 Check the Market Insights tab for live prices!";
    }
    
    return "🤖 I understand you're asking about: \"" + query + "\"\n\nFor the best advice, please share:\n• Which crop are you growing?\n• What specific issue are you facing?\n\nI'm here to help with all your Ayurvedic farming needs!";
  };

  const handleQuickReply = (reply) => {
    setInputText(reply);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.type === 'user' ? styles.userBubble : styles.botBubble,
              ]}
            >
              {message.type === 'bot' && (
                <Text style={styles.botIcon}>🤖</Text>
              )}
              <Text style={[
                styles.messageText,
                message.type === 'user' && styles.userMessageText,
              ]}>
                {message.text}
              </Text>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageBubble, styles.botBubble]}>
              <Text style={styles.typingText}>🤖 Thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Quick Replies */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickRepliesContainer}
        >
          {quickReplies.map((reply) => (
            <TouchableOpacity
              key={reply}
              style={styles.quickReplyButton}
              onPress={() => handleQuickReply(reply)}
            >
              <Text style={styles.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your question..."
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.voiceButton}>
            <Text style={styles.voiceIcon}>🎤</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: COLORS.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    ...SHADOWS.sm,
  },
  botIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  messageText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  userMessageText: {
    color: COLORS.textLight,
  },
  typingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  quickRepliesContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  quickReplyButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  quickReplyText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.md,
    maxHeight: 100,
    color: COLORS.textPrimary,
  },
  voiceButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  voiceIcon: {
    fontSize: 24,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 18,
    color: COLORS.textLight,
  },
});

export default ChatbotScreen;
