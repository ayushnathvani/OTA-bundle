declare module 'formik' {
  import * as React from 'react';
  export interface FormikHelpers {
    resetForm: () => void;
    setFieldValue: (field: string, value: any) => void;
    setFieldTouched: (field: string, isTouched?: boolean) => void;
  }
  export interface FormikProps {
    values: Record<string, any>;
    errors: Record<string, any>;
    touched: Record<string, boolean>;
    handleSubmit: () => void;
    setFieldValue: (field: string, value: any) => void;
    setFieldTouched: (field: string, isTouched?: boolean) => void;
  }
  export const Formik: React.FC<{
    initialValues: Record<string, any>;
    validationSchema?: any;
    onSubmit: (values: any, helpers: FormikHelpers) => void | Promise<void>;
    children: (props: FormikProps) => React.ReactNode;
  }>;
}

declare module 'yup';
