import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Formik, FormikHelpers } from 'formik';
import { FieldConfig, useFormBuilder } from '../hooks/useFormBuilder';
import CustomCountryPicker from './molecules/CustomCountryPicker';
import TermsCheckbox from './molecules/TermsCheckbox';
import RadioGroup from './atoms/RadioGroup';
import ToggleSwitch from './atoms/ToggleSwitch';
import TextInput from './atoms/TextInput';
import Button from './atoms/Buttons';
import { COLORS } from '../lib/colors/colors';
import Dropdown from './atoms/Dropdown';

export type DynamicFormsProps = {
  fields: FieldConfig[];
  onSubmit: (
    values: Record<string, any>,
    formikHelpers?: FormikHelpers | (() => void),
  ) => void | Promise<void>;
  submitLabel?: string;
  submitLoading?: boolean;
  showErrorsInline?: boolean;
  renderAfterFields?: React.ReactNode;
};

const DynamicForms: React.FC<DynamicFormsProps> = ({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  submitLoading = false,
  showErrorsInline = true,
  renderAfterFields = null,
}) => {
  const { initialValues, validationSchema } = useFormBuilder(fields);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, formikHelpers) =>
        onSubmit(values, formikHelpers.resetForm)
      }
    >
      {formik => {
        return (
          <View style={styles.container}>
            {fields.map(f => {
              const value = (formik.values as any)[f.name];
              const error =
                (formik.touched as any)[f.name] &&
                (formik.errors as any)[f.name];

              if (f.type === 'country') {
                const mobileFieldName =
                  (f.props?.mobileFieldName as string | undefined) ?? undefined;
                const useCustomTextInput = !!f.props?.useCustomTextInput;
                const mobilePlaceholder = f.props?.mobilePlaceholder;
                const mobileProps = f.props?.mobileProps ?? {};

                const mobileValue = mobileFieldName
                  ? (formik.values as any)[mobileFieldName]
                  : undefined;
                const mobileError = mobileFieldName
                  ? (formik.errors as any)[mobileFieldName]
                  : undefined;
                const mobileTouched = mobileFieldName
                  ? !!(formik.touched as any)[mobileFieldName]
                  : false;

                return (
                  <View key={f.name}>
                    <CustomCountryPicker
                      label={f.label}
                      placeholder={f.label || ''}
                      value={value?.code ?? value}
                      code={value?.code ?? value}
                      onChangeText={(val: any) =>
                        formik.setFieldValue(f.name, val)
                      }
                      onChangeCountry={(country: any) =>
                        formik.setFieldValue(f.name, country)
                      }
                      onBlur={() => formik.setFieldTouched(f.name, true)}
                      touched={!!(formik.touched as any)[f.name]}
                      mobile={mobileValue}
                      onMobileChange={(txt: string) => {
                        if (mobileFieldName) {
                          formik.setFieldValue(mobileFieldName, txt);
                        } else {
                          const curr = (formik.values as any)[f.name] || {};
                          formik.setFieldValue(f.name, {
                            ...curr,
                            mobile: txt,
                          });
                        }
                      }}
                      mobileError={mobileError as any}
                      mobileTouched={mobileTouched}
                      useCustomTextInput={useCustomTextInput}
                      mobilePlaceholder={mobilePlaceholder}
                      mobileProps={mobileProps}
                      {...(f.props || {})}
                    />
                    {showErrorsInline &&
                    (formik.touched as any)[f.name] &&
                    (formik.errors as any)[f.name] ? (
                      <Text style={styles.errorText}>
                        {String((formik.errors as any)[f.name])}
                      </Text>
                    ) : null}
                  </View>
                );
              }

              if (f.type === 'checkbox') {
                return (
                  <View key={f.name}>
                    <TermsCheckbox
                      value={!!value}
                      onValueChange={(v: boolean) =>
                        formik.setFieldValue(f.name, v)
                      }
                      onBlur={() => formik.setFieldTouched(f.name, true)}
                      error={error as any}
                      label={f.label}
                      {...(f.props || {})}
                    />
                  </View>
                );
              }

              if (f.type === 'dropdown') {
                const options = f.props?.options || [];
                return (
                  <View key={f.name}>
                    <Dropdown
                      label={f.label}
                      placeholder={f.props?.placeholder}
                      value={value}
                      options={options}
                      onChange={val => formik.setFieldValue(f.name, val)}
                      error={showErrorsInline ? (error as any) : undefined}
                    />
                  </View>
                );
              }

              if (f.type === 'radio') {
                const options = f.props?.options || [];
                return (
                  <View key={f.name}>
                    <RadioGroup
                      label={f.label}
                      value={value}
                      options={options}
                      onChange={val => formik.setFieldValue(f.name, val)}
                      error={showErrorsInline ? (error as any) : undefined}
                    />
                  </View>
                );
              }

              if (f.type === 'switch') {
                return (
                  <View key={f.name}>
                    <ToggleSwitch
                      label={f.label}
                      value={!!value}
                      onValueChange={v => formik.setFieldValue(f.name, v)}
                      error={showErrorsInline ? (error as any) : undefined}
                    />
                  </View>
                );
              }

              return (
                <View key={f.name}>
                  <TextInput
                    name={f.name}
                    placeholder={f.label}
                    type={f.type === 'password' ? 'password' : 'text'}
                    value={value}
                    onChangeText={(txt: any) =>
                      formik.setFieldValue(f.name, txt)
                    }
                    onBlur={() => formik.setFieldTouched(f.name, true)}
                    editable={f.props?.editable ?? true}
                    multiline={f.type === 'textarea'}
                    keyboardType={f.props?.keyboardType}
                    isLabel={f.label}
                    {...(f.props || {})}
                  />
                  {showErrorsInline && error ? (
                    <Text style={styles.errorText}>{String(error as any)}</Text>
                  ) : null}
                </View>
              );
            })}

            {renderAfterFields}

            <Button
              title={submitLabel}
              smallButton
              onPress={() => formik.handleSubmit()}
              loading={submitLoading}
              disabled={submitLoading}
            />
          </View>
        );
      }}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  errorText: { color: COLORS.error, marginTop: 4, fontSize: 12 },
});

export default memo(DynamicForms);
