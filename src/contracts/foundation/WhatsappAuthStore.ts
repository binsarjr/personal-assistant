import {
	type AuthenticationCreds,
	type SignalKeyStore,
} from "@whiskeysockets/baileys";

export default interface WhatsappAuthStore {
	authentication(): Promise<{
		state: {
			creds: AuthenticationCreds;
			keys: SignalKeyStore;
		};
		saveCreds: () => Promise<void>;
	}>;
}
