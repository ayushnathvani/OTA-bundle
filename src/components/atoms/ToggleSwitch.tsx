import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type ToggleSwitchProps = {
  label?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  error?: string | null;
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  value,
  onValueChange,
  error,
}) => {
  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        onPress={() => onValueChange(!value)}
        activeOpacity={0.8}
      >
        <View style={[styles.track, value && styles.trackOn]}>
          <View style={[styles.thumb, value && styles.thumbOn]} />
        </View>
      </TouchableOpacity>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const WIDTH = 44;
const HEIGHT = 26;
const styles = StyleSheet.create({
  label: { marginBottom: 6, color: '#222', fontSize: 14 },
  track: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    backgroundColor: '#d4d8de',
    padding: 3,
  },
  trackOn: { backgroundColor: '#2e7df6' },
  thumb: {
    width: HEIGHT - 6,
    height: HEIGHT - 6,
    borderRadius: (HEIGHT - 6) / 2,
    backgroundColor: '#fff',
  },
  thumbOn: { marginLeft: WIDTH - HEIGHT },
  error: { marginTop: 4, color: '#e74c3c', fontSize: 12 },
});

export default ToggleSwitch;
