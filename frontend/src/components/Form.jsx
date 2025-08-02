import React from 'react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';

/**
 * Form Component
 * 
 * A reusable form component built on top of Formik for form state management and validation.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.initialValues - Initial form values
 * @param {Object} props.validationSchema - Yup validation schema
 * @param {function} props.onSubmit - Function to call when form is submitted
 * @param {React.ReactNode} props.children - Form content
 * @param {string} props.className - Additional CSS classes for the form
 * @param {boolean} props.enableReinitialize - Whether to reinitialize form when initialValues change
 */
const Form = ({
  initialValues,
  validationSchema,
  onSubmit,
  children,
  className = '',
  enableReinitialize = false,
}) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize={enableReinitialize}
    >
      {(formik) => (
        <FormikForm className={className}>
          {typeof children === 'function' ? children(formik) : children}
        </FormikForm>
      )}
    </Formik>
  );
};

/**
 * Form.Group Component
 * 
 * A container for form fields with labels and error messages.
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {React.ReactNode} props.children - Field component
 * @param {string} props.className - Additional CSS classes for the group
 * @param {string} props.labelClassName - Additional CSS classes for the label
 * @param {string} props.errorClassName - Additional CSS classes for the error message
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.hint - Hint text for the field
 */
Form.Group = ({
  name,
  label,
  children,
  className = '',
  labelClassName = '',
  errorClassName = '',
  required = false,
  hint,
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      <ErrorMessage name={name}>
        {(msg) => <div className={`mt-1 text-sm text-red-600 ${errorClassName}`}>{msg}</div>}
      </ErrorMessage>
    </div>
  );
};

/**
 * Form.Input Component
 * 
 * A form input field with label and error message.
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {string} props.type - Input type
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.className - Additional CSS classes for the input
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.hint - Hint text for the field
 * @param {boolean} props.disabled - Whether the field is disabled
 * @param {Object} props.inputProps - Additional props for the input element
 */
Form.Input = ({
  name,
  label,
  type = 'text',
  placeholder,
  className = '',
  required = false,
  hint,
  disabled = false,
  inputProps = {},
}) => {
  return (
    <Form.Group name={name} label={label} required={required} hint={hint}>
      <Field name={name}>
        {({ field, meta }) => (
          <input
            type={type}
            id={name}
            placeholder={placeholder}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${meta.touched && meta.error ? 'border-red-500' : ''} ${className}`}
            disabled={disabled}
            {...field}
            {...inputProps}
          />
        )}
      </Field>
    </Form.Group>
  );
};

/**
 * Form.Textarea Component
 * 
 * A form textarea field with label and error message.
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {string} props.placeholder - Textarea placeholder
 * @param {number} props.rows - Number of rows
 * @param {string} props.className - Additional CSS classes for the textarea
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.hint - Hint text for the field
 * @param {boolean} props.disabled - Whether the field is disabled
 * @param {Object} props.textareaProps - Additional props for the textarea element
 */
Form.Textarea = ({
  name,
  label,
  placeholder,
  rows = 3,
  className = '',
  required = false,
  hint,
  disabled = false,
  textareaProps = {},
}) => {
  return (
    <Form.Group name={name} label={label} required={required} hint={hint}>
      <Field name={name}>
        {({ field, meta }) => (
          <textarea
            id={name}
            rows={rows}
            placeholder={placeholder}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${meta.touched && meta.error ? 'border-red-500' : ''} ${className}`}
            disabled={disabled}
            {...field}
            {...textareaProps}
          />
        )}
      </Field>
    </Form.Group>
  );
};

/**
 * Form.Select Component
 * 
 * A form select field with label and error message.
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {Array} props.options - Select options
 * @param {string} props.placeholder - Select placeholder
 * @param {string} props.className - Additional CSS classes for the select
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.hint - Hint text for the field
 * @param {boolean} props.disabled - Whether the field is disabled
 * @param {Object} props.selectProps - Additional props for the select element
 */
