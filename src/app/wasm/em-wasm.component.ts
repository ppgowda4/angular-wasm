import { AfterViewInit, OnDestroy } from '@angular/core';
import { EmWasmService } from './em-wasm.service';
import { environment } from '../../environments/environment';

export abstract class EmWasmComponent implements AfterViewInit, OnDestroy {

  jsFile: string;
  emModule?: () => EmModule;

  constructor(protected wasm: EmWasmService) { }

  ngAfterViewInit(): void {
    const mod: EmModule = (this.emModule && this.emModule()) || {};
    if (!mod.locateFile) {
      mod.locateFile = file => `${environment.wasmAssetsPath}/${file}`;
    }

    this.wasm.instantiateJs(`${environment.wasmAssetsPath}/${this.jsFile}`, mod).subscribe();
  }

  ngOnDestroy(): void {
    this.wasm.exitActiveEnvironment();
  }
}