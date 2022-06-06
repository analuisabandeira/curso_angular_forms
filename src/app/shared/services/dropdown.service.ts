import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { IEstadoBr } from '../models/estado-br';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {

  constructor(private http: HttpClient) { }

  getEstadosBr() {
    // return this.http.get('assets/dados/estadosbr.json');

    return this.http.get<IEstadoBr[]>('assets/dados/estadosbr.json').pipe();
  }

  getCargos() {
    return [
      { nome: 'Dev', nivel: 'Júnior', desc: 'Dev Jr'},
      { nome: 'Dev', nivel: 'Pleno', desc: 'Dev Pl'},
      { nome: 'Dev', nivel: 'Sênior', desc: 'Dev Sr'}
    ]
  }

  getTecnologias() {
    return [
      { nome: 'java', desc: 'Java'},
      { nome: 'javascript', desc: 'JavaScript'},
      { nome: 'php', desc: 'PHP'},
      { nome: 'ruby', desc: 'Ruby'}
    ]
  }

  getNewsletter() {

    return [
      { valor: 's', desc: 'Sim'},
      { valor: 'n', desc: 'Não'},
    ]
    
  }
}
