export async function GET() {
  const { NEXT_PUBLIC_CROSS_ORIGINS: crossOriginUrl } = process.env;
  const data = [
    {
      relation: [
        "delegate_permission/common.handle_all_urls",
        "delegate_permission/common.get_login_creds",
      ],
      target: {
        namespace: "android_app",
        package_name: process.env.ANDROID_BUNDLE_ID,
        sha256_cert_fingerprints: [process.env.ANDROID_SHA_FINGERPRINT],
      },
    },
  ];
  if (crossOriginUrl) {
    const crossOrigins = crossOriginUrl
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url)
      .map((url) => ({
        relation: ["delegate_permission/common.get_login_creds"],
        target: {
          namespace: "web",
          site: url,
        },
      }));

    data.push(...crossOrigins);
  }

  return Response.json(data);
}
