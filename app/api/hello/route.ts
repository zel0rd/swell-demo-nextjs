export const dynamic = 'force-dynamic';
export function GET(request: Request) {
 const name = new URL(request.url).searchParams.get('name')?.trim() || 'swell';
 if (name.length > 100) return Response.json({error:'이름은 100자 이내로 입력하세요.'}, {status:400});
 return Response.json({message:`안녕하세요, ${name}! Next.js 서버에서 보낸 응답입니다.`}, {headers:{'Cache-Control':'no-store'}});
}
