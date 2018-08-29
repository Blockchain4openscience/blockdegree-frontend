import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CertificateTemplateService} from '../CertificateTemplate.service';
import {TdLoadingService} from '@covalent/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {AuthService} from "../../auth/auth.service";

@Component({
  selector: 'app-create-certificate-template-dialog',
  templateUrl: './create-certificate-template-dialog.component.html',
  styleUrls: ['./create-certificate-template-dialog.component.css'],
	providers: [CertificateTemplateService]
})
export class CreateCertificateTemplateDialogComponent implements OnInit {

	certificateTemplateForm: FormGroup;
	templateId = new FormControl(null, Validators.required);
	globalAdministrator = new FormControl(this.authService.currentUser.email, Validators.required);
	// typeC = new FormControl(null, Validators.required);
	// context = new FormControl(null, Validators.required);
	// revoked = new FormControl(null, Validators.required);

	badgeForm: FormGroup;
	badgeId = new FormControl(null, Validators.required);
	badgeName = new FormControl(null, Validators.required);
	badgeDescription = new FormControl(null, Validators.required);
	badgeImage = new FormControl(null);
	badgeCriteria = new FormControl(null);

	issuerForm: FormGroup;
	issuerId = new FormControl(null, Validators.required);
	issuerName = new FormControl(null, Validators.required);
	issuerUrln = new FormControl(null, Validators.required);
	issuerEmail = new FormControl(null, Validators.required);
	issuerDescription = new FormControl(null);
	issuerImage = new FormControl(null);

	schoolForm: FormGroup;
	schoolId = new FormControl(null, Validators.required);
	schoolName = new FormControl(null, Validators.required);
	schoolUrln = new FormControl(null, Validators.required);
	schoolEmail = new FormControl(null, Validators.required);
	schoolImage = new FormControl(null, Validators.required);

	signatureLinesForm: FormGroup;
	signatureLinesName = new FormControl(null, Validators.required);
	signatureLinesImage = new FormControl(null, Validators.required);
	signatureLinesJobTitle = new FormControl(null, Validators.required);


	private asset;
	private errorMessage;

	constructor(private serviceCertificateTemplate: CertificateTemplateService,
							private loadingService: TdLoadingService,
							private authService: AuthService,
							@Inject(FormBuilder) fb: FormBuilder,
							public dialogRef: MatDialogRef<CreateCertificateTemplateDialogComponent>,
							@Inject(MAT_DIALOG_DATA) public data: any) {
		this.schoolForm = fb.group({
			id: this.schoolId,
			name: this.schoolName,
			urln: this.schoolUrln,
			email: this.schoolEmail,
			image: this.schoolImage
		});

		this.signatureLinesForm = fb.group({
			name: this.signatureLinesName,
			image: this.signatureLinesImage,
			jobtitle: this.signatureLinesJobTitle
		});

		this.issuerForm = fb.group({
			id: this.issuerId,
			name: this.issuerName,
			urln: this.issuerUrln,
			email: this.issuerEmail,
			description: this.issuerDescription,
			image: this.issuerImage,
			school: this.schoolForm,
			signatureLines: this.signatureLinesForm
		});

		this.badgeForm = fb.group({
			id: this.badgeId,
			name: this.badgeName,
			description: this.badgeDescription,
			image: this.badgeImage,
			criteria: this.badgeCriteria,
			issuer: this.issuerForm
		});

		this.certificateTemplateForm = fb.group({
			templateId: this.templateId,
			globalAdministrator: this.globalAdministrator,
			// typeC: this.typeC,
			badge: this.badgeForm,
			// context: this.context,
			// revoked: this.revoked
		});
		this.globalAdministrator.disable();
	};

  ngOnInit() { }

	addAsset(): void {
  	console.log(this.badgeForm.value);
		if (this.certificateTemplateForm.valid) {
			this.asset = {
				$class: 'org.degree.CertificateTemplate',
				'templateId': this.templateId.value,
				'globalAdministrator': this.globalAdministrator.value,
				// 'typeC': this.typeC.value,
				'badge': this.badgeForm.value
				// 'context': this.context.value,
				// 'revoked': this.revoked.value
			};

			// this.asset = {
			// 	$class: 'org.degree.CertificateTemplate',
			// 	'templateId': this.templateId.value,
			// 	'globalAdministrator': this.globalAdministrator.value,
			// 	// 'typeC': this.typeC.value,
			// 	'badge': {
			// 		'id': this.badgeId.value,
			// 		'name': this.badgeName,
			// 		'description': this.badgeDescription,
			// 		'image': this.badgeImage,
			// 		'criteria': this.badgeCriteria,
			// 		'issuer': {
			// 			'id': this.issuerId,
			// 			'name': this.issuerName,
			// 			'urln': this.issuerUrln,
			// 			'email': this.issuerEmail,
			// 			'description': this.issuerDescription,
			// 			'image': this.issuerImage,
			// 			'school': {
			// 				'id': this.schoolId,
			// 				'name': this.schoolName,
			// 				'urln': this.schoolUrln,
			// 				'email': this.schoolEmail,
			// 				'image': this.schoolImage
			// 			},
			// 			'signatureLines': {
			// 				'name': this.signatureLinesName,
			// 				'image': this.signatureLinesImage,
			// 				'jobtitle': this.signatureLinesJobTitle
			// 			}
			// 		}
			// 	},
			// 	// 'context': this.context.value,
			// 	// 'revoked': this.revoked.value
			// };

			// this.certificateTemplateForm.reset();

			this.registerLoading();
			this.serviceCertificateTemplate.addAsset(this.asset)
				.subscribe(
					() => {
						this.errorMessage = null;
						this.certificateTemplateForm.reset();
						this.resolveLoading();
						this.closeDialog({update: true});
					},
					(error) => {
						if (error === 'Server error') {
							this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
						} else {
							this.errorMessage = error;
						}
						this.resolveLoading();
					});
		} else {
			Object.keys(this.certificateTemplateForm.controls).forEach(field => {
				const control = this.certificateTemplateForm.get(field);
				control.markAsTouched({ onlySelf: true });
				// console.log(field, control.errors);
			});
			Object.keys(this.badgeForm.controls).forEach(field => {
				const control = this.badgeForm.get(field);
				control.markAsTouched({ onlySelf: true });
				// console.log(field, control.errors);
			});
			Object.keys(this.issuerForm.controls).forEach(field => {
				const control = this.issuerForm.get(field);
				control.markAsTouched({ onlySelf: true });
				// console.log(field, control.errors);
			});
			Object.keys(this.schoolForm.controls).forEach(field => {
				const control = this.schoolForm.get(field);
				control.markAsTouched({ onlySelf: true });
				// console.log(field, control.errors);
			});
			Object.keys(this.signatureLinesForm.controls).forEach(field => {
				const control = this.signatureLinesForm.get(field);
				control.markAsTouched({ onlySelf: true });
				// console.log(field, control.errors);
			});
		}
	}

	closeDialog(data = { update: false }): void {
		this.dialogRef.close(data);
	}

	registerLoading(key: string = 'loading'): void {
		this.loadingService.register(key);
	}

	resolveLoading(key: string = 'loading'): void {
		this.loadingService.resolve(key);
	}

}
