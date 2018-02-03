import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class WasmService {

  constructor(private http: HttpClient) { }

  /**
   * Instantiates a JavaScript loader for WebAssembly, generated by Emscripten
   * 
   * @param url the URL to the generated JavaScript loader
   * @param moduleObj optional module options
   */
  instantiateJs(url: string, moduleObj?: EmModule): Observable<string> {
    const script = document.createElement('script');
    script.async = true;
    document.body.appendChild(script);

    if (moduleObj) {
      window.Module = moduleObj;
    }

    return new Observable<string>(subscriber => {
      script.onload = () => {
        subscriber.next(script.innerHTML);
        subscriber.complete();
      };
      script.onerror = (ev: ErrorEvent) => subscriber.error(ev.error);
      script.src = url;
    });
  }

  /**
   * Instantiates a pure WebAsembly module
   * 
   * @param url the URL to the module
   * @param imports optional imports for the module
   */
  instantiateWasm(url: string, imports?: Object): Observable<WebAssembly.Instance> {
    return this.http.get(url, { responseType: 'arraybuffer' })
      .mergeMap(bytes => WebAssembly.compile(bytes))
      .mergeMap(wasmModule => WebAssembly.instantiate(wasmModule, imports));
  }

  /**
   * Exits the active Emscripten environment by calling exit()
   */
  exitActiveEnvironment() {
    if (!window.Module)
      throw Error('No active Emscripten environment found');

    const mod = window.Module;
    mod.noExitRuntime = false;
    try {
      mod.exit(0);
    }
    catch (err) {
      if (err.name !== 'ExitStatus')
        throw err;
    }
  }

  /**
   * Reads a UTF8 zero-terminated string from the memory
   * 
   * @param heap the memory
   * @param offset a pointer to the memory
   */
  utf8ToString(heap: Uint8Array, offset: number): string {
    let s = '';
    for (let i = offset; heap[i]; i++) {
      s += String.fromCharCode(heap[i]);
    }
    return s;
  }
}