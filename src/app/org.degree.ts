import {Asset, Transaction} from './org.hyperledger.composer.system';
import {Certificate} from './composer.blockcerts';

// export namespace org.degree{
export class Administrator {
	email: string;
	firstName: string;
	lastName: string;
	publicKey: string;
}

export class ExternalUser {
	email: string;
	firstName: string;
	lastName: string;
	publicKey: string;
}

export class CertificateTemplate extends Certificate {
	templateId: string;
	globalAdministrator: Administrator;
}

export class PersonalCertificate extends Asset {
	certId: string;
	templateId: CertificateTemplate;
	localAdministrator: Administrator;
	recipient: Recipient;
	recipientProfile: RecipientProfile;
	hash: string;
}

export class AddRoster extends Transaction {
	templateId: CertificateTemplate;
	localAdministrator: Administrator;
	recipientsInfo: RecipientInfo[];
}

export class PersonalCertificateHistory extends Transaction {
	certId: string;
}

export class AdministratorHistory extends Transaction {
	email: string;
}

export class RecipientInfo {
	certId: string;
	recipient: Recipient;
	recipientProfile: RecipientProfile;
}

export class Recipient {
	hashed: boolean;
	email: string;
}

export class RecipientProfile {
	typen: string;
	name: string;
	publicKey: string;
}

// }
