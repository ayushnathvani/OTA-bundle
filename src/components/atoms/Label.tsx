import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

const Label: React.FC<TextProps> = ({ children, style, ...rest }) => {
  return (
    <Text {...rest} style={[styles.label, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: { color: '#222', fontSize: 14, marginBottom: 6 },
});

export default Label;
