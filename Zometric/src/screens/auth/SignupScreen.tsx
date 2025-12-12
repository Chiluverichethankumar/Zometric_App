// // src/screens/auth/SignupScreen.tsx
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
// } from 'react-native';

// import { useSignupMutation, useLoginMutation } from '../../api/authApi';
// import { useDispatch } from 'react-redux';
// import { setCredentials } from '../../store/authSlice';
// import type { NativeStackScreenProps } from '@react-navigation/native-stack';
// import type { AuthStackParamList } from '../../types/navigation';
// import Input from '../../components/common/Input';
// import Button from '../../components/common/Button';

// type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

// const SignupScreen: React.FC<Props> = ({ navigation }) => {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [serverError, setServerError] = useState<string | null>(null);

//   const [signup, { isLoading }] = useSignupMutation();
//   const [login] = useLoginMutation();
//   const dispatch = useDispatch();

//   const onSubmit = async () => {
//     setServerError(null);

//     try {
//       await signup({ username, email, password }).unwrap();

//       const loginResult = await login({ username, password }).unwrap();

//       dispatch(
//         setCredentials({
//           token: loginResult.token,
//           user: loginResult.user || { username },
//         })
//       );

//       // Navigate to main app (replace so user can't go back to auth)
//       navigation.replace('Main' as never);
// ; // or 'App' / 'Root' depending on your navigator

//     } catch (err: any) {
//       console.log('SIGNUP ERROR:', err);
//       const data = err?.data;

//       if (data?.username) {
//         setServerError(String(data.username[0]));
//       } else if (data?.email) {
//         setServerError(String(data.email[0]));
//       } else {
//         setServerError('Signup failed. Please try again.');
//       }
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={{ flex: 1 }}
//       >
//         {/* Top Logo */}
//         <View style={styles.topLogoContainer}>
//           <Image
//             source={require('../../assets/icons/zometric.png')}
//             style={styles.topLogo}
//             resizeMode="contain"
//           />
//         </View>

//         {/* Perfectly Centered Card */}
//         <View style={styles.centerCard}>
//           <View style={styles.card}>
//             <Text style={styles.title}>Create Account</Text>
//             <Text style={styles.subtitle}>Join Zometric today</Text>

//             <Input
//               label="Username"
//               placeholder="Choose a username"
//               autoCapitalize="none"
//               value={username}
//               onChangeText={setUsername}
//             />

//             <Input
//               label="Email"
//               placeholder="Enter your email"
//               autoCapitalize="none"
//               keyboardType="email-address"
//               value={email}
//               onChangeText={setEmail}
//             />

//             <Input
//               label="Password"
//               placeholder="Create a strong password"
//               secureTextEntry
//               value={password}
//               onChangeText={setPassword}
//             />

//             {serverError && (
//               <Text style={styles.errorText}>{serverError}</Text>
//             )}

//             <Button label="Sign Up" onPress={onSubmit} loading={isLoading} />

//             <TouchableOpacity
//               style={styles.loginWrapper}
//               onPress={() => navigation.navigate('Login')}
//             >
//               <Text style={styles.loginText}>
//                 Already have an account?{' '}
//                 <Text style={styles.loginBold}>Log in</Text>
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Bottom Logo */}
//         <View style={styles.bottomLogoContainer}>
//           <Image
//             source={require('../../assets/icons/company_logo.png')}
//             style={styles.bottomLogo}
//             resizeMode="contain"
//           />
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },

//   // Top Logo
//   topLogoContainer: {
//     alignItems: 'center',
//     paddingTop: 30,
//     paddingBottom: 10,
//   },
//   topLogo: {
//     width: 250,
//     height: 120,
//   },

//   // Absolute center card
//   centerCard: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   card: {
//     width: '100%',
//     maxWidth: 400,
//     backgroundColor: '#ffffff',
//     borderRadius: 28,
//     padding: 34,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 12 },
//     shadowOpacity: 0.15,
//     shadowRadius: 35,
//     elevation: 24,
//   },

//   title: {
//     fontSize: 25,
//     fontWeight: '800',
//     textAlign: 'center',
//     color: '#111',
//     marginBottom: 6,
//   },
//   subtitle: {
//     fontSize: 15,
//     color: '#777',
//     textAlign: 'center',
//     marginBottom: 34,
//   },
//   errorText: {
//     color: '#e74c3c',
//     textAlign: 'center',
//     marginBottom: 16,
//     fontSize: 14,
//     marginTop: 8,
//   },

//   loginWrapper: {
//     marginTop: 28,
//   },
//   loginText: {
//     textAlign: 'center',
//     color: '#666',
//     fontSize: 15.5,
//   },
//   loginBold: {
//     color: '#007AFF',
//     fontWeight: '700',
//   },

//   // Bottom Logo
//   bottomLogoContainer: {
//     position: 'absolute',
//     bottom: 40,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//   },
//   bottomLogo: {
//     width: 140,
//     height: 80,
//     opacity: 100,
//   },
// });

// export default SignupScreen;

// src/screens/auth/SignupScreen.tsx
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

import { useSignupMutation, useLoginMutation } from '../../api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const [signup, { isLoading }] = useSignupMutation();
  const [login] = useLoginMutation();
  const dispatch = useDispatch();

  const onSubmit = async () => {
    setServerError(null);

    try {
      // Step 1: signup
      await signup({ username, email, password }).unwrap();

      // Step 2: login automatically after signup
      const loginResult = await login({ username, password }).unwrap();

      // Step 3: store token + user in Redux
      dispatch(
        setCredentials({
          token: loginResult.token,
          user: {
            username: loginResult.username,
            email: loginResult.email,
          },
        })
      );

      // Step 4: DO NOT navigate manually.
      // RootNavigator will auto-switch to "Main" because token is now set.

    } catch (err: any) {
      console.log('SIGNUP ERROR:', err);
      const data = err?.data;

      if (data?.username) {
        setServerError(String(data.username[0]));
      } else if (data?.email) {
        setServerError(String(data.email[0]));
      } else {
        setServerError('Signup failed. Please try again.');
      }
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

        {/* Center Card */}
        <View style={styles.centerCard}>
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Zometric today</Text>

            <Input
              label="Username"
              placeholder="Choose a username"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Input
              label="Password"
              placeholder="Create a strong password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {serverError && (
              <Text style={styles.errorText}>{serverError}</Text>
            )}

            <Button label="Sign Up" onPress={onSubmit} loading={isLoading} />

            <TouchableOpacity
              style={styles.loginWrapper}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text style={styles.loginBold}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Logo */}
        <View style={styles.bottomLogoContainer}>
          <Image
            source={require('../../assets/icons/company_logo.png')}
            style={styles.bottomLogo}
            resizeMode="contain"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  topLogoContainer: { alignItems: 'center', paddingTop: 30, paddingBottom: 10 },
  topLogo: { width: 250, height: 120 },

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

  title: {
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'center',
    color: '#111',
    marginBottom: 6,
  },
  subtitle: {
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

  loginWrapper: { marginTop: 28 },
  loginText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15.5,
  },
  loginBold: {
    color: '#007AFF',
    fontWeight: '700',
  },

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
    opacity: 100,
  },
});

export default SignupScreen;
