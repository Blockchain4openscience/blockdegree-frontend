import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/index';
import {AdministratorHistory, PersonalCertificate, PersonalCertificateHistory} from '../org.degree';
import {DataService} from '../data.service';
import {HistorianRecord} from "../org.hyperledger.composer.system";
import {take} from "rxjs/operators";

@Injectable()
export class VerifyCertificateService {

	private NAMESPACE: string = 'PersonalCertificate';

  constructor(private dataService1: DataService<PersonalCertificate>,
							private dataService2: DataService<PersonalCertificateHistory>,
							private administratorHistoryService: DataService<AdministratorHistory>,
							private historianService: DataService<HistorianRecord>) { }

	public getAsset(id: any): Observable<PersonalCertificate> {
		return this.dataService1.getSingle(this.NAMESPACE, id);
	}

	requestPersonalCertificateHistory(itemToAdd: any): Observable<PersonalCertificateHistory> {
		return this.dataService2.add('PersonalCertificateHistory', itemToAdd);
	}

	getPersonalCertificateHistory(certId: string): Observable<any[]> {
		return this.dataService2.history('selectHistorianRecordsByTrxId', certId);
	}

	requestAdministratorHistory(itemToAdd: any): Observable<AdministratorHistory> {
		return this.administratorHistoryService.add('AdministratorHistory', itemToAdd);
	}

	getAdministratorHistory(email: string): Observable<any[]> {
		return this.administratorHistoryService.history('selectHistorianRecordsByTrxId', email);
	}

	getHistorianRecord(transactionId: string): Promise<HistorianRecord> {
		return this.historianService.getSingle('system/historian', transactionId)
			.pipe(
				take(1)
			)
			.toPromise();
	}
}
