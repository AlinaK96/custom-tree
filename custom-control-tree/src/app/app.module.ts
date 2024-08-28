import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFactoryResolver, CUSTOM_ELEMENTS_SCHEMA, DoBootstrap, Injector, NgModule, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { components } from './components';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSelectModule } from "@angular/material/select";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";

const angularElements = [...components];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [...angularElements],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    HttpClientModule,
    MatTooltipModule,
    FormsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatCardModule,
    MatDividerModule,
  ],
  providers: [],
  bootstrap: [],
  entryComponents: [...angularElements],
})
export class AppModule implements DoBootstrap {
  constructor(private _injector: Injector, private _componentFactoryResolver: ComponentFactoryResolver) {}

  ngDoBootstrap() {
    this.registerAngularElements(angularElements);
  }

  registerAngularElements(components: Type<unknown>[], prefix?: string) {
    components.forEach((component) => {
      const factory = this._componentFactoryResolver.resolveComponentFactory(component);
      const customElement = createCustomElement(component, { injector: this._injector });
      const selector = prefix ? factory.selector + `-${prefix}` : factory.selector;

      if (!customElements.get(selector)) {
        customElements.define(selector, customElement);
      }
    });
  }
}
