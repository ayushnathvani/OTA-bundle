import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type RadioOption = { label: string; value: string | number };

export type RadioGroupProps = {
  label?: string;
  value?: string | number | null;
  options: RadioOption[];
  onChange: (val: string | number) => void;
  error?: string | null;
};

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  value,
  options,
  onChange,
  error,
}) => {
  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {options.map(opt => {
          const selected = value === opt.value;
          return (
            <TouchableOpacity
              key={String(opt.value)}
              style={styles.item}
              onPress={() => onChange(opt.value)}
            >
              <View style={[styles.circle, selected && styles.circleSelected]}>
                {selected ? <View style={styles.dot} /> : null}
              </View>
              <Text style={styles.text}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const SIZE = 20;
const styles = StyleSheet.create({
  label: { marginBottom: 6, color: '#222', fontSize: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: { flexDirection: 'row', alignItems: 'center' },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    borderColor: '#b9c0ca',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  circleSelected: { borderColor: '#2e7df6' },
  dot: {
    width: SIZE / 2.5,
    height: SIZE / 2.5,
    borderRadius: SIZE / 2.5,
    backgroundColor: '#2e7df6',
  },
  text: { color: '#111' },
  error: { marginTop: 4, color: '#e74c3c', fontSize: 12 },
});

export default RadioGroup;
