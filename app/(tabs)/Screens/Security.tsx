import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { API_BASE_URL } from '@/app/utils/API_URL';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/app/AuthContext';
import { useNavigation } from 'expo-router';

export default function Security() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigation = useNavigation();
  const {setAuthData } = useAuth();
  const [btnloading, setBtnLoading] = useState(false);

  const onSubmit = async (data: any) => {
    console.log('Submitted Data:', data);
    try{
        const res = await axios.post(`${API_BASE_URL}/users/deviceupdate`, data);
        if(res.status === 201) {
            Toast.show({
                type: 'success',
                text1: res.data.message
            })
            setAuthData(undefined, undefined, res.data.phoneId);
            navigation.reset({
              index: 0,
              routes: [{name: 'Login' as never }],
            });
        }
    }catch (err: any) {
        console.error(err);
        Toast.show({
            type: 'error',
            text1: err.response?.data?.message || "Something went wrong"
        });
      }
    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device Reset Form</Text>

      {/* Email Field */}
      <Text style={styles.label}>Email</Text>
      <Controller
        control={control}
        name="email"
        rules={{
          required: 'Email is required',
          pattern: {
            value: /\S+@\S+\.\S+/,
            message: 'Email is invalid',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter your email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message?.toString()}</Text>}

      {/* OTP Field */}
      <Text style={styles.label}>OTP</Text>
      <Controller
        control={control}
        name="otp"
        rules={{
          required: 'OTP is required',
          minLength: {
            value: 6,
            message: 'OTP must be at least 6 digits',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.otp && styles.inputError]}
            placeholder="Enter OTP"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.otp && <Text style={styles.error}>{errors.otp.message?.toString()}</Text>}

      {/* Submit Button */}
      <Pressable onPress={handleSubmit(onSubmit)} style={styles.button}>
        { btnloading ? <ActivityIndicator size={'small'} color={'#111827'} /> : <Text style={styles.buttonText}>Reset Device</Text>}
      </Pressable>
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: '#f9fafb',
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 30,
      color: '#111827',
    },
    label: {
      fontSize: 14,
      marginBottom: 4,
      color: '#374151',
    },
    input: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
      backgroundColor: '#fff',
    },
    inputError: {
      borderColor: '#ef4444',
    },
    error: {
      color: '#ef4444',
      marginBottom: 8,
      fontSize: 12,
    },
    button: {
      backgroundColor: '#2563eb',
      padding: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
  });
  
