import { Injectable } from '@angular/core';
import {Administrator, ExternalUser} from '../org.degree';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AdministratorService} from '../Administrator/Administrator.service';

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	currentUser: Administrator;

	constructor(private httpClient: HttpClient,
							private administratorService: AdministratorService) {
		this.currentUser = null;
	}

	signUp(administrator): Promise<any> {
		return this.httpClient.post('http://localhost:3001/api/Administrator', administrator).toPromise()
			.then(() => {
				const identity = {
					participant: 'org.degree.Administrator#' + administrator.email,
					userID: administrator.email,
					options: {}
				};

				return this.httpClient.post('http://localhost:3001/api/system/identities/issue', identity, {responseType: 'blob'}).toPromise();
			})
			.then((cardData) => {
				console.log('CARD-DATA', cardData);
				const file = new File([cardData], 'myCard.card', {type: 'application/octet-stream', lastModified: Date.now()});

				const formData = new FormData();
				formData.append('card', file);

				const headers = new HttpHeaders();
				headers.set('Content-Type', 'multipart/form-data');
				return this.httpClient.post('http://localhost:3000/api/wallet/import', formData, {
					withCredentials: true,
					headers
				}).toPromise();
			});
	}

	isAuthenticated(): Promise<boolean> {
		return this.httpClient.get('http://localhost:3000/api/system/ping', {withCredentials: true, observe: 'response'})
			.toPromise()
			.then(response => {
				return response.status === 200;
			})
			.catch(error => {
				console.log(error);
				return error.status !== 401;
			});
	}

	hasSignedUp(): Promise<boolean> {
		return this.httpClient.get('http://localhost:3000/api/wallet', {withCredentials: true})
			.toPromise()
			.then(results => {
				console.log(results);
				return results['length'] > 0;
			})
			.catch(error => {
				console.log(error);
				return false;
			});
	}

	async setCurrentUser(): Promise<void> {
		this.currentUser = await this.httpClient.get('http://localhost:3000/api/system/ping', {withCredentials: true}).toPromise()
			.then((data) => {
				console.log(data);
				const id = data['participant'].split('#')[1];
				return this.administratorService.getParticipant(id).toPromise();
			});
	}

}
