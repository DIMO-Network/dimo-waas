export async function GET() {
    let crossOrigins = [];
    const { NEXT_PUBLIC_CROSS_ORIGINS: crossOriginUrl } = process.env;

    if (crossOriginUrl) {
        crossOrigins = crossOriginUrl.split(',').map(url => url.trim()).filter(url => url);
    }

    const data = {
        origins: crossOrigins
    };
    return Response.json(data);
}