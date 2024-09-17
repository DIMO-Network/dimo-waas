export async function GET() {
    const data = [
        {
            origins: [
                process.env.NEXT_PUBLIC_VERCEL_URL,
            ]
        },
    ];
    return Response.json(data);
}