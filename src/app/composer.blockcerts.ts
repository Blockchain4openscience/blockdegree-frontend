import {Asset} from './org.hyperledger.composer.system';

// export namespace composer.blockcerts{
export abstract class Certificate extends Asset {
	typeC: string;
	badge: Badge;
	context: string;
	revoked: boolean;
}

export class Badge {
	id: string;
	typen: string;
	name: string;
	description: string;
	image: string;
	criteria: string;
	issuer: Issuer;
}

export class Issuer {
	id: string;
	typen: string;
	name: string;
	urln: string;
	email: string;
	description: string;
	image: string;
	school: School;
	signatureLines: SignatureLines;
}

export class SignatureLines {
	typen: string;
	name: string;
	image: string;
	jobtitle: string;
}

export class School {
	id: string;
	typen: string;
	name: string;
	urln: string;
	email: string;
	image: string;
}

// }
