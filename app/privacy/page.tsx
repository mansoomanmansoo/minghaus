import Link from 'next/link';

export const metadata = {
  title: '개인정보처리방침 — echo',
};

export default function PrivacyPage() {
  return (
    <main style={{ background: '#07090f', color: '#e2e8f0', minHeight: '100vh', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Link href="/" style={{ color: '#a78bfa', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← 돌아가기
        </Link>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '2rem 0 0.5rem' }}>
          개인정보처리방침
        </h1>
        <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '3rem' }}>
          최종 수정일: 2026년 4월 26일
        </p>

        {[
          {
            title: '1. 수집하는 개인정보',
            content: `echo는 서비스 제공을 위해 다음 정보를 수집합니다.

• 이메일 주소 및 비밀번호 (회원가입 시)
• 카카오톡 대화 내보내기 파일 (서비스 이용 시)
• 서비스 내 대화 내용 (AI와의 채팅)`,
          },
          {
            title: '2. 개인정보의 이용 목적',
            content: `수집한 정보는 다음 목적으로만 사용됩니다.

• 회원 인증 및 서비스 제공
• AI 페르소나 생성 및 대화 서비스
• 서비스 품질 개선

수집된 대화 데이터는 AI 모델 학습에 사용되지 않습니다.`,
          },
          {
            title: '3. 개인정보의 보관 및 보호',
            content: `• 모든 데이터는 Supabase(미국 AWS 인프라) 서버에 저장됩니다.
• 저장 데이터는 서버 수준의 암호화(AES-256)로 보호됩니다.
• 운영자는 업로드된 대화 내용에 접근하지 않습니다.
• 회원 탈퇴 또는 요청 시 모든 데이터를 즉시 삭제합니다.`,
          },
          {
            title: '4. 제3자 제공',
            content: `echo는 사용자의 개인정보를 제3자에게 제공하지 않습니다.
단, 서비스 운영을 위해 다음 외부 서비스를 이용합니다.

• Anthropic (AI 응답 생성) — 대화 내용이 API로 전송됩니다
• Voyage AI (벡터 검색) — 대화 텍스트가 API로 전송됩니다
• Supabase (데이터 저장)

위 서비스들은 각자의 개인정보처리방침을 따릅니다.`,
          },
          {
            title: '5. 사용자의 권리',
            content: `사용자는 언제든지 다음 권리를 행사할 수 있습니다.

• 서비스 내 페르소나 및 대화 기록 삭제
• 계정 삭제 요청 (아래 이메일로 문의)
• 수집된 개인정보 열람 요청`,
          },
          {
            title: '6. 문의',
            content: `개인정보 관련 문의사항은 아래로 연락해주세요.

이메일: minsoo@nurihaus.com`,
          },
        ].map(section => (
          <section key={section.title} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c4b5fd', marginBottom: '0.75rem' }}>
              {section.title}
            </h2>
            <p style={{ color: '#94a3b8', lineHeight: 2, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
              {section.content}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
