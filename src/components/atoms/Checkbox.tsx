import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type CheckboxProps = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  label?: string;
  error?: string | null;
  onBlur?: () => void;
};

const Checkbox: React.FC<CheckboxProps> = ({
  value,
  onValueChange,
  label,
  error,
  onBlur,
}) => {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={[styles.box, value && styles.boxChecked]}
        onPress={() => onValueChange(!value)}
        onBlur={onBlur}
        activeOpacity={0.8}
      >
        {value ? <View style={styles.tick} /> : null}
      </TouchableOpacity>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const SIZE = 22;
const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center' },
  box: {
    width: SIZE,
    height: SIZE,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#b9c0ca',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: '#2e7df6', borderColor: '#2e7df6' },
  tick: { width: 10, height: 10, backgroundColor: '#fff', borderRadius: 2 },
  label: { color: '#222' },
  error: { marginLeft: 8, color: '#e74c3c' },
});

export default Checkbox;
