import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncoderService {

  base64Encode(value: string): string {
    return btoa(value);
  }

  base64Decode(value: string): string {
    return atob(value);
  }

  urlEncode(value: string): string {
    return encodeURIComponent(value);
  }

  urlDecode(value: string): string {
    return decodeURIComponent(value);
  }

  htmlEncode(value: string): string {
    const div = document.createElement('div');
    div.innerText = value;
    return div.innerHTML;
  }

  htmlDecode(value: string): string {
    const div = document.createElement('div');
    div.innerHTML = value;
    return div.innerText;
  }
}
