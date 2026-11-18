import {
	AZURE_STORAGE_CONNECTION_STRING,
	AZURE_STORAGE_CONTAINER,
	AZURE_STORAGE_PUBLIC_URL
} from '$app/env/private';
import { BlobServiceClient } from '@azure/storage-blob';

const container = BlobServiceClient.fromConnectionString(
	AZURE_STORAGE_CONNECTION_STRING
).getContainerClient(AZURE_STORAGE_CONTAINER);

// Create the container on first use with anonymous read access to blobs (images are public).
// If it already exists its access level is left unchanged.
let ready: Promise<unknown> | undefined;
function ensureContainer() {
	ready ??= container.createIfNotExists({ access: 'blob' }).catch((err) => {
		ready = undefined;
		throw err;
	});
	return ready;
}

/** Public URL for a blob key (CDN/custom domain if configured). */
export function publicUrl(key: string) {
	const base = AZURE_STORAGE_PUBLIC_URL ?? container.url;
	return `${base}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

/** Uploads bytes and returns the public URL. Keys are unique, so cache forever. */
export async function putBlob(key: string, data: Buffer, contentType: string) {
	await ensureContainer();
	await container.getBlockBlobClient(key).uploadData(data, {
		blobHTTPHeaders: {
			blobContentType: contentType,
			blobCacheControl: 'public, max-age=31536000, immutable'
		}
	});
	return publicUrl(key);
}

export async function deleteBlob(key: string) {
	await container.deleteBlob(key, { deleteSnapshots: 'include' }).catch((err) => {
		if (err?.statusCode !== 404) throw err;
	});
}
