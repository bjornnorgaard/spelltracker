export function convertToRawLink(url: string): string {
    return url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/refs/heads/");
}
