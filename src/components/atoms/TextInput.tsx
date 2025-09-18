import React from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';

export type AppTextInputProps = TextInputProps & {
  label?: string | null;
  error?: string | null;
  isLabel?: string | boolean;
  type?: 'text' | 'password';
  name?: string;
};

const TextInput: React.FC<AppTextInputProps> = ({
  label,
  error,
  isLabel,
  type = 'text',
  ...rest
}) => {
  const secureTextEntry = type === 'password';
  return (
    <View style={styles.container}>
      {isLabel ? (
        <Text style={styles.label}>
          {typeof isLabel === 'string' ? isLabel : label}
        </Text>
      ) : null}
      <RNTextInput
        style={[styles.input, !!error && styles.inputError]}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={'#9aa1ab'}
        {...rest}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  label: { marginBottom: 6, color: '#222', fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#d4d8de',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111',
  },
  inputError: { borderColor: '#e74c3c' },
  error: { marginTop: 4, color: '#e74c3c', fontSize: 12 },
});

export default TextInput;
