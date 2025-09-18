import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';

const ErrorText: React.FC<TextProps> = ({ children, style, ...rest }) => {
  if (!children) return null;
  return (
    <Text {...rest} style={[styles.text, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: { color: '#e74c3c', marginTop: 4, fontSize: 12 },
});

export default ErrorText;
