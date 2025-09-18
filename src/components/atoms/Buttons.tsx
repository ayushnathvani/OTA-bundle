import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
} from 'react-native';

export type ButtonProps = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  smallButton?: boolean;
  style?: ViewStyle;
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading,
  disabled,
  smallButton,
  style,
}) => {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        smallButton && styles.small,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    backgroundColor: 'red',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: { paddingVertical: 10 },
  disabled: { backgroundColor: '#9bbcf9' },
  title: { color: '#fff', fontWeight: '600' },
});

export default Button;
