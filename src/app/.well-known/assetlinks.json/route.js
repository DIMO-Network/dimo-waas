export async function GET() {
  const data = [
    {
      relation: [
        'delegate_permission/common.handle_all_urls',
        'delegate_permission/common.get_login_creds',
      ],
      target: {
        namespace: 'android_app',
        package_name: process.env.ANDROID_BUNDLE_ID,
        sha256_cert_fingerprints: [process.env.ANDROID_SHA_FINGERPRINT],
      },
    },
  ];
  return Response.json(data);
}
