import React from 'react';
import { View, StyleSheet } from 'react-native';
import Label from '../atoms/Label';
import TextInput from '../atoms/TextInput';
import Spacer from '../atoms/Spacer';


export type CountryValue =
  | { code: string; dialCode: string; name: string; mobile?: string }
  | string;

export type CustomCountryPickerProps = {
  label?: string;
  placeholder?: string;
  value?: CountryValue;
  code?: string;
  onChangeText?: (v: any) => void; // legacy compat
  onChangeCountry?: (country: any) => void;
  onBlur?: () => void;
  touched?: boolean;
  mobile?: string;
  onMobileChange?: (txt: string) => void;
  mobileError?: string | null;
  mobileTouched?: boolean;
  useCustomTextInput?: boolean;
  mobilePlaceholder?: string;
  mobileProps?: Record<string, any>;
};

const CustomCountryPicker: React.FC<CustomCountryPickerProps> = ({
  label,
  placeholder,
  value,
  onChangeCountry,
  onBlur,
  mobile,
  onMobileChange,
  mobilePlaceholder,
  mobileProps,
}) => {
  const country =
    typeof value === 'string'
      ? { code: value, dialCode: '', name: value }
      : value;
  return (
    <View style={styles.container}>
      {label ? <Label>{label}</Label> : null}
      <View style={styles.row}>
        <TextInput
          value={country?.code}
          placeholder={placeholder || 'Country Code'}
          onChangeText={txt =>
            onChangeCountry?.({ ...(country || {}), code: String(txt) })
          }
          onBlur={onBlur}
          style={styles.countryInput}
        />
        <Spacer horizontal size={10} />
        <TextInput
          value={mobile}
          placeholder={mobilePlaceholder || 'Mobile number'}
          onChangeText={txt => onMobileChange?.(String(txt))}
          keyboardType="phone-pad"
          {...mobileProps}
          style={styles.mobileInput}
        />
      </View>
      {/* simple inline error below primary field */}
      {/* consumer can also show their own error text */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center' },
  countryInput: { flex: 1 },
  mobileInput: { flex: 2 },
});

export default CustomCountryPicker;
