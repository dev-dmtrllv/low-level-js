declare global {
	type SessionData = {
		user: {
			id: number;
			username: string;
			desktopBackground: string;
		} | undefined;
	};
}

export {};
