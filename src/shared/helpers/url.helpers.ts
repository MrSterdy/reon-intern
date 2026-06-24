export function buildEndpointUrl(
    baseUrl: string,
    ...segments: string[]
): string {
    const normalizedBaseUrl = `${baseUrl.replace(/\/+$/, '')}/`;
    const normalizedPath = segments
        .map((segment) => segment.replace(/^\/+|\/+$/g, ''))
        .filter(Boolean)
        .join('/');

    return new URL(normalizedPath, normalizedBaseUrl).toString();
}
