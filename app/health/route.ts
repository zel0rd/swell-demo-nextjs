export const dynamic = 'force-dynamic';
export function GET() { return Response.json({status:'ok', service:'swell-demo-nextjs'}, {headers:{'Cache-Control':'no-store'}}); }
