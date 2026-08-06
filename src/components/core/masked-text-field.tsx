'use client';

import * as React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { IMaskInput } from 'react-imask';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  onAccept?: (value: string, unmaskedValue: string) => void;
  name: string;
  mask: string;
  unmask: boolean;
  placeholder?: string;
}

const IMaskInputCustom = React.forwardRef<HTMLInputElement, CustomProps>(function IMaskInputCustom(props, ref) {
  const { onChange, onAccept, mask, unmask, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask={mask}
      inputRef={ref}
      unmask={unmask}
      onAccept={(value: string, maskRef: any) => {
        const unmaskedValue = maskRef.unmaskedValue;
        onChange({ target: { name: other.name || '', value: unmaskedValue } });
        if (onAccept) {
          onAccept(value, unmaskedValue);
        }
      }}
    />
  );
});

interface MaskedTextFieldProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  mask: string;
  unmask?: boolean;
  onAccept?: (value: string, unmaskedValue: string) => void;
  value?: string;
}

export function MaskedTextField({
  mask,
  unmask = true,
  onAccept,
  value = '',
  inputRef: inputRefProp,
  ...textFieldProps
}: MaskedTextFieldProps): React.JSX.Element {
  return (
    <TextField
      {...textFieldProps}
      InputProps={{
        inputComponent: IMaskInputCustom as any,
        inputProps: {
          mask,
          unmask,
          name: textFieldProps.name || '',
          onAccept,
          placeholder: textFieldProps.placeholder,
        },
      }}
      value={value}
    />
  );
}