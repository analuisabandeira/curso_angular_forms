import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  onSubmit(form: any) {
    this.http
      .post('enderecoServer/formUsuario', JSON.stringify(form.value))
      .pipe(map((resposta: any) => resposta))
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

    //Verifica se a variável cep é diferente de vazio
    if (cep != '') {
      let validaCEP = /^[0-9]{8}$/;

      //Valida o formato do CEP
      if (validaCEP.test(cep)) {
        this.resetaForm(form);

        this.http
          .get(`//viacep.com.br/ws/${cep}/json/`)
          .pipe(map((dados: any) => dados))
          .subscribe((dados) => this.insereDadosForm(dados, form));
      }
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
