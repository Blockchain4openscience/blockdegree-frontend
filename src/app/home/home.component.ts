/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {TdLoadingService} from '@covalent/core';
import {sha256} from '../shared/sha256'
import {PersonalCertificate} from '../org.degree';
import {Administrator} from '../org.degree';
import {CertificateTemplate} from '../org.degree';
import {VerifyCertificateService} from "../verify-certificate/verify-certificate.service";
import {AdministratorService} from "../Administrator/Administrator.service";
import {CertificateTemplateService} from "../CertificateTemplate/CertificateTemplate.service";

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
	providers: [VerifyCertificateService, AdministratorService, CertificateTemplateService]
})
export class HomeComponent implements OnInit {

	myForm: FormGroup;
	errorMessage: string;
	successMessage: string;

	private Transaction;
	private certificate;
	administrator: Administrator;
	certificateTemplate: CertificateTemplate;

	certId = new FormControl(null, Validators.required);

	currentCertId: string = null;
	templateId: string = null;
	administratorId: string = null;
	/*steps = [
		{
			name: 'Certificate Integrity',
			done: false,
			passed: false,
		},
		{
			name: 'Issuer Identity',
			done: false,
			passed: false,
		}
	];*/

	constructor(private verifyCertificateService: VerifyCertificateService,
							private administratorService: AdministratorService,
							private certificateTemplateService: CertificateTemplateService,
							private loadingService: TdLoadingService,
							public fb: FormBuilder) {
		this.myForm = fb.group({
			certId: this.certId
		});
	};

	ngOnInit(): void {	}

	/**
	 * Event handler for changing the checked state of a checkbox (handles array enumeration values)
	 * @param {String} name - the name of the transaction field to update
	 * @param {any} value - the enumeration value for which to toggle the checked state
	 */
	changeArrayValue(name: string, value: any): void {
		const index = this[name].value.indexOf(value);
		if (index === -1) {
			this[name].value.push(value);
		} else {
			this[name].value.splice(index, 1);
		}
	}

	/**
	 * Checkbox helper, determining whether an enumeration value should be selected or not (for array enumeration values
	 * only). This is used for checkboxes in the transaction updateDialog.
	 * @param {String} name - the name of the transaction field to check
	 * @param {any} value - the enumeration value to check for
	 * @return {Boolean} whether the specified transaction field contains the provided value
	 */
	hasArrayValue(name: string, value: any): boolean {
		return this[name].value.indexOf(value) !== -1;
	}

	submit(): void {
		this.successMessage = null;

		if (this.myForm.valid) {
			this.registerLoading();
			this.verifyCertificateService.getAsset(this.certId.value).subscribe(
				(result) => {

					this.currentCertId = this.certId.value;
					this.errorMessage = null;
					//this.myForm.reset();
					this.certificate = result;
					this.templateId = this.certificate['templateId'];
					this.administratorId = this.certificate['localAdministrator']
					this.certificate.templateId = this.templateId.substring(this.templateId.indexOf("#") + 1, this.templateId.length);
					this.certificate.localAdministrator = this.administratorId.substring(this.administratorId.indexOf("#") + 1, this.administratorId.length);
					this.successMessage = null;
					//console.log(this.templateId);
					/*
					this.administratorService.getParticipant(this.certificate.localAdministrator).subscribe(
						(result) => {
							this.errorMessage = null;
							this.administrator = result;
							//console.log(result);
							this.successMessage = null;
						},
						(error) => {
							if (error === 'Server error') {
								this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
							} else {
								this.errorMessage = error;

							}
						});
				*/
					this.certificateTemplateService.getAsset(this.certificate.templateId).subscribe(
						(result) => {
							this.errorMessage = null;
							this.certificateTemplate = result;
							//console.log(result);
							this.successMessage = null;
						},
						(error) => {
							if (error === 'Server error') {
								this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
							} else {
								this.errorMessage = error;

							}
						});


					//this.verify(result);
					this.resolveLoading();
				},
				(error) => {
					if (error === 'Server error') {
						this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
					} else {
						this.errorMessage = error;

					}
					this.currentCertId = null;
					this.resolveLoading();
				});
		} else {
			Object.keys(this.myForm.controls).forEach(field => {
				const control = this.myForm.get(field);
				control.markAsTouched({ onlySelf: true });
				// console.log(field, control.errors);
			});
		}
	}

	/*
	verify(certificate: PersonalCertificate): void {
		// certificate integrity
		const hash = certificate.hash;
		delete certificate.hash;
		setTimeout(() => {
			this.steps[0].passed = hash === sha256(JSON.stringify(certificate));
			this.steps[0].done = true;
		}, 2000);
		setTimeout(() => {
			this.steps[1].done = true;
		}, 3000);
	}
*/
	registerLoading(key = 'loading'): void {
		this.loadingService.register(key);
	}

	resolveLoading(key = 'loading'): void {
		this.loadingService.resolve(key);
	}


}

