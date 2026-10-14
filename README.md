# PADO Studio · Next.js

PADO Studio는 **Next.js**로 만든 반응형 스튜디오 포트폴리오입니다. 프로젝트 필터, 상세 모달, 스튜디오 소개와 프로젝트 브리프 다운로드를 제공합니다. 프로젝트는 실제 고객 실적이 아닌 디자인 콘셉트이며, 브리프는 브라우저에서 텍스트 파일로 다운로드할 뿐 서버로 전송하지 않습니다. DB, 로그인, 외부 API 키 없이 Swell에 배포할 수 있습니다.

- `/`: 스튜디오 포트폴리오 · 프로젝트 분류/상세 · 브리프 작성 및 다운로드
- `/health`: HTTP 200 + `{"status":"ok", ...}`
- `/api/info`: 공개용 앱 버전/지역 정보 (환경 전체를 노출하지 않음)
- `/api/hello?name=파도`: 한글 이름 인사 API

## 로컬 실행

필수: Node.js 24 + npm 또는 Docker.

```bash
npm ci
npm run dev
```

Production build:

```bash
npm run build
PORT=8080 npm start
# In another terminal, with the server running:
npm test
npm run typecheck
```

웹사이트: http://localhost:8080

`env.example`은 변수 참고용입니다. Next.js 개발 실행에서는 `.env.local`로 복사할 수 있습니다. 생성한 `.env.local`은 Git에 올리지 마세요.
`APP_NAME`, `APP_VERSION`, `DEMO_REGION`은 공개 표시용 값입니다. 여기에 비밀 값을 넣지 마세요. 기본 포트는 `8080`; 컨테이너는 런타임 `PORT`를 따릅니다.

## Docker 실행

```bash
docker build -t swell-demo-nextjs:local .
docker run --rm --name swell-demo-nextjs -p 127.0.0.1:8080:8080 \
  --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges \
  -e APP_VERSION=1.0.0 -e DEMO_REGION=local swell-demo-nextjs:local
```

이미지는 non-root 사용자로 실행됩니다. 바인딩은 `0.0.0.0:8080`, 헬스체크는 `/health`입니다. Dockerfile 기본 이미지는 digest로 고정했고 의존성 lock 파일을 포함했습니다.

### Snap Docker 실행 참고

Snap으로 설치한 Docker에서는 `no-new-privileges`가 컨테이너 시작을 차단하는 [알려진 제약](https://github.com/canonical/docker-snap/blob/main/README.md)이 있습니다. 이 문제가 발생하는 로컬 개발 환경에서는 위 예제의 `--security-opt no-new-privileges`만 생략할 수 있습니다. non-root, read-only, cap-drop은 유지합니다. 일반 Docker 환경과 GitHub CI에서는 원래 옵션을 유지합니다. 호스트의 보안 설정을 변경할 필요는 없습니다.

## swell에 Git 소스로 등록

- 저장소: `https://github.com/zel0rd/swell-demo-nextjs.git`
- 브랜치: `main` (비워두면 `main`, 지정하면 해당 브랜치의 최신 커밋)
- Dockerfile / build context: 루트의 `Dockerfile` / `.`
- 포트: `8080`
- 헬스체크: `/health`
- 권장 시작값: replicas `1`, CPU `250m`, memory `512Mi`

```bash
git rev-parse HEAD
```

아래는 swell 앱 생성 요청의 `spec` 예시입니다. 배포 요청마다 해당 브랜치의 최신 커밋을 조회하며, 동일 배포의 재시도는 조회한 커밋을 유지합니다.

```json
{
  "gitUrl": "https://github.com/zel0rd/swell-demo-nextjs.git",
  "branch": "main",
  "port": 8080,
  "replicas": 1,
  "cpuMillis": 250,
  "memoryMB": 512,
  "healthPath": "/health"
}
```

**현재 swell의 Git 빌드에는 별도 BuildKit/registry/Trivy/Cosign 도구 설정이 필요합니다.** 저장소 등록만으로 해당 인프라가 준비되지는 않습니다. `platform.yaml`은 설정 참고용이며 현재 swell은 이 파일을 자동으로 읽지 않습니다.

## Git 빌더 없이 현재 로컬 swell에서 테스트

swell 개발 환경의 로컬 registry(`localhost:15000`)와 kind runtime이 준비되어 있을 때:

```bash
docker build -t localhost:15000/swell-demo-nextjs:v1 .
docker push localhost:15000/swell-demo-nextjs:v1
docker inspect localhost:15000/swell-demo-nextjs:v1 --format '{{index .RepoDigests 0}}'
```

출력된 `localhost:15000/swell-demo-nextjs@sha256:...`를 대시보드 앱 생성의 **Image**에 입력합니다. 포트 `8080`, 헬스체크 `/health`, replicas `1`로 설정하고 배포하세요. 이미지 방식에서는 `gitUrl`/`branch`을 함께 입력하지 않습니다. 플랫폼 worker의 `TRUSTED_REGISTRIES`와 kind의 registry 접근은 swell README의 로컬 설정을 따라야 합니다.

`localhost:15000`은 로컬 개발 예시입니다. 원격 환경에서는 노드에서 접근 가능한 registry를 사용하세요.

```bash
curl --cacert /path/to/swell/.local/pki/ca.crt \
  --resolve YOUR-SLUG.apps.swell.test:14443:127.0.0.1 \
  https://YOUR-SLUG.apps.swell.test:14443/health
```

브라우저로 접속하려면 해당 호스트의 DNS/hosts 설정과 개발 CA 신뢰 설정이 필요합니다. 공개 GitHub 저장소 생성 자체는 웹사이트 호스팅을 만들지 않습니다.

## 재배포 확인

`/api/info`의 기본 버전 또는 화면 문구를 수정해 새 커밋/이미지 digest로 다시 배포하세요. 페이지와 API 결과가 바뀌는지, 이전 배포로 rollback이 되는지 확인할 수 있습니다. `APP_VERSION`/`DEMO_REGION`은 직접 Docker 실행에서 테스트할 수 있으며 swell의 일반 환경변수 편집 UI/API는 아직 구현되지 않았습니다.

## CI

GitHub Actions에서 TypeScript 검사, production build, non-root Docker 실행과 HTTP smoke test를 수행합니다. 클라우드 서비스나 registry로 이미지를 자동 배포하지 않습니다.

MIT License.

`swell` 소스 검사는 `.env*` 파일을 차단하므로 변수 예시는 `env.example`이라는 이름을 사용합니다.

Git 배포 후 `/api/info`의 `sourceCommit`과 Swell 배포 기록의 커밋을 비교할 수 있습니다. Swell이 `SWELL_COMMIT_SHA` 빌드 인자를 전달하며, 직접 빌드할 때 생략하면 `unknown`입니다. Git push만으로 자동 배포되지는 않습니다. Swell에서 **배포**를 눌러 새 배포를 요청하세요.
