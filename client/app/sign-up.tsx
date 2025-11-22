import { StyleSheet, TextInput, View, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { signUp } from '@/services/authService';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await signUp({ name, email, password });
      
      if (response.success) {
        // TODO: Store token (e.g., using SecureStore or AsyncStorage)
        // await SecureStore.setItemAsync('token', response.token);
        
        Alert.alert('Success', response.message || 'Account created successfully');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', response.message || response.error || 'Sign up failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container} lightColor="#446CCF" darkColor="#446CCF">
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Sign up to get started with Trip Mind</Text>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <MaterialIcons name="person" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!isLoading}
          />
        </View>
        <View style={styles.inputWrapper}>
          <MaterialIcons name="email" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email here"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>
        <View style={styles.inputWrapper}>
          <MaterialIcons name="lock" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password here"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            disabled={isLoading}
          >
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.inputWrapper}>
          <MaterialIcons name="lock" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm your password"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
            disabled={isLoading}
          >
            <MaterialIcons
              name={showConfirmPassword ? "visibility" : "visibility-off"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.blackText}>Or</Text>
        <TouchableOpacity onPress={() => router.push('/sign-in')} disabled={isLoading}>
          <Text style={styles.signInText}>
            Already have an account? <Text style={styles.signInTextBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    width: '90%',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 10,
    padding: 10,
  },
  inputWrapper: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingLeft: 45,
    paddingRight: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingLeft: 45,
    paddingRight: 45,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  icon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    zIndex: 1,
    padding: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  button: {
    width: '90%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#446CCF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  blackText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  signInText: {
    color: '#446CCF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
  },
  signInTextBold: {
    color: '#446CCF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

