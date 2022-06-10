import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  distinctUntilChanged,
  empty,
  EMPTY,
  map,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { FormValidations } from '../form-validations';
import { BaseFormComponent } from '../shared/base-form/base-form.component';
import { ICidade } from '../shared/models/cidades';

import { IEstadoBr } from '../shared/models/estado-br';
import { ConsultaCepService } from '../shared/services/consulta-cep.service';
import { DropdownService } from '../shared/services/dropdown.service';
import { VerificaEmailService } from './services/verifica-email.service';

@Component({
  selector: 'app-data-form',
  templateUrl: './data-form.component.html',
  styleUrls: ['./data-form.component.scss'],
})
export class DataFormComponent extends BaseFormComponent implements OnInit {
  estados!: IEstadoBr[];
  // estados!: Observable<IEstadoBr[]>;
  cidades!: ICidade[];
  cargos!: any[];
  tecnologias!: any[];
  newsletterOp!: any[];
  frameworks = ['Angular', 'React', 'Vue', 'Sencha'];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private dropdownService: DropdownService,
    private cepService: ConsultaCepService,
    private verificaEmailService: VerificaEmailService
  ) {
    super();
  }

  override ngOnInit(): void {
    // this.dropdownService.getEstadosBr().subscribe((dados) => {
    //   this.estados = dados;
    // });

    // this.form = new FormGroup({
    //   nome: new FormControl(null),
    //   email: new FormControl(null),
    // });

    // this.verificaEmail.verificarEmail('email@email.com').subscribe();

    // this.estados = this.dropdownService.getEstadosBr();

    this.dropdownService
      .getEstadosBr()
      .subscribe((dados) => (this.estados = dados));

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
      email: [
        null,
        [Validators.required, Validators.email],
        this.validarEmail.bind(this),
      ],
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

    // console.log(this.form.get('nome')?.value);

    this.form
      .get('endereco.cep')
      ?.statusChanges.pipe(
        distinctUntilChanged(),
        tap((value) => console.log('Status CEP', value)),
        switchMap((status) =>
          status === 'VALID'
            ? this.cepService.consultaCEP(this.form.get('endereco.cep')?.value)
            : EMPTY
        )
      )
      .subscribe((dados) => (dados ? this.insereDadosForm(dados) : {}));

    this.form
      .get('endereco.estado')
      ?.valueChanges.pipe(
        tap((estado) => console.log('Novo estado: ', estado)),
        map(estado => this.estados.filter(e => e.sigla === estado)),
        map((estados) => estados && estados.length > 0 ? estados[0].id : EMPTY),
        switchMap(estadoId => this.dropdownService.getCidades(Number(estadoId)))
        )
      .subscribe(cidades => this.cidades = cidades);
     

    // this.dropdownService.getCidades(8).subscribe(console.log);
  }

  submit() {
    let valueSubmit = Object.assign({}, this.form.value);

    valueSubmit = Object.assign(valueSubmit, {
      frameworks: valueSubmit.frameworks
        .map((v: any, i: any) => (v ? this.frameworks[i] : null))
        .filter((v: any) => v !== null),
    });

    this.http
      .post('https://httpbin.org/post', JSON.stringify(valueSubmit))
      .subscribe(
        (dados) => {
          // console.log(dados);
          // Resetando o form
          // this.form.reset();
          // ou this.resetar();
        },
        (error: any) => alert('Erro!')
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

    return this.formBuilder.array(
      values,
      FormValidations.requiredMinCheckbox(1)
    );
  }

  getFormControls() {
    const formArray = this.form.get('frameworks') as FormArray;
    // console.log(formArray);
    return formArray.controls;
  }

  validarEmail(formControl: FormControl) {
    return this.verificaEmailService
      .verificarEmail(formControl.value)
      .pipe(
        map((emailExiste) => (emailExiste ? { emailInvalido: true } : null))
      );
  }

  getFormControl(controlName: string) {
    const control = this.form.get(controlName) as FormControl;
    return control;
  }
}
