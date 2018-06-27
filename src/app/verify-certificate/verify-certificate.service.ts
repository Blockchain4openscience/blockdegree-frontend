import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/index';
import {PersonalCertificate} from '../org.degree';
import {DataService} from '../data.service';

@Injectable()
export class VerifyCertificateService {

	private NAMESPACE: string = 'PersonalCertificate';

  constructor(private dataService: DataService<PersonalCertificate>) { }

	public getAsset(id: any): Observable<PersonalCertificate> {
		return this.dataService.getSingle(this.NAMESPACE, id);
	}
}
