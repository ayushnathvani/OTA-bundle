import * as Yup from 'yup';

export type FieldType =
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'textarea'
  | 'country'
  | 'checkbox'
  | 'dropdown'
  | 'radio'
  | 'switch';

export type FieldConfig = {
  name: string;
  label?: string;
  type: FieldType;
  initialValue?: any;
  validation?: any;
  props?: Record<string, any>;
};

export function useFormBuilder(fields: FieldConfig[]) {
  const initialValues = fields.reduce<Record<string, any>>((acc, f) => {
    acc[f.name] = f.initialValue ?? defaultInitialForType(f.type);
    return acc;
  }, {});

  const shape: Record<string, any> = {};

  fields.forEach(f => {
    if (f.validation) {
      shape[f.name] = f.validation;
      return;
    }

    switch (f.type) {
      case 'text':
      case 'textarea': {
        shape[f.name] = Yup.string();
        break;
      }
      case 'password': {
        shape[f.name] = Yup.string();
        break;
      }
      case 'email': {
        shape[f.name] = Yup.string().email('Invalid email');
        break;
      }
      case 'number': {
        shape[f.name] = Yup.number().typeError('Must be a number');
        break;
      }
      case 'checkbox': {
        shape[f.name] = Yup.boolean();
        break;
      }
      case 'switch': {
        shape[f.name] = Yup.boolean();
        break;
      }
      case 'dropdown':
      case 'radio': {
        shape[f.name] = Yup.mixed();
        break;
      }
      case 'country': {
        shape[f.name] = Yup.mixed();
        break;
      }
      default: {
        shape[f.name] = Yup.mixed();
      }
    }
  });

  const validationSchema = Yup.object().shape(shape);

  return { initialValues, validationSchema };
}

function defaultInitialForType(type: FieldType) {
  switch (type) {
    case 'checkbox':
      return false;
    case 'switch':
      return false;
    case 'number':
      return '';
    case 'country':
      return { code: 'US', dialCode: '+1', name: 'United States', mobile: '' };
    case 'dropdown':
    case 'radio':
      return null as any;
    default:
      return '';
  }
}
