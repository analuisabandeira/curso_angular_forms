import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { map } from 'rxjs/operators';
import { IEstadoBr } from '../shared/models/estado-br';
import { DropdownService } from '../shared/services/dropdown.service';

@Component({
  selector: 'app-data-form',
  templateUrl: './data-form.component.html',
  styleUrls: ['./data-form.component.scss'],
})
export class DataFormComponent implements OnInit {
  form!: FormGroup;
  estados!: IEstadoBr[];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private dropdownService: DropdownService
  ) {}

  ngOnInit(): void {
    this.dropdownService.getEstadosBr().subscribe((dados) => {
      this.estados = dados;
    });

    // this.form = new FormGroup({
    //   nome: new FormControl(null),
    //   email: new FormControl(null),
    // });

    this.form = this.formBuilder.group({
      nome: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
        ],
      ],
      email: [null, [Validators.required, Validators.email]],
      endereco: this.formBuilder.group({
        cep: [null, Validators.required],
        numero: [null, Validators.required],
        complemento: [null],
        rua: [null, Validators.required],
        bairro: [null, Validators.required],
        cidade: [null, Validators.required],
        estado: [null, Validators.required],
      }),
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.http
        .post('https://httpbin.org/post', JSON.stringify(this.form.value))
        .pipe(map((resposta: any) => resposta))
        .subscribe(
          (dados) => {
            console.log(dados);
            // Resetando o form
            // this.form.reset();
            // ou this.resetar();
          },
          (error: any) => alert('Erro!')
        );
    } else {
      console.log('Form inválido!');
      this.verificaValidacoesForm(this.form);
    }
  }

  verificaValidacoesForm(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((campo) => {
      // console.log(campo);

      const controle = formGroup.get(campo);
      controle?.markAsDirty();

      if (controle instanceof FormGroup) {
        this.verificaValidacoesForm(controle);
      }
    });
  }

  resetar() {
    this.form.reset();
  }

  verificaValidTouched(campo: string) {
    // this.form.controls[campo];

    return (
      !this.form.get(campo)?.valid &&
      !!(this.form.get(campo)?.touched || this.form.get(campo)?.dirty)
    );
  }

  onError(campo: string) {
    return {
      'is-invalid': this.verificaValidTouched(campo),
    };
  }

  validFeedback(campo: any) {
    return (
      this.form.get(campo)?.valid &&
      (this.form.get(campo)?.touched || this.form.get(campo)?.dirty)
    );
  }

  consultaCEP() {
    let cep = this.form.get('endereco.cep')?.value;

    //A variável cep só aceita números, sem dígitos.
    cep = cep.replace(/\D/g, '');

    //Verifica se a variável cep é diferente de vazio
    if (cep != '') {
      let validaCEP = /^[0-9]{8}$/;

      //Valida o formato do CEP
      if (validaCEP.test(cep)) {
        this.resetaForm();

        this.http
          .get(`//viacep.com.br/ws/${cep}/json/`)
          .pipe(map((dados: any) => dados))
          .subscribe((dados) => this.insereDadosForm(dados));
      }
    }
  }

  insereDadosForm(dados: any) {
    this.form.patchValue({
      endereco: {
        cep: dados.cep,
        complemento: dados.complemento,
        rua: dados.logradouro,
        bairro: dados.bairro,
        cidade: dados.localidade,
        estado: dados.uf,
      },
    });

    this.form.get('nome')?.setValue('Analu');
  }

  resetaForm() {
    this.form.patchValue({
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
