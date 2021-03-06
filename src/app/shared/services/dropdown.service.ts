import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { IEstadoBr } from '../models/estado-br';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {

  constructor(private http: HttpClient) { }

  getEstadosBr() {
    // return this.http.get('assets/dados/estadosbr.json')
    // .pipe(map(res=> res));

    return this.http.get<IEstadoBr[]>('assets/dados/estadosbr.json').pipe();
  }
}
