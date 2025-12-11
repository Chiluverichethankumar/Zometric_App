// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';

import { useLoginMutation } from '../../api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();

  const onSubmit = async () => {
    try {
      const result = await login({ username, password }).unwrap();
      dispatch(
        setCredentials({
          token: result.token,
          user: { username: result.username },
        })
      );
    } catch (e) {
      console.log('LOGIN ERROR ===>', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Top Logo */}
        <View style={styles.topLogoContainer}>
          <Image
            source={require('../../assets/icons/zometric.png')}
            style={styles.topLogo}
            resizeMode="contain"
          />
        </View>

        {/* Perfectly Centered Card */}
        <View style={styles.centerCard}>
          <View style={styles.card}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.hintText}>Sign in to continue</Text>

            <Input
              label="Username"
              placeholder="Enter username"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
            <Input
              label="Password"
              placeholder="Enter password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error && (
              <Text style={styles.errorText}>Invalid username or password</Text>
            )}

            <Button label="Login" onPress={onSubmit} loading={isLoading} />

            <TouchableOpacity
              style={styles.signupWrapper}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.signupText}>
                Don't have an account? <Text style={styles.signupBold}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Logo */}
        <View style={styles.bottomLogoContainer}>
          <Image
            source={require('../../assets/icons/company_logo.png')}  // Your bottom logo
            style={styles.bottomLogo}
            resizeMode="contain"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Top Logo
  topLogoContainer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 10,
  },
  topLogo: {
    width: 250,
    height: 120,
  },

  // Perfect center (absolute positioning)
  centerCard: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 35,
    elevation: 24,
  },

  welcomeText: {
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'center',
    color: '#111',
    marginBottom: 6,
  },
  hintText: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginBottom: 34,
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
    marginTop: 8,
  },
  signupWrapper: { marginTop: 28 },
  signupText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15.5,
  },
  signupBold: {
    color: '#007AFF',
    fontWeight: '700',
  },

  // Bottom Logo (always visible, nicely spaced)
  bottomLogoContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomLogo: {
    width: 140,
    height: 80,
    opacity: 100, // optional: subtle look
  },
});

export default LoginScreen;