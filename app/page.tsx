"use client";
import { useEffect, useState, type FormEvent } from 'react';
type Info = { name: string; version: string; region: string; framework: string };
export default function Home() {
  const [info, setInfo] = useState<Info | null>(null);
  const [status, setStatus] = useState('연결 확인 중');
  const [name, setName] = useState('swell');
  const [result, setResult] = useState('이름을 입력하고 서버에 인사를 보내 보세요.');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all(['/health', '/api/info'].map(path => fetch(path, { cache: 'no-store', signal: controller.signal }).then(r => {if (!r.ok) throw new Error('서버 연결 실패'); return r.json();})))
      .then(([health, data]) => {if (health.status !== 'ok') throw new Error('헬스체크 실패');setInfo(data);setStatus('서버 응답 정상');})
      .catch(err => {if (err.name !== 'AbortError') setStatus('연결 실패 · 새로고침해 주세요');});
    return () => controller.abort();
  }, []);
  async function greet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);
    try {const response = await fetch('/api/hello?name=' + encodeURIComponent(name), {cache:'no-store'});const data = await response.json();if (!response.ok) throw new Error(data.error || '요청 실패');setResult(data.message);}
    catch (error) {setResult(error instanceof Error ? error.message : '서버에 연결할 수 없습니다.');}
    finally {setBusy(false);}
  }
  return <main>
    <nav><span className="brand">swell.</span><a href="https://github.com/zel0rd/swell-demo-nextjs">GitHub ↗</a></nav>
    <p className="eyebrow">DEPLOYMENT PLAYGROUND / NEXT.JS</p>
    <h1>작은 앱으로,<br/>첫 배포를 확인하세요.</h1>
    <p className="muted">Next.js App Router로 만든 테스트 웹사이트입니다. 페이지 로딩부터 서버 API와 헬스체크까지, 한 화면에서 확인해 보세요.</p>
    <span className="status" role="status">{status}</span>
    <section className="grid" aria-label="서버 정보"><div className="card"><small>FRAMEWORK</small><span className="value">Next.js</span></div><div className="card"><small>APP VERSION</small><span className="value">{info?.version ?? '—'}</span></div><div className="card"><small>DEMO REGION</small><span className="value">{info?.region ?? '—'}</span></div></section>
    <section className="card"><h2>서버에 인사하기</h2><label htmlFor="name">이름</label><form onSubmit={greet}><input id="name" value={name} onChange={e=>setName(e.target.value)} maxLength={100} required/><button disabled={busy}>{busy ? '요청 중…' : 'API 호출'}</button></form><p className="response" aria-live="polite">{result}</p><small><code>GET /api/hello?name=swell</code></small></section>
    <section className="card"><h2>배포 확인 포인트</h2><p><a href="/health">/health</a>에서 JSON 응답을 확인하고, <a href="/api/info">/api/info</a>에서 현재 앱 버전을 확인하세요. 버전을 바꿔 다시 배포하면 롤링 업데이트도 테스트할 수 있습니다.</p><small>데이터베이스와 외부 API 키가 필요 없는 독립 실행 예제입니다.</small></section>
    <footer>SWELL by PADO · Build small. Scale beyond.</footer>
  </main>;
}
