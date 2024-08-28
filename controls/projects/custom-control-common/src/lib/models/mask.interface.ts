import IMask from 'imask';

export interface IMaskConfig {
  type: string;
  mask: IInkaMask;
}

export interface IInkaMask {
  name: string;
  options: IMaskOption[];
  converter: IMaskOptionsConverter;
}

export interface IMaskOption {
  type: string;
  name: string;
  label?: string;
  editable: boolean;
  required?: boolean;
  value?: unknown;
}

export interface IMaskOptionsConverter {
  convert(
    options: Record<string, unknown> | undefined
  ): IMask.AnyMaskedOptions | undefined;
}
