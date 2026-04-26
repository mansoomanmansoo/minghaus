import Link from 'next/link';

export const metadata = {
  title: '이용약관 — echo',
};

export default function TermsPage() {
  return (
    <main style={{ background: '#07090f', color: '#e2e8f0', minHeight: '100vh', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Link href="/" style={{ color: '#a78bfa', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← 돌아가기
        </Link>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '2rem 0 0.5rem' }}>
          이용약관
        </h1>
        <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '3rem' }}>
          최종 수정일: 2026년 4월 26일
        </p>

        {[
          {
            title: '1. 서비스 소개',
            content: `echo는 카카오톡 대화 기록을 바탕으로 AI 페르소나를 생성하여 그리운 사람과 대화할 수 있는 서비스입니다.
본 서비스는 개인이 운영하는 비영리 프로젝트로, 무료로 제공됩니다.`,
          },
          {
            title: '2. AI 서비스 고지',
            content: `echo의 모든 대화는 AI(인공지능)가 생성합니다.

• AI 응답은 실제 인물의 발언이 아닙니다.
• AI가 생성한 내용은 사실과 다를 수 있습니다.
• 법적 결정, 의료적 판단 등 중요한 사안에 AI 응답을 활용하지 마세요.
• echo는 AI 응답의 정확성에 대해 책임지지 않습니다.`,
          },
          {
            title: '3. 사용자 의무',
            content: `다음 행위는 금지됩니다.

• 타인의 동의 없이 제3자의 대화 데이터를 업로드하는 행위
• 서비스를 악의적 목적으로 사용하는 행위
• 시스템에 과부하를 주는 행위`,
          },
          {
            title: '4. 데이터 책임',
            content: `• 업로드하는 대화 데이터에 대한 책임은 사용자에게 있습니다.
• 타인의 개인정보가 포함된 대화를 업로드할 경우, 해당 정보 보호의 책임은 사용자에게 있습니다.
• 서비스 내 데이터는 사용자가 직접 삭제할 수 있습니다.`,
          },
          {
            title: '5. 서비스 변경 및 종료',
            content: `echo는 사전 고지 없이 서비스를 변경하거나 종료할 수 있습니다.
서비스 종료 시 저장된 데이터는 삭제됩니다.`,
          },
          {
            title: '6. 면책 조항',
            content: `echo는 다음에 대해 책임지지 않습니다.

• AI가 생성한 부정확한 정보
• 서비스 이용으로 인한 정신적 영향
• 서비스 중단으로 인한 손해
• 제3자 서비스(Anthropic, Supabase 등) 장애`,
          },
          {
            title: '7. 문의',
            content: `이용약관 관련 문의는 아래로 연락해주세요.

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
