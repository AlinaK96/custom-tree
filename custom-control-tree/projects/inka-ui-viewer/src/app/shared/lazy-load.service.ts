import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { Observable, ReplaySubject } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class LazyLoadService {
  loadedFiles: { [url: string]: ReplaySubject<void> } = {};

  constructor(@Inject(DOCUMENT) private readonly _document: Document) {}

  loadScript(url: string): Observable<void> {
    if (url in this.loadedFiles) {
      return this.loadedFiles[url].asObservable();
    }

    this.loadedFiles[url] = new ReplaySubject();

    const script = this._document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = () => {
      this.loadedFiles[url].next();
      this.loadedFiles[url].complete();
    };

    this._document.body.appendChild(script);

    return this.loadedFiles[url].asObservable();
  }
}
