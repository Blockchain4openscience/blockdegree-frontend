import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AdministratorService} from '../../Administrator/Administrator.service';
import {Administrator} from '../../org.degree';
import {TdLoadingService} from '@covalent/core';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-auth-signup',
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.css'],
	providers: [AdministratorService]
})
export class AuthSignupComponent implements OnInit {

	myForm: FormGroup;
	email = new FormControl(null, [Validators.required, Validators.email]);
	firstName = new FormControl(null, Validators.required);
	lastName = new FormControl(null, Validators.required);
	publicKey = new FormControl(null, Validators.required);
	private participant;
	private successMessage;
	private errorMessage;

	constructor(private authService: AuthService,
							private loadingService: TdLoadingService,
							private router: Router,
							fb: FormBuilder) {
		this.myForm = fb.group({
			email: this.email,
			firstName: this.firstName,
			lastName: this.lastName,
			publicKey: this.publicKey
		});
	};

  ngOnInit() {
  }

	addParticipant(): void {
  	this.errorMessage = null;
  	if (this.myForm.valid) {
  		this.registerLoading();
			this.participant = {
				$class: 'org.degree.Administrator',
				'email': this.email.value,
				'firstName': this.firstName.value,
				'lastName': this.lastName.value,
				'publicKey': this.publicKey.value
			};

			this.authService.signUp(this.participant)
				.then(async () => {
					this.errorMessage = null;
					this.myForm.reset();
					this.resolveLoading();
					await this.authService.setCurrentUser();
					this.router.navigate(['/certificate-templates']);
				})
				.catch((error) => {
					console.log(error);
					if (error === 'Server error') {
						this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
					}	else {
						this.errorMessage = error;
					}
				});
		}
	}

	registerLoading(key: string = 'loading'): void {
		this.loadingService.register(key);
	}

	resolveLoading(key: string = 'loading'): void {
		this.loadingService.resolve(key);
	}

}
