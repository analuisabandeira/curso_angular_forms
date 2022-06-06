import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { FormValidations } from '../form-validations';

import { IEstadoBr } from '../shared/models/estado-br';
import { ConsultaCepService } from '../shared/services/consulta-cep.service';
import { DropdownService } from '../shared/services/dropdown.service';

@Component({
  selector: 'app-data-form',
  templateUrl: './data-form.component.html',
  styleUrls: ['./data-form.component.scss'],
})
export class DataFormComponent implements OnInit {
  form!: FormGroup;
  // estados!: IEstadoBr[];
  estados!: Observable<IEstadoBr[]>;

  cargos!: any[];
  tecnologias!: any[];
  newsletterOp!: any[];
  frameworks = ['Angular', 'React', 'Vue', 'Sencha'];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private dropdownService: DropdownService,
    private cepService: ConsultaCepService
  ) {}

  ngOnInit(): void {
    // this.dropdownService.getEstadosBr().subscribe((dados) => {
    //   this.estados = dados;
    // });

    // this.form = new FormGroup({
    //   nome: new FormControl(null),
    //   email: new FormControl(null),
    // });

    this.estados = this.dropdownService.getEstadosBr();

    this.cargos = this.dropdownService.getCargos();

    this.tecnologias = this.dropdownService.getTecnologias();

    this.newsletterOp = this.dropdownService.getNewsletter();

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
      confirmarEmail: [null, FormValidations.equalsTo('email')],
      endereco: this.formBuilder.group({
        cep: [null, [Validators.required, FormValidations.cepValidator]],
        numero: [null, Validators.required],
        complemento: [null],
        rua: [null, Validators.required],
        bairro: [null, Validators.required],
        cidade: [null, Validators.required],
        estado: [null, Validators.required],
      }),
      cargo: [null],
      tecnologias: [null],
      newsletter: ['s'],
      termos: [null, Validators.pattern('true')],
      frameworks: this.buildFrameworks(),
    });
  }

  onSubmit() {
    console.log(this.form);

    let valueSubmit = Object.assign({}, this.form.value);

    valueSubmit = Object.assign(valueSubmit, {
      frameworks: valueSubmit.frameworks
        .map((v: any, i: any) => (v ? this.frameworks[i] : null))
        .filter((v: any) => v !== null),
    });

    console.log(valueSubmit);

    if (this.form.valid) {
      this.http
        .post('https://httpbin.org/post', JSON.stringify(valueSubmit))
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

    if (cep != null && cep !== '') {
      this.cepService
        .consultaCEP(cep)
        .subscribe((dados) => this.insereDadosForm(dados));
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

  setarCargo() {
    const cargo = { nome: 'Dev', nivel: 'Pleno', desc: 'Dev Pl' };
    this.form.get('cargo')?.setValue(cargo);
  }

  compararCargos(obj1: any, obj2: any) {
    return obj1 && obj2
      ? obj1.nome === obj2.nome && obj1.nivel === obj2.nivel
      : obj1 === obj2;
  }

  setarTecnologias() {
    this.form.get('tecnologias')?.setValue(['java', 'javascript', 'php']);
  }

  buildFrameworks() {
    const values = this.frameworks.map((framework) => new FormControl(false));

    return this.formBuilder.array(values, FormValidations.requiredMinCheckbox(1));
  }

  getFormControls() {
    const formArray = this.form.get('frameworks') as FormArray;

    console.log(formArray);

    return formArray.controls;
  }
}