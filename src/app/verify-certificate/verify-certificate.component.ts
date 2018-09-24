import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {TdLoadingService} from '@covalent/core';
import {VerifyCertificateService} from './verify-certificate.service';
import {CertificateTemplateService} from '../CertificateTemplate/CertificateTemplate.service';
import {sha256} from '../shared/sha256'
import {PersonalCertificate} from '../org.degree';
import {AuthService} from '../auth/auth.service'
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {CertificateTemplate} from '../org.degree';

@Component({
	selector: 'app-verify-certificate',
	templateUrl: './verify-certificate.component.html',
	styleUrls: ['./verify-certificate.component.css'],
	providers: [VerifyCertificateService, CertificateTemplateService]
})
export class VerifyCertificateComponent implements OnInit {

	myForm: FormGroup;
	errorMessage: string;
	successMessage: string;
	templateId: string;

	private personalCertificateHistory: any[] = [];
	private administratorHistory: any[] = [];

	certId = new FormControl(null, Validators.required);
	email: string;

	currentCertId: string = null;
	personalCertificate: any;
	steps = [
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
	];

	constructor(private verifyCertificateService: VerifyCertificateService,
				private loadingService: TdLoadingService,
				private certificateTemplateService: CertificateTemplateService,
				private authService: AuthService,
				private router: Router,
				public fb: FormBuilder) {
					this.myForm = fb.group({
					certId: this.certId
				});
	};

	async ngOnInit() {
		const isAuthenticated = await this.authService.isAuthenticated();
		const hasSignedUp = await this.authService.hasSignedUp();
		console.log(isAuthenticated, hasSignedUp);
		if (isAuthenticated && hasSignedUp){
			await this.authService.setCurrentUser();
		}
		if (isAuthenticated && !hasSignedUp) {
			  this.router.navigate(['/signup']);
		} else {
			  this.router.navigate(['/verify-certificate']);
		}
	}

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
		this.steps[0].passed = false;
		this.steps[0].done = false;
		this.steps[1].passed = false;
		this.steps[1].passed = false;
		if (this.myForm.valid) {
			this.registerLoading();
			this.verifyCertificateService.getAsset(this.certId.value).subscribe(
				(result) => {
					this.currentCertId = this.certId.value;
					this.personalCertificate = result;
					this.templateId = this.personalCertificate['templateId'];
					this.templateId = this.templateId.substring(this.templateId.indexOf("#") + 1, this.templateId.length);
					this.errorMessage = null;
					this.successMessage = null;
					this.verifyHash(result);	
				},
				(error) => {
					if (error === 'Server error') {
						this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
					} else {
						this.errorMessage = error;
					}
					this.resolveLoading();
				}, () => {
					const transaction = {
						$class: 'org.degree.PersonalCertificateHistory',
						'certId': this.certId.value
					};
					this.verifyCertificateService.requestPersonalCertificateHistory(transaction).subscribe(
						(data) => {
							console.log("Request Personal Certificate");
							console.log(data);
							this.verifyCertificateService.getPersonalCertificateHistory(data.transactionId).subscribe(
								async (results) => {
									this.errorMessage = null;
									results = results[0].eventsEmitted[0].results;
									for (let i = 0; i < results.length; i++) {
										let result = results[i].replace(/\\/g, " ");
										result = result.replace(/\"\{/g, "{");
										result = result.replace(/\}\"/g, "}");
										result = JSON.parse(result);
										
										const record = {
											historianRecord: await this.verifyCertificateService.getHistorianRecord(result.tx_id),
											value: result.value
										};
										this.personalCertificateHistory.push(record);
									}
								  console.log(this.personalCertificateHistory);
								},
								(error) => {
									if (error === 'Server error') {
										this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
									} else {
										this.errorMessage = error;
									}
									this.resolveLoading();
								}
							);
						},
						(error) => {
							if (error === 'Server error') {
								this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
							} else {
								this.errorMessage = error;
							}
							this.resolveLoading();
						},
						() => {
							this.email =  this.personalCertificate.localAdministrator;
							this.email = this.email.substring(this.email.indexOf('#') + 1, this.email.length);
							const transaction = {
								$class: 'org.degree.AdministratorHistory',
								'email': this.email
							};
							this.verifyCertificateService.requestAdministratorHistory(transaction).subscribe(
								(data) => {
									console.log("Administrator History");
									console.log(data);
									this.verifyCertificateService.getPersonalCertificateHistory(data.transactionId).subscribe(
										async (results) => {
											this.errorMessage = null;
											console.log("Administrator History Result");
											console.log(results);
											results = results[0].eventsEmitted[0].results;
											for (let i = 0; i < results.length; i++) {
												let result = results[i].replace(/\\/g, " ");
												result = result.replace(/\"\{/g, "{");
												result = result.replace(/\}\"/g, "}");
												result = JSON.parse(result);
												const record = {
													historianRecord: await this.verifyCertificateService.getHistorianRecord(result.tx_id),
													value: result.value
												};
												this.administratorHistory.push(record);
											}
											this.verifyIssuer();
											this.resolveLoading();
										},
										(error) => {
											if (error === 'Server error') {
												this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
											} else {
												this.errorMessage = error;
											}
											this.resolveLoading();
										}
									);
								},
								(error) => {
									if (error === 'Server error') {
										this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
									} else {
										this.errorMessage = error;
									}
									this.resolveLoading();
								});
						});
						
				});
		} else {
			Object.keys(this.myForm.controls).forEach(field => {
				const control = this.myForm.get(field);
				control.markAsTouched({ onlySelf: true });
			});
		}
	}

	verifyIssuer(): Promise<void> {
		// issuer identity
		return new Promise (resolve => setTimeout(resolve => {
			this.steps[1].passed = this.personalCertificateHistory[0].historianRecord.transactionTimestamp >= this.administratorHistory[0].historianRecord.transactionTimestamp;
			this.steps[1].done = true;
		}, 2000));
	}

	verifyHash(certificate: PersonalCertificate): void {
		// certificate integrity
		const hash = certificate.hash;
		delete certificate.hash;
		setTimeout(() => {
			this.steps[0].passed = hash === sha256(JSON.stringify(certificate));
			this.steps[0].done = true;
		}, 2000);
	}

	registerLoading(key = 'loading'): void {
		this.loadingService.register(key);
	}

	resolveLoading(key = 'loading'): void {
		this.loadingService.resolve(key);
	}

}
