import {Asset, Transaction} from './org.hyperledger.composer.system';
import {Certificate} from './composer.blockcerts';
import {Person} from './composer.base';

// export namespace org.degree{
export class Administrator extends Person {
	email: string;
}

export class UserExternal extends Person {
	email: string;
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
