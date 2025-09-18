import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
// import DynamicForms from '../components/Dynamicforms/DynamicForms';
import { FieldConfig } from '../hooks/useFormBuilder';
import * as Yup from 'yup';
import DynamicForms from '../components/DynamicForms';

const fields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    validation: Yup.string().required('Name is required'),
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    validation: Yup.string()
      .email('Invalid email')
      .required('Email is required'),
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    validation: Yup.string().min(6).required('Password is required'),
  },
  {
    name: 'country',
    label: 'Country',
    type: 'country',
    props: { mobilePlaceholder: 'Mobile number', mobileFieldName: 'mobile' },
  },
  {
    name: 'mobile',
    label: 'Mobile',
    type: 'number',
    validation: Yup.string().required('Mobile is required'),
  },
  {
    name: 'favColor',
    label: 'Favorite Color',
    type: 'dropdown',
    validation: Yup.mixed().required('Please choose a color'),
    props: {
      placeholder: 'Select color',
      options: [
        { label: 'Red', value: 'red' },
        { label: 'Green', value: 'green' },
        { label: 'Blue', value: 'blue' },
      ],
    },
  },
  {
    name: 'gender',
    label: 'Gender',
    type: 'radio',
    validation: Yup.mixed().required('Please select gender'),
    props: {
      options: [
        { label: 'Male', value: 'm' },
        { label: 'Female', value: 'f' },
        { label: 'Other', value: 'o' },
      ],
    },
  },
  {
    name: 'newsletter',
    label: 'Subscribe to newsletter',
    type: 'switch',
    initialValue: false,
  },
  {
    name: 'terms',
    label: 'Agree to Terms',
    type: 'checkbox',
    validation: Yup.boolean().oneOf([true], 'Please accept terms'),
  },
];

const DemoDynamicFormScreen = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <DynamicForms
            fields={fields}
            submitLabel="Create Account"
            onSubmit={values => {
              console.log('Submitted values', values);
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16 },
  card: { gap: 12 },
});

export default DemoDynamicFormScreen;
