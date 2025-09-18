import React from 'react';
import { View } from 'react-native';

const Spacer: React.FC<{ size?: number; horizontal?: boolean }> = ({
  size = 12,
  horizontal,
}) => {
  return <View style={horizontal ? { width: size } : { height: size }} />;
};

export default Spacer;
