import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';

export class FormValidations {
  static requiredMinCheckbox(min: number) {
    const validator = (formArray: AbstractControl) => {
      // const values = formArray.controls;
      // let totalChecked = 0;

      // for (let i = 0; i < values.length; i++) {
      //   if(values[i].value) {
      //     totalChecked+=1;
      //   }
      // }

      if (formArray instanceof FormArray) {
        const totalChecked = formArray.controls
          .map((v) => v.value)
          .reduce((total, current) => (current ? total + current : total), 0);

        return totalChecked >= min ? null : { required: true };
      }
      throw new Error('formArray is not an instance of FormArray');
    };

    return validator;
  }

  static cepValidator(control: FormControl) {
    const cep = control.value;

    if (cep && cep !== '') {
      const validaCEP = /^[0-9]{8}$/;
      return validaCEP.test(cep) ? null : { cepInvalido: true };
    }
    return null;
  }

  static equalsTo(otherField: string) {
    const validator = (formControl: FormControl) => {
      if (otherField == null) {
        throw new Error('É necesário preencher o campo!');
      }

      if (!formControl.root || !(formControl.root as FormGroup).controls) {
        return null;
      }

      const field = (formControl.root as FormGroup).get('otherField');
      
      if (!field) {
        throw new Error('É necesário informar um campo válido!');
      }

      if(field.value !== formControl.value) {
        return { equalsTo: otherField };
      }

      return null;
    }
    return validator;
  }
}
