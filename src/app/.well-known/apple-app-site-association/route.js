export async function GET () {
  const data = {
    applinks: {},
    webcredentials: {
      apps: [`${process.env.APPLE_TEAM_ID}.${process.env.APPLE_BUNDLE_ID}`],
    },
    appclips: {},
  };

  return Response.json({data});
}
