export async function GET() {
    const crossOrigins = [];
    const { VERCEL_ENV: environment } = process.env;

    if (environment !== 'production') {
        crossOrigins.push('http://localhost:3000');
    }

    const data = {
        origins: [
            ...crossOrigins
        ]
    };
    return Response.json(data);
}