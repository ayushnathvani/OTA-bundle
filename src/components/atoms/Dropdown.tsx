import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type DropdownOption = { label: string; value: string | number };

export type DropdownProps = {
  label?: string;
  placeholder?: string;
  value?: string | number | null;
  options: DropdownOption[];
  onChange: (val: string | number) => void;
  error?: string | null;
};

const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder,
  value,
  options,
  onChange,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const selectedLabel = useMemo(
    () => options.find(o => o.value === value)?.label,
    [options, value],
  );
  const visibleOptions = useMemo(
    () => options.filter(o => o.value !== value),
    [options, value],
  );
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        style={[styles.box, !!error && styles.boxError]}
        activeOpacity={0.8}
        onPress={() => setOpen(o => !o)}
      >
        <Text style={[styles.valueText, !selectedLabel && styles.placeholder]}>
          {selectedLabel || placeholder || 'Select'}
        </Text>
      </TouchableOpacity>
      {open ? (
        <View style={styles.menu}>
          {visibleOptions.map(opt => (
            <TouchableOpacity
              key={String(opt.value)}
              style={styles.item}
              onPress={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <Text style={styles.itemText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  label: { marginBottom: 6, color: '#222', fontSize: 14 },
  box: {
    borderWidth: 1,
    borderColor: '#d4d8de',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  boxError: { borderColor: '#e74c3c' },
  valueText: { color: '#111' },
  placeholder: { color: '#9aa1ab' },
  menu: { marginTop: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
  item: { paddingVertical: 10, paddingHorizontal: 12 },
  itemText: { color: '#111' },
  error: { marginTop: 4, color: '#e74c3c', fontSize: 12 },
});

export default Dropdown;
