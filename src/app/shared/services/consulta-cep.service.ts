import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConsultaCepService {
  constructor(private http: HttpClient) {}

  consultaCEP(cep: string) {
    //A variável cep só aceita números, sem dígitos.
    cep = cep.replace(/\D/g, '');

    //Verifica se a variável cep é diferente de vazio
    if (cep !== '') {
      let validaCEP = /^[0-9]{8}$/;

      //Valida o formato do CEP
      if (validaCEP.test(cep)) {
        return this.http.get(`//viacep.com.br/ws/${cep}/json/`);
      }
    }

    return of({});
  }
}