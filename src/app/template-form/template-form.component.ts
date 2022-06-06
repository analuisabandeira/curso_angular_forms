import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ConsultaCepService } from '../shared/services/consulta-cep.service';

@Component({
  selector: 'app-template-form',
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.scss'],
})
export class TemplateFormComponent implements OnInit {
  usuario: any = {
    nome: null,
    email: null,
  };

  constructor(
    private http: HttpClient,
    private cepService: ConsultaCepService
  ) {}

  ngOnInit(): void {}

  onSubmit(form: any) {
    this.http
      .post('enderecoServer/formUsuario', JSON.stringify(form.value))
      .subscribe((dados) => {
        console.log(dados);
        form.form.reset();
      });
  }

  verificaValidTouched(campo: any) {
    return !campo.valid && campo.touched;
  }

  onError(campo: any) {
    return {
      'is-invalid': this.verificaValidTouched(campo),
    };
  }

  consultaCEP(cep: any, form: any) {
    //A variável cep só aceita números, sem dígitos.
    cep = cep.replace(/\D/g, '');

    if (cep != null && cep !== '') {
      this.cepService
        .consultaCEP(cep)
        .subscribe((dados) => this.insereDadosForm(dados, form));
    }
  }

  insereDadosForm(dados: any, formulario: any) {
    // form.setValue({
    //   nome: form.value.nome,
    //   email: form.value.email,
    //   endereco: {
    //     cep: dados.cep,
    //     numero: '',
    //     complemento: dados.complemento,
    //     rua: dados.logradouro,
    //     bairro: dados.bairro,
    //     cidade: dados.localidade,
    //     estado: dados.uf,
    //   },
    // });

    formulario.form.patchValue({
      endereco: {
        cep: dados.cep,
        complemento: dados.complemento,
        rua: dados.logradouro,
        bairro: dados.bairro,
        cidade: dados.localidade,
        estado: dados.uf,
      },
    });
  }

  resetaForm(formulario: any) {
    formulario.form.patchValue({
      endereco: {
        cep: null,
        complemento: null,
        rua: null,
        bairro: null,
        cidade: null,
        estado: null,
      },
    });
  }
}
