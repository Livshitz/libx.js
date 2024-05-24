class EdgeNetwork {
	public async fetch(url: string, method: "GET" | "POST", options?: RequestInit) {
		return await fetch(url, {
			method,
			...options,
		})
	}
	public async httpGet(url: string, options?: RequestInit) {
		return await this.fetch(url, 'GET', options);
	}

	public async httpGetText(url: string, options?: RequestInit) {
		const res = await this.httpGet(url, options);
		return await res.text();
	}

	public async httpGetJson<T=any>(url: string, options?: RequestInit): Promise<T> {
		const res = await this.httpGet(url, options);
		return await res.json();
	}

    public async httpPost(url: string, data: any, _options?: {}) {
		const res = await this.fetch(url, "POST", {
			body: JSON.stringify(data),
			headers: {
				'content-type': 'application/json',
			},
			..._options,
		});
		return res;
	}

    public async httpPostText(url: string, data: any, _options?: {}) {
		const res = await this.httpPost(url, data, _options);
		return res.text();
	}

    public async httpPostJSON(url: string, data: any, _options?: {}) {
		const res = await this.httpPost(url, data, _options);
		// const res = await this.fetch(url, "POST", {
		// 	body: JSON.stringify(data),
		// 	headers: {
		// 		'content-type': 'application/json',
		// 	},
		// 	..._options,
		// });
		return res.json();
	}

}

export const network = new EdgeNetwork();