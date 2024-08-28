/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import icClose from '@iconify/icons-ic/twotone-close';
import icUploadIcon from '@iconify/icons-ic/twotone-upload-file';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'inka-ui-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileUploaderComponent,
      multi: true,
    },
  ],
})
export class FileUploaderComponent implements ControlValueAccessor {
  uploadedFiles: File[] = [];

  get uploadedFileName() {
    const file = this.uploadedFiles[0];
    return file?.name;
  }

  get isRemoveVisible() {
    return !!this.uploadedFiles.length;
  }

  icons = {
    icUploadIcon,
    icClose,
  };

  @Input() isLink = false;
  @Input() canClear = true;

  @Input() accept?: string;
  @Input() placeholder?: string;
  @Input() multiple = false;
  @Input() maxSize = 1;
  @Input() maxFileCount = 1;

  @Output() uploaded = new EventEmitter<File[]>();
  @Output() remove = new EventEmitter<void>();

  isDisabled = false;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  onChange = (_val: any) => {};
  onTouched = () => {};

  constructor(private _fb: FormBuilder, private _cdr: ChangeDetectorRef) {}

  writeValue(val: unknown) {}

  registerOnChange(fn: (value: unknown) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  get acceptTypes(): string[] | undefined {
    if (this.accept.includes('*') || !this.accept.length) return undefined;
    return (this.accept || '')
      .split(',')
      .map((type) => type.trim().toLowerCase().replace('.', ''));
  }

  isFileAccepted(fileType: string): boolean {
    if (this.acceptTypes === undefined) return true;
    return this.acceptTypes.some((type) =>
      fileType.toLowerCase().includes(type)
    );
  }

  prepareFileToUpload(changeFileEvent: Event) {
    const target: HTMLInputElement | null =
      changeFileEvent.target as HTMLInputElement;
    const filesToUpload: File[] = [];

    if (target.files?.length) {
      for (let i = 0; i < target.files.length; i++) {
        const file = target.files?.item(i) as File;
        if (this.isFileAccepted(file.type)) filesToUpload.push(file);
      }
    }

    this.uploadedFiles = filesToUpload;
    this.uploaded.emit(filesToUpload);
    this.onChange([...filesToUpload]);
  }

  removeFiles() {
    this.uploadedFiles = [];
    this.uploaded.emit([]);
    this.remove.emit();
    this.onChange([]);
  }

  removeFile(file: File, idx: number) {
    const count = 1;
    this.uploadedFiles.splice(idx, count);
    this.uploaded.emit(this.uploadedFiles);
    this.remove.emit();
    this.onChange([...this.uploadedFiles]);
  }
}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { IconModule } from '@visurel/iconify-angular';
import { DeclensionNumberPipe } from '../../pipes/declension-number.pipe';

@NgModule({
  declarations: [FileUploaderComponent, DeclensionNumberPipe],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    IconModule,
  ],
  exports: [],
  providers: [],
})
export class FileUploaderModule {}