Form.Select = ({
  name,
  label,
  options = [],
  placeholder,
  className = '',
  required = false,
  hint,
  disabled = false,
  selectProps = {},
}) => {
  return (
    <Form.Group name={name} label={label} required={required} hint={hint}>
      <Field name={name}>
        {({ field, meta }) => (
          <select
            id={name}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${meta.touched && meta.error ? 'border-red-500' : ''} ${className}`}
            disabled={disabled}
            {...field}
            {...selectProps}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </Field>
    </Form.Group>
  );
};

/**
 * Form.Checkbox Component
 * 
 * A form checkbox field with label and error message.
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {string} props.className - Additional CSS classes for the checkbox
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.hint - Hint text for the field
 * @param {boolean} props.disabled - Whether the field is disabled
 * @param {Object} props.checkboxProps - Additional props for the checkbox element
 */
Form.Checkbox = ({
  name,
  label,
  className = '',
  required = false,
  hint,
  disabled = false,
  checkboxProps = {},
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <Field name={name} type="checkbox">
            {({ field, meta }) => (
              <input
                type="checkbox"
                id={name}
                className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ${meta.touched && meta.error ? 'border-red-500' : ''} ${className}`}
                disabled={disabled}
                {...field}
                {...checkboxProps}
              />
            )}
          </Field>
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={name} className="font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {hint && <p className="text-gray-500">{hint}</p>}
        </div>
      </div>
      <ErrorMessage name={name}>
        {(msg) => <div className="mt-1 text-sm text-red-600">{msg}</div>}
      </ErrorMessage>
    </div>
  );
};

/**
 * Form.RadioGroup Component
 * 
 * A form radio group field with label and error message.
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {Array} props.options - Radio options
 * @param {string} props.className - Additional CSS classes for the radio group
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.hint - Hint text for the field
 * @param {boolean} props.disabled - Whether the field is disabled
 * @param {boolean} props.inline - Whether to display the radio options inline
 */
Form.RadioGroup = ({
  name,
  label,
  options = [],
  className = '',
  required = false,
  hint,
  disabled = false,
  inline = false,
}) => {
  return (
    <Form.Group name={name} label={label} required={required} hint={hint}>
      <div className={`mt-1 ${inline ? 'flex space-x-6' : 'space-y-2'} ${className}`}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <Field name={name} type="radio" value={option.value}>
              {({ field }) => (
                <input
                  type="radio"
                  id={`${name}-${option.value}`}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  disabled={disabled || option.disabled}
                  {...field}
                  checked={field.value === option.value}
                />
              )}
            </Field>
            <label htmlFor={`${name}-${option.value}`} className="ml-3 block text-sm font-medium text-gray-700">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </Form.Group>
  );
};

/**
 * Form.Switch Component
 * 
 * A form switch field with label and error message.
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {string} props.className - Additional CSS classes for the switch
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.hint - Hint text for the field
 * @param {boolean} props.disabled - Whether the field is disabled
 */
Form.Switch = ({
  name,
  label,
  className = '',
  required = false,
  hint,
  disabled = false,
}) => {
  return (
    <div className="mb-4">
      <Field name={name} type="checkbox">
        {({ field, form }) => (
          <div className="flex items-center">
            <button
              type="button"
              className={`${field.value ? 'bg-primary-600' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
              role="switch"
              aria-checked={field.value}
              onClick={() => {
                if (!disabled) {
                  form.setFieldValue(name, !field.value);
                }
              }}
              disabled={disabled}
            >
              <span className="sr-only">{label}</span>
              <span
                className={`${field.value ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
              />
            </button>
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
              </span>
              {hint && <p className="text-xs text-gray-500">{hint}</p>}
            </div>
          </div>
        )}
      </Field>
      <ErrorMessage name={name}>
        {(msg) => <div className="mt-1 text-sm text-red-600">{msg}</div>}
      </ErrorMessage>
    </div>
  );
};

/**
 * Form.SubmitButton Component
 * 
 * A submit button for the form.
 * 
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes for the button
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {boolean} props.loading - Whether the button is in loading state
 * @param {React.ReactNode} props.children - Button content
 */
Form.SubmitButton = ({
  className = '',
  disabled = false,
  loading = false,
  children = 'Submit',
}) => {
  return (
    <button
      type="submit"
      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : children}
    </button>
  );
};

/**
 * Form.ResetButton Component
 * 
 * A reset button for the form.
 * 
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes for the button
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {React.ReactNode} props.children - Button content
 */
Form.ResetButton = ({
  className = '',
  disabled = false,
  children = 'Reset',
}) => {
  return (
    <button
      type="reset"
      className={`inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Form;