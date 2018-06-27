import {Participant} from './org.hyperledger.composer.system';

// export namespace composer.base{
export abstract class Person extends Participant {
	firstName: string;
	lastName: string;
	publicKey: string;
}

// }
