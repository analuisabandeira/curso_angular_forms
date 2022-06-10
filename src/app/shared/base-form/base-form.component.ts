import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-base-form',
  template: '<div></div>',
})
export abstract class BaseFormComponent implements OnInit {
  form!: FormGroup;
  constructor() {}

  ngOnInit(): void {}

  abstract submit(): any;

  onSubmit() {
    if (this.form.valid) {
      this.submit();
    } else {
      this.verificaValidacoesForm(this.form);
    }
  }

  verificaValidacoesForm(formGroup: FormGroup | FormArray) {
    Object.keys(formGroup.controls).forEach((campo) => {
      // console.log(campo);

      const controle = formGroup.get(campo);
      controle?.markAsDirty();
      controle?.markAsTouched();
      if (controle instanceof FormGroup || controle instanceof FormArray) {
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

  verificaRequired(campo: string) {
    return (
      this.form.get(campo)?.hasError('required') &&
      (this.form.get(campo)?.touched || this.form.get(campo)?.dirty)
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

  verificaEmailInvalido() {
    const campoEmail = this.form.get('email');
    if (campoEmail?.errors) {
      return campoEmail.errors['email'] && campoEmail.touched;
    }
  }
}
