import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiService from '../services/api';
import websocketService from '../services/websocket';
import colors from '../theme/colors';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.login(email, password);

      if (response.access_token) {
        // Initialize WebSocket
        websocketService.initialize(response.access_token);

        // Navigate to chat list
        navigation.navigate('ChatList' as never);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Error de autenticación',
        error.response?.data?.message || 'Credenciales inválidas',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.brandName}>MiChatApp</Text>
          <Text style={styles.brandTagline}>LUXURY STYLING EXPERIENCE</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.textWhite} />
          ) : (
            <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>Experiencia de asesoría personalizada</Text>

        <Text style={styles.hint}>
          URL del servidor: http://192.168.3.143
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 4,
    marginBottom: 8,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    fontWeight: '400',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: colors.textLight,
  },
  buttonText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  footer: {
    marginTop: 32,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  hint: {
    marginTop: 24,
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default LoginScreen;
