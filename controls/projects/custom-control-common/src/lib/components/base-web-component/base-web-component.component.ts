import { ElementRef, Renderer2 } from '@angular/core';

export abstract class BaseWebComponentComponent {
  actions: Record<string, (params: Record<string, unknown>) => void> = {};

  constructor(protected elementRef: ElementRef, protected renderer: Renderer2) {}

  protected emit<T>(event: string, payload?: T, bubbles = false, composed = false) {
    this.dispatchEvent('sendEvent', { event, payload }, bubbles, composed);
  }

  protected setValue<T>(value: T) {
    this.dispatchEvent('valueChange', value);
    this.emit('Change', value);
  }

  protected listenEvent(event: string, callback: (event: CustomEvent<IControlAction>) => boolean | void) {
    return this.renderer.listen(this.elementRef.nativeElement, event, callback);
  }

  protected dispatchEvent<T>(event: string, payload: T, bubbles = false, composed = false) {
    const options = {
      detail:  payload,
      bubbles,
      composed
    };
    this.elementRef.nativeElement.dispatchEvent(
      new CustomEvent(event, options)
    );
  }

  protected abstract setHandlers(): void;

  protected abstract removeHandlers(): void;

  runAction(actionName: string,  params: Record<string, unknown>) {
    const action = this.actions[actionName];

    if (!action) {
      throw new Error('Not support action');
    }

    action(params);
  }

  addAction(actionName: string,  callback: (params: Record<string, unknown>) => void) {
    this.actions[actionName] = callback;
  }
}

interface IControlAction {
  name: string;
  params: Record<string, unknown>
}
