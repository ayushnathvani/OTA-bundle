import React from 'react';
// import Checkbox from '../components/atoms/Checkbox';
// import Label from '../components/atoms/Label';
// import ErrorText from '../components/atoms/ErrorText';
import { View } from 'react-native';
import Checkbox from '../atoms/Checkbox';
import ErrorText from '../atoms/ErrorText';
import Label from '../atoms/Label';

export type TermsCheckboxProps = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  onBlur?: () => void;
  error?: string | null;
  label?: string;
};

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
  value,
  onValueChange,
  onBlur,
  error,
  label,
}) => {
  return (
    <View>
      {label ? <Label>{label}</Label> : null}
      <Checkbox value={value} onValueChange={onValueChange} onBlur={onBlur} />
      <ErrorText>{error}</ErrorText>
    </View>
  );
};

export default TermsCheckbox;
