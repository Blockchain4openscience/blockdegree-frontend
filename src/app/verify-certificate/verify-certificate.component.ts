import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {TdLoadingService} from '@covalent/core';
import {VerifyCertificateService} from './verify-certificate.service';
import {sha256} from '../shared/sha256'
import {PersonalCertificate} from '../org.degree';
import {AuthService} from "../auth/auth.service";

@Component({
	selector: 'app-verify-certificate',
	templateUrl: './verify-certificate.component.html',
	styleUrls: ['./verify-certificate.component.css'],
	providers: [VerifyCertificateService]
})
export class VerifyCertificateComponent implements OnInit {

	myForm: FormGroup;
	errorMessage: string;
	successMessage: string;

	private personalCertificateHistory: any[] = [];
	private administratorHistory: any[] = [];

	certId = new FormControl(null, Validators.required);
	// transactionId = new FormControl('', Validators.required);
	// timestamp = new FormControl('', Validators.required);

	currentCertId: string = null;
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
							private authService: AuthService,
							public fb: FormBuilder) {
		this.myForm = fb.group({
			certId: this.certId,
			// transactionId: this.transactionId,
			// timestamp: this.timestamp
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
					// this.myForm.reset();
					// this.successMessage = ' Transaction ' + result.transactionId + ' submitted successfully.';
					this.successMessage = null;
					console.log(result);
					this.verifyHash(result);
					// this.resolveLoading();
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
						'certId': this.certId.value,
						// 'transactionId': this.transactionId.value,
						// 'timestamp': this.timestamp.value
					};
					this.verifyCertificateService.requestPersonalCertificateHistory(transaction).subscribe(
						(data) => {
							console.log(data);
							this.verifyCertificateService.getPersonalCertificateHistory(data.transactionId).subscribe(
								async (results) => {
									this.errorMessage = null;
									// this.myForm.reset();
									// this.successMessage = ' Transaction ' + '' + ' submitted successfully.';
									console.log(results);
									results = results[0].eventsEmitted[0].results;
									for (let i = 0; i < results.length; i++) {
										const result = JSON.parse(results[i]);
										const record = {
											historianRecord: await this.verifyCertificateService.getHistorianRecord(result.tx_id),
											value: JSON.parse(result.value)
										};
										this.personalCertificateHistory.push(record);
									}
									console.log(this.personalCertificateHistory);
									// this.verifyIssuer();
									// this.resolveLoading();
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
							const transaction = {
								$class: 'org.degree.AdministratorHistory',
								'email': this.authService.currentUser.email,
								// 'transactionId': this.transactionId.value,
								// 'timestamp': this.timestamp.value
							};
							this.verifyCertificateService.requestAdministratorHistory(transaction).subscribe(
								(data) => {
									console.log(data);
									this.verifyCertificateService.getPersonalCertificateHistory(data.transactionId).subscribe(
										async (results) => {
											this.errorMessage = null;
											// this.myForm.reset();
											// this.successMessage = ' Transaction ' + '' + ' submitted successfully.';
											console.log(results);
											results = results[0].eventsEmitted[0].results;
											for (let i = 0; i < results.length; i++) {
												const result = JSON.parse(results[i]);
												const record = {
													historianRecord: await this.verifyCertificateService.getHistorianRecord(result.tx_id),
													value: JSON.parse(result.value)
												};
												this.administratorHistory.push(record);
											}
											console.log(this.administratorHistory);
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
				// console.log(field, control.errors);
			});
		}
	}

	verifyHash(certificate: PersonalCertificate): void {
		// certificate integrity
		const hash = certificate.hash;
		delete certificate.hash;
		setTimeout(() => {
			this.steps[0].passed = hash === sha256(JSON.stringify(certificate));
			this.steps[0].done = true;
		}, 2000);
		// this.steps[0].passed = hash === sha256(JSON.stringify(certificate));
		// this.steps[0].done = true;
		// console.log(hash);
		// console.log(sha256(JSON.stringify(result)));
	}

	verifyIssuer(): void {
		// issuer identity
		setTimeout(() => {
			this.steps[1].passed = this.personalCertificateHistory[0].historianRecord.transactionTimestamp >= this.administratorHistory[0].historianRecord.transactionTimestamp;
			this.steps[1].done = true;
		}, 3000);
		// this.steps[1].done = true;
	}

	registerLoading(key = 'loading'): void {
		this.loadingService.register(key);
	}

	resolveLoading(key = 'loading'): void {
		this.loadingService.resolve(key);
	}

}
