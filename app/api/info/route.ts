export const dynamic = 'force-dynamic';
export function GET() { return Response.json({name:process.env.APP_NAME || 'swell Next.js demo', version:process.env.APP_VERSION || '1.0.0', region:process.env.DEMO_REGION || 'local', framework:'Next.js'}, {headers:{'Cache-Control':'no-store'}}); }
