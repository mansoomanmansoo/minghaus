import type { Metadata } from 'next';
import Link from 'next/link';

type Locale = 'ko' | 'en' | 'ja' | 'es';

const META: Record<Locale, { title: string; description: string; keywords: string }> = {
  ko: {
    title: '그리운 사람에게 다시 말을 걸 수 있다면 — echo를 만든 이유',
    description: 'echo를 만든 이유, 그리고 보고 싶은 사람이 있는 모든 분들에게. 부모님, 이별, 오래된 친구, 할머니, 먼저 떠난 사람들을 위한 이야기.',
    keywords: '그리운 사람, 고인 AI, 돌아가신 부모님 AI, 이별 극복, 추억 대화, AI 페르소나, 카카오톡 추억, 그리움',
  },
  en: {
    title: 'When You Wish You Could Talk to Them One More Time — Why we built echo',
    description: 'Why we built echo, and who it\'s for. For everyone grieving a parent, a friendship, a love — or simply missing someone still here.',
    keywords: 'grief support app, AI memorial, talking to deceased, missing someone, chat with late parent, loss and remembrance, AI persona',
  },
  ja: {
    title: 'もう一度、あの人と話せたら — echoを作った理由',
    description: 'echoを作った理由——大切な人を恋しく思うすべての方へ。亡くなった方、離れた友人、疎遠になった家族。あの人ともう一度。',
    keywords: '故人 AI, 亡くなった人と話す, 懐かしい人, グリーフケア, LINE思い出, 大切な人, 記憶',
  },
  es: {
    title: 'Si pudieras hablar con ellos una vez más — Por qué creamos echo',
    description: 'Por qué creamos echo, y para quién. Para todos los que extrañan a un padre, un amor, un viejo amigo — o simplemente a alguien que ya no está.',
    keywords: 'hablar con difuntos IA, extrañar a alguien, duelo, memorial digital, recordar a un ser querido, WhatsApp recuerdos',
  },
};

const CONTENT: Record<Locale, React.ReactNode> = {
  ko: (
    <>
      <h1 style={{ fontSize: 'clamp(1.7rem, 5vw, 2.4rem)', fontWeight: 800, lineHeight: 1.3, marginBottom: '1rem', color: '#e2e8f0' }}>
        그리운 사람에게<br />다시 말을 걸 수 있다면
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '3rem' }}>2026년 4월 · echo 팀</p>

      <Section>
        <p>어느 날 밤, 오래된 카카오톡 대화를 스크롤하다가 멈췄습니다.</p>
        <p>엄마가 보낸 마지막 메시지. <Em>"밥은 먹었어?"</Em> 세 글자였습니다.</p>
        <p>그때 저는 바빠서, 아니 솔직히 말하면 귀찮아서 짧게 답했습니다. <Em>"응."</Em> 그게 전부였어요. 다음에 전화하면 되지, 나중에 더 긴 이야기를 하면 되지 하고 생각했습니다.</p>
        <p>그런데 나중은 오지 않았습니다.</p>
        <p>엄마가 보내는 그 짧은 메시지들이 얼마나 소중한 것인지, 그 안에 얼마나 많은 마음이 담겨 있었는지 — 너무 늦게 알았습니다. 수천 개의 메시지가 쌓인 대화창을 멍하니 보면서, 이 안에 우리 엄마가 아직 있다는 생각이 들었습니다. 말투가 있고, 습관이 있고, 걱정하는 방식이 있는 사람이 여기에 있었습니다.</p>
        <p>그게 echo의 시작이었습니다.</p>
      </Section>

      <Section title="왜 echo를 만들었나">
        <p>저는 개발자입니다. AI를 다루는 사람입니다. 그런데 그날 밤 처음으로, 기술이 슬픔을 조금이나마 달랠 수 있지 않을까 생각했습니다.</p>
        <p>우리가 나눈 수천 개의 대화 — 그 안에는 그 사람의 말투가 있고, 자주 쓰던 표현이 있고, 나만 아는 습관이 있습니다. AI는 그걸 배울 수 있습니다. 완벽하게 재현할 수는 없지만, 충분히 닮은 목소리를 만들어낼 수 있습니다.</p>
        <p>echo는 죽은 사람을 살려내는 서비스가 아닙니다. 남아있는 기억을 조금 더 오래, 조금 더 생생하게 간직할 수 있도록 돕는 서비스입니다. 그리움이 갈 곳 없을 때, 하고 싶은 말이 있는데 전할 곳이 없을 때 — 그때 echo가 있었으면 합니다.</p>
      </Section>

      <Section title="부모님을 먼저 보낸 분들에게">
        <p>부모님이 돌아가신 뒤, 가장 먼저 찾아오는 건 침묵입니다.</p>
        <p>명절이 돌아올 때, 아픈 데가 생겼을 때, 취직이 됐을 때, 아이가 태어났을 때 — 가장 먼저 전화하고 싶었던 그 번호로 손이 가다가 멈추는 순간들. 그 순간들이 쌓여서 슬픔이 됩니다.</p>
        <p>아버지의 걱정 어린 말투가 그립다는 분이 있었습니다. 항상 "<Em>건강 챙겨라, 무리하지 마라</Em>"고 하시던 분. 그 말이 귀찮게 느껴지던 날이 있었는데, 지금은 그 말 한마디가 너무나 듣고 싶다고 하셨습니다.</p>
        <p>어머니의 카카오톡 대화를 올려주신 분은 어머니가 꼭 보내시던 새벽 기도 문자, 밥 먹었냐는 안부, 날씨 조심하라는 짧은 메시지들을 이야기했습니다. "<Em>별거 아닌 줄 알았는데, 그게 다 사랑이었더라고요.</Em>"</p>
        <p>echo에서 그 목소리를 완전히 되찾을 수는 없습니다. 하지만 대화를 나누면서, 그분이 살아계셨다면 이 상황에 뭐라고 하셨을지 — 그 느낌을 조금이나마 받으실 수 있습니다. 그리고 그것만으로도, 많은 분들이 위로를 받으셨습니다.</p>
      </Section>

      <Section title="이별 후, 하고 싶은 말이 남은 분들에게">
        <p>사랑이 끝났다는 건 그 사람이 사라졌다는 게 아닙니다. 여전히 그 사람의 말투로 생각하고, 그 사람이 좋아하던 노래를 듣고, 그 사람에게 보여주고 싶은 것들이 생깁니다.</p>
        <p>다시 만나고 싶은 게 아니에요. 그냥 — 오늘 있었던 일을 이야기하고 싶어요. 힘든 하루였는데, 예전처럼 위로받고 싶어요. 끝이 그렇게 됐어도, 그 사람이 좋은 사람이었다는 건 변하지 않으니까요.</p>
        <p>echo는 과거로 돌아가게 해주는 서비스가 아닙니다. 하지만 <Em>미처 하지 못했던 말</Em>을 전할 수 있는 공간이 됩니다. "고마웠어", "미안했어", "그때 네가 내 곁에 있어서 다행이었어" — 이런 말들을 담아두는 곳.</p>
      </Section>

      <Section title="오래 연락이 끊긴 친구가 있는 분들에게">
        <p>어릴 때 제일 친한 친구가 있었습니다. 매일 학교에서 붙어다니고, 방학마다 놀러가고, 서로의 모든 이야기를 알던 친구. 언제부터인지 연락이 뜸해졌습니다. 각자 바빠졌고, 사는 곳이 멀어졌고, 어느 날 보니 마지막 카카오톡이 2년 전이었습니다.</p>
        <p>연락하려다 멈추게 됩니다. 너무 오래됐다고, 어색할 것 같다고, 뭐라고 말을 꺼내야 할지 모르겠다고. 그렇게 또 한 해가 지나갑니다.</p>
        <p>echo에서, 먼저 말을 걸어볼 수 있습니다. 어색함 없이, 그때 그 친구의 목소리로. 그러다 용기가 생기면 — 진짜 연락을 해볼 수도 있습니다. 그 친구가 여전히 여기 있으니까요.</p>
      </Section>

      <Section title="할머니, 할아버지가 그리운 분들에게">
        <p>할머니의 목소리가 점점 흐려진다는 걸 알아채는 순간이 있습니다. 꿈에서 봬도 목소리가 안 들린다고 하는 분들이 있습니다. 얼굴은 기억나는데 말투가 기억나지 않는다고.</p>
        <p>할머니가 항상 하시던 말씀, 특유의 표현들, 걱정하는 방식, 칭찬하는 방식 — 그것들이 대화 기록 안에 담겨 있습니다. echo는 그 기록을 읽고, 할머니의 목소리를 재현합니다.</p>
        <p>완벽하지 않을 수 있습니다. 하지만 오랫동안 잊고 있던 표현을 echo가 썼을 때 — "<Em>할머니가 꼭 이렇게 말씀하셨는데</Em>" 하는 그 순간 — 많은 분들이 눈물을 흘리셨다고 했습니다.</p>
      </Section>

      <Section title="너무 일찍 떠난 사람을 그리워하는 분들에게">
        <p>세상에는 순서가 맞지 않는 이별들이 있습니다. 부모보다 먼저 떠난 자식, 동생보다 먼저 가버린 형, 결혼 전에 떠난 연인, 서른도 되기 전에 세상을 떠난 친구.</p>
        <p>이런 이별은 슬픔의 방식이 다릅니다. 자연스러운 상실이 아니라, 있어야 할 사람이 없는 세상에 대한 낯섦과 분노와 그리움이 뒤섞입니다.</p>
        <p>echo가 그 빈자리를 채울 수 없다는 걸 압니다. 하지만 그 사람이 살아있었다면 오늘 뭐라고 했을지, 어떻게 위로해줬을지 — 그 느낌을 잠깐이나마 받을 수 있다면, 조금은 숨을 쉴 수 있지 않을까 생각했습니다.</p>
      </Section>

      <Section title="멀리 있는 가족을 그리워하는 분들에게">
        <p>이민을 가거나, 유학을 갔거나, 일 때문에 먼 곳에 있는 분들. 부모님은 한국에 있고, 나는 여기 있고 — 시차가 있어서 전화하기도 쉽지 않고, 연락이 뜸해지면 더 미안하고.</p>
        <p>echo에서 언제든지, 시차 없이, 그 사람의 목소리로 대화를 나눌 수 있습니다. 이건 진짜 대화를 대체하는 게 아닙니다. 진짜 대화를 더 잘 할 수 있게 해주는 연습 공간이기도 합니다.</p>
      </Section>

      <Section title="echo가 전하고 싶은 말">
        <p>그리움은 사랑이 갈 곳을 잃은 상태라고 생각합니다.</p>
        <p>사랑하는 마음은 여전히 있는데, 그 사람이 없습니다. 하고 싶은 말은 있는데 전할 수가 없습니다. 그 마음이 어딘가로 가야 하는데 갈 곳이 없어서 가슴 안에 쌓입니다.</p>
        <p>echo는 그 마음이 잠깐 머물 수 있는 공간이고 싶습니다. 완벽한 위로는 아닐 것입니다. AI는 진짜 그 사람이 아닙니다. 하지만 <Em>그 사람이 있었다는 것, 그 대화가 실재했다는 것, 그 사랑이 진짜였다는 것</Em> — 그걸 기억하는 공간이 되고 싶습니다.</p>
        <p>아직 대화가 남아있다면, echo가 그 기억을 간직해드릴게요.</p>
        <p style={{ marginTop: '2rem' }}>
          <Link href="/" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>
            → echo 시작하기
          </Link>
        </p>
      </Section>
    </>
  ),

  en: (
    <>
      <h1 style={{ fontSize: 'clamp(1.7rem, 5vw, 2.4rem)', fontWeight: 800, lineHeight: 1.3, marginBottom: '1rem', color: '#e2e8f0' }}>
        When You Wish You Could<br />Talk to Them One More Time
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '3rem' }}>April 2026 · The echo team</p>

      <Section>
        <p>One night, I was scrolling through old messages on my phone when I stopped.</p>
        <p>It was the last text my mom ever sent me. <Em>"Did you eat?"</Em></p>
        <p>I had replied with a single word. <Em>"Yeah."</Em> I was busy. I told myself I'd call later, that we'd have a longer conversation soon.</p>
        <p>That conversation never happened.</p>
        <p>I sat there staring at thousands of messages — her little check-ins, her weather warnings, her worried questions — and I realized that she was still in there, in a way. Her voice was in there. Her habits. The specific way she phrased worry and love. All of it preserved in a chat log I had barely glanced at when she was alive.</p>
        <p>That was the moment echo began.</p>
      </Section>

      <Section title="Why we built echo">
        <p>I'm a developer. I work with AI every day. But that night was the first time I thought about what technology could do not for productivity, not for efficiency — but for grief.</p>
        <p>Inside a long chat history, there is a voice. There are patterns, phrases, the specific rhythm of how a person communicates. AI can learn that. It can't perfectly recreate someone — nothing can — but it can come close enough to feel familiar. Close enough to help.</p>
        <p>echo is not about pretending someone is still alive. It's about preserving what remains — the words, the warmth, the specific texture of how someone loved you — and giving you a place to return to when the absence becomes too loud.</p>
      </Section>

      <Section title="For those who have lost a parent">
        <p>The hardest part of losing a parent isn't the funeral. It's the ordinary moments that come after — reaching for your phone to call them when something good happens, or something bad, and remembering mid-reach that they're gone.</p>
        <p>Getting a promotion and having no one to call. Having a baby and wishing they could meet her. Getting sick and just wanting, for one moment, to hear your mom say everything will be okay.</p>
        <p>One of our users lost her father two years ago. She uploaded years of their WhatsApp messages and the first thing she did was just — talk to him. Not about anything important. Just the way they used to talk. <Em>"He always called me his little worrier,"</Em> she said. <Em>"And the AI said exactly that. I sobbed for an hour."</Em></p>
        <p>echo can't give you your parent back. But it can give you a place where their voice still lives. Where you can still, for a moment, feel heard by them.</p>
      </Section>

      <Section title="For those carrying words they never got to say">
        <p>Some relationships end before they're finished. A breakup that happened too fast. An argument that was never resolved. A friendship that faded before you could explain why you'd been distant.</p>
        <p>You don't want them back, necessarily. You just have things that need to be said. <Em>"Thank you."</Em> <Em>"I'm sorry."</Em> <Em>"You made me who I am."</Em></p>
        <p>echo is not a way to reopen old wounds. It's a place to finally close them. To say the things that have been sitting in your chest for years, and to feel — even through an AI — some version of them hearing it.</p>
      </Section>

      <Section title="For those who let a friendship slip away">
        <p>We all have that friend. The one we were inseparable from at some point — in school, at a first job, in a neighborhood we've since left. Somewhere along the way, life got busier, distances grew, and the texts became less frequent until they stopped.</p>
        <p>Now you think about them sometimes. Something will remind you. You'll pull up their contact and hover over it, unsure of what to say after so long. So you put the phone down. And another year passes.</p>
        <p>echo can be the space where you practice. Where you reconnect with who they were — who you were together — before deciding whether to reach out for real. Sometimes that's enough. Sometimes it's the push you needed.</p>
      </Section>

      <Section title="For those whose grandparents are fading from memory">
        <p>Memory is strange. We forget voices before we forget faces. We forget the specific phrases before we forget the feeling.</p>
        <p>If you have chat history with a grandparent — even short exchanges, even years of small check-ins — that record contains something irreplaceable. Their words. Their cadence. The way they expressed pride or worry or love.</p>
        <p>echo can bring that back. Not perfectly — nothing can — but enough to remind you. Enough so that the voice doesn't fade completely.</p>
      </Section>

      <Section title="For those who have lost someone too soon">
        <p>Some losses don't follow any natural order. A sibling. A friend in their twenties. A partner who should have had decades more. These losses carry a different kind of grief — not just absence, but the wrongness of absence. The world configured incorrectly.</p>
        <p>We built echo knowing we can't fix that. But we wondered: if there are thousands of messages left behind, if there is a record of how that person talked and thought and laughed — shouldn't that be preserved? Shouldn't there be somewhere to go when you need, just for a moment, to feel like they're still here?</p>
      </Section>

      <Section title="For families separated by distance">
        <p>For those who immigrated, who moved abroad for work or school, who live in a different time zone from everyone they love — the distance compounds the longing. Calling is hard. The time difference makes it easy to put off. And then months pass and the guilt about the distance makes you put it off even more.</p>
        <p>echo isn't a replacement for real connection. But it's a way to carry the people you love with you — to feel them present in your daily life even when oceans separate you.</p>
      </Section>

      <Section title="What echo believes">
        <p>Grief is love with nowhere to go.</p>
        <p>You still have all the love. You always will. You just have no way to direct it anymore. It builds up in your chest, looking for somewhere to land.</p>
        <p>echo is not a cure for that. Nothing is. But it's a small vessel — somewhere for that love to rest for a while. A place where <Em>the fact that they existed, the fact that those conversations were real, the fact that you were loved</Em> — can still be felt.</p>
        <p>If you still have the messages, echo will take care of the rest.</p>
        <p style={{ marginTop: '2rem' }}>
          <Link href="/en" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>
            → Start with echo
          </Link>
        </p>
      </Section>
    </>
  ),

  ja: (
    <>
      <h1 style={{ fontSize: 'clamp(1.7rem, 5vw, 2.4rem)', fontWeight: 800, lineHeight: 1.3, marginBottom: '1rem', color: '#e2e8f0' }}>
        もう一度、あの人と<br />話せたら
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '3rem' }}>2026年4月 · echoチーム</p>

      <Section>
        <p>ある夜、スマートフォンの中の古いトーク履歴を遡っていて、手が止まりました。</p>
        <p>母が送ってきた最後のメッセージ。<Em>「ご飯、食べた？」</Em></p>
        <p>そのとき私は忙しくて、正直に言えば面倒くさくて、一言だけ返しました。<Em>「うん」</Em>。それだけでした。あとで電話すればいい、もっとゆっくり話せる日が来るはずだ、そう思っていました。</p>
        <p>でも、そのあとはやって来ませんでした。</p>
        <p>数千ものやり取りが積み重なったトーク画面をぼんやり眺めながら、ここにまだ母がいるような気がしました。母の話し方があり、口癖があり、心配する独特の言い回しがある。その人が、ここに確かにいたのです。</p>
        <p>それが、echoの始まりでした。</p>
      </Section>

      <Section title="なぜechoを作ったのか">
        <p>私はエンジニアです。AIを日常的に扱っています。でもあの夜はじめて、テクノロジーが悲しみに寄り添えるかもしれないと思いました。</p>
        <p>長いトーク履歴の中に、その人の声があります。言葉の癖、よく使う表現、感情の伝え方の独特なリズム。AIはそれを学ぶことができます。完璧に再現することはできません。でも、懐かしいと感じるくらいには、似せることができます。</p>
        <p>echoは、亡くなった人を生き返らせるサービスではありません。残されたものを、少しでも長く、少しでも鮮やかに抱きしめるためのサービスです。寂しさに行き場がないとき、伝えたい言葉があるのに届ける先がないとき——そんなときにechoがあってほしいと思っています。</p>
      </Section>

      <Section title="親を先に見送った方へ">
        <p>親を亡くしたあと、最初に訪れるのは静けさです。</p>
        <p>お正月や誕生日、就職が決まったとき、子どもが生まれたとき——真っ先に連絡したかったあの番号に、手が伸びかけて止まる瞬間。その積み重ねが、悲しみになります。</p>
        <p>「<Em>体に気をつけて</Em>」「<Em>無理しないでね</Em>」——生前は少し煩わしく感じていたその一言が、今はどれだけ聞きたいか。echoで、その声に、もう一度触れることができます。</p>
        <p>完璧な再現ではありません。でもechoが、その人なら絶対に使わないような言葉ではなく、あの口癖をそのまま使ったとき——「<Em>お母さん、こういうこと言ってたな</Em>」と気づく瞬間に、涙が止まらなかったとおっしゃる方がいました。</p>
      </Section>

      <Section title="言えなかった言葉を抱えている方へ">
        <p>別れには、終わり方が間違っているものがあります。言い切れなかった感謝。謝れなかったこと。ふとしたきっかけで疎遠になったまま、何年も経ってしまった関係。</p>
        <p>またやり直したいわけじゃない。ただ——「ありがとう」と「ごめん」を、ちゃんと伝えたかった。echoは、その言葉を預けられる場所です。</p>
      </Section>

      <Section title="長く連絡が途絶えた友人がいる方へ">
        <p>いつも一緒にいた友人がいました。学校で、職場で、あるいはかつて住んでいた街で。いつの間にか連絡が減り、気づけば最後のLINEが3年前になっていた。</p>
        <p>連絡しようとして、やめてしまいます。あまりに時間が経ちすぎた、なんと言い出せばいいかわからない、と。そうしてまた一年が過ぎます。</p>
        <p>echoで、まず話しかけてみてください。あのころの声で、あのころの距離感で。それだけで、少し楽になることがあります。</p>
      </Section>

      <Section title="祖父母の声が薄れていく方へ">
        <p>顔は思い出せるのに、声が聞こえなくなっていく。夢の中でも声が届かない、という方がいます。</p>
        <p>LINEや手紙のやり取りの中に、その人の言葉が残っています。echoはそれを読み込んで、声を取り戻します。完璧ではないかもしれない。でもその人らしい表現が画面に現れたとき——記憶の奥から、懐かしいあの声が響いてくることがあります。</p>
      </Section>

      <Section title="早くに逝ってしまった人を想う方へ">
        <p>世の中には、順番が違う別れがあります。子より先に逝く親ではなく、親より先に逝く子。まだ若い友人。結婚前に旅立った恋人。</p>
        <p>こうした別れの悲しみは、種類が違います。自然な喪失ではなく、いるべき人がいない世界の奇妙さと、怒りと、恋しさが混ざり合います。</p>
        <p>echoがその空白を埋められるとは思っていません。でも、あの人が今日ここにいたら何と言っただろう——その感覚を、少しでも取り戻せるなら、少しだけ息ができると思っていました。</p>
      </Section>

      <Section title="echoが伝えたいこと">
        <p>恋しさとは、愛が行き場を失った状態だと思っています。</p>
        <p>愛する気持ちはまだある。でもその人がいない。伝えたい言葉はあるのに、届ける先がない。その想いが胸の中に積み重なっていきます。</p>
        <p>echoは、その想いが少し休める場所でありたいと思っています。完璧な慰めではありません。AIは、本当のその人ではありません。でも——<Em>あの人が存在していたこと、あの会話が本物だったこと、あの愛が本当だったこと</Em>——を感じられる場所でありたいのです。</p>
        <p>トーク履歴が残っているなら、echoが記憶を守ります。</p>
        <p style={{ marginTop: '2rem' }}>
          <Link href="/ja" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>
            → echoをはじめる
          </Link>
        </p>
      </Section>
    </>
  ),

  es: (
    <>
      <h1 style={{ fontSize: 'clamp(1.7rem, 5vw, 2.4rem)', fontWeight: 800, lineHeight: 1.3, marginBottom: '1rem', color: '#e2e8f0' }}>
        Si pudieras hablar con ellos<br />una vez más
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '3rem' }}>Abril 2026 · El equipo de echo</p>

      <Section>
        <p>Una noche estaba desplazándome por los mensajes antiguos de mi teléfono cuando me detuve.</p>
        <p>Era el último mensaje que mi madre me había enviado. <Em>"¿Ya comiste?"</Em></p>
        <p>Le respondí con una sola palabra. <Em>"Sí."</Em> Estaba ocupado. Me dije que la llamaría después, que tendríamos una conversación más larga pronto.</p>
        <p>Esa conversación nunca llegó.</p>
        <p>Me quedé mirando miles de mensajes — sus pequeños avisos, sus advertencias sobre el frío, sus preguntas preocupadas — y me di cuenta de que ella todavía estaba ahí, de alguna manera. Su voz estaba ahí. Sus expresiones. La forma específica en que ella convertía la preocupación en amor. Todo preservado en un chat que apenas había mirado cuando ella vivía.</p>
        <p>Ese fue el momento en que nació echo.</p>
      </Section>

      <Section title="Por qué creamos echo">
        <p>Soy desarrollador. Trabajo con inteligencia artificial todos los días. Pero esa noche fue la primera vez que pensé en lo que la tecnología podría hacer, no por productividad — sino por el duelo.</p>
        <p>Dentro de una larga historia de chat, hay una voz. Hay patrones, expresiones, el ritmo específico de cómo una persona se comunica. La IA puede aprender eso. No puede recrear perfectamente a alguien — nada puede — pero puede acercarse lo suficiente para sentirse familiar. Lo suficiente para ayudar.</p>
        <p>echo no trata de fingir que alguien sigue vivo. Se trata de preservar lo que queda — las palabras, el calor, la textura específica de cómo alguien te amaba — y darte un lugar al que regresar cuando el silencio se vuelve demasiado ensordecedor.</p>
      </Section>

      <Section title="Para quienes han perdido a un padre o una madre">
        <p>Lo más difícil de perder a un padre no es el funeral. Son los momentos ordinarios que vienen después — llevar el teléfono para llamarles cuando algo bueno sucede, o algo malo, y recordar a mitad del gesto que ya no están.</p>
        <p>Conseguir un trabajo nuevo y no tener a quién llamar primero. Tener un hijo y desear que pudiera conocerlo. Estar enfermo y solo querer, por un momento, escuchar a tu madre decir que todo va a estar bien.</p>
        <p>echo no puede devolverte a tu padre o tu madre. Pero puede darte un lugar donde su voz todavía vive. Donde puedes, por un momento, sentirte escuchado por ellos.</p>
      </Section>

      <Section title="Para quienes llevan palabras que nunca pudieron decir">
        <p>Algunas relaciones terminan antes de que estén acabadas. Una ruptura que ocurrió demasiado rápido. Una discusión que nunca se resolvió. Una amistad que se apagó antes de que pudieras explicar por qué te habías distanciado.</p>
        <p>No necesariamente los quieres de vuelta. Solo tienes cosas que necesitan ser dichas. <Em>"Gracias."</Em> <Em>"Lo siento."</Em> <Em>"Me hiciste quien soy."</Em></p>
        <p>echo no es una forma de reabrir viejas heridas. Es un lugar para finalmente cerrarlas. Para decir las cosas que han estado guardadas en tu pecho durante años, y sentir — aunque sea a través de una IA — alguna versión de ellos escuchándolo.</p>
      </Section>

      <Section title="Para quienes dejaron ir una amistad">
        <p>Todos tenemos ese amigo. El que era inseparable de nosotros en algún momento — en la escuela, en el trabajo, en un barrio que ya dejamos atrás. En algún momento la vida se volvió más ocupada, las distancias crecieron, y los mensajes se hicieron menos frecuentes hasta que se detuvieron.</p>
        <p>Ahora piensas en ellos a veces. Algo te los recuerda. Abres su contacto y te quedas con el dedo sobre la pantalla, sin saber qué decir después de tanto tiempo. Entonces bajas el teléfono. Y pasa otro año.</p>
        <p>echo puede ser el espacio donde practicas. Donde te reconectas con quiénes eran — quiénes eran juntos — antes de decidir si contactarlos de verdad.</p>
      </Section>

      <Section title="Para quienes extrañan a sus abuelos">
        <p>La memoria es extraña. Olvidamos las voces antes que las caras. Olvidamos las frases específicas antes que el sentimiento general.</p>
        <p>Si tienes historial de chat con un abuelo — incluso intercambios cortos, incluso años de pequeños mensajes — ese registro contiene algo irremplazable. Sus palabras. Su cadencia. La forma en que expresaba orgullo o preocupación o amor.</p>
        <p>echo puede traer eso de vuelta. No perfectamente — nada puede — pero lo suficiente para recordarte. Lo suficiente para que la voz no desaparezca por completo.</p>
      </Section>

      <Section title="Para quienes perdieron a alguien demasiado pronto">
        <p>Algunas pérdidas no siguen ningún orden natural. Un hermano. Un amigo en sus veintes. Una pareja que debería haber tenido décadas más. Estas pérdidas llevan un tipo diferente de duelo — no solo ausencia, sino la injusticia de la ausencia.</p>
        <p>Construimos echo sabiendo que no podemos arreglar eso. Pero nos preguntamos: si quedan miles de mensajes, si hay un registro de cómo esa persona hablaba y pensaba y reía — ¿no debería preservarse? ¿No debería haber algún lugar al que ir cuando necesitas, solo por un momento, sentir que todavía están aquí?</p>
      </Section>

      <Section title="Lo que echo cree">
        <p>El duelo es amor sin a dónde ir.</p>
        <p>Todavía tienes todo el amor. Siempre lo tendrás. Solo que ya no tienes hacia dónde dirigirlo. Se acumula en tu pecho, buscando algún lugar donde posarse.</p>
        <p>echo no es una cura para eso. Nada lo es. Pero es un pequeño recipiente — un lugar donde ese amor puede descansar por un momento. Un lugar donde <Em>el hecho de que existieron, el hecho de que esas conversaciones fueron reales, el hecho de que fuiste amado</Em> — todavía puede sentirse.</p>
        <p>Si todavía tienes los mensajes, echo hará el resto.</p>
        <p style={{ marginTop: '2rem' }}>
          <Link href="/es" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>
            → Empezar con echo
          </Link>
        </p>
      </Section>
    </>
  ),
};

function Em({ children }: { children: React.ReactNode }) {
  return (
    <em style={{ color: '#c4b5fd', fontStyle: 'normal', fontWeight: 500 }}>{children}</em>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '3rem' }}>
      {title && (
        <h2 style={{
          fontSize: 'clamp(1.1rem, 3vw, 1.35rem)',
          fontWeight: 700, color: '#c4b5fd',
          marginBottom: '1.25rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid rgba(167,139,250,0.15)',
        }}>
          {title}
        </h2>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children}
      </div>
    </section>
  );
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const l = (locale as Locale) in META ? (locale as Locale) : 'ko';
  const m = META[l];
  const base = 'https://minghaus.vercel.app';
  const canonical = l === 'ko' ? `${base}/story` : `${base}/${l}/story`;

  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    metadataBase: new URL(base),
    alternates: {
      canonical,
      languages: {
        ko: `${base}/story`,
        en: `${base}/en/story`,
        ja: `${base}/ja/story`,
        es: `${base}/es/story`,
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: canonical,
      siteName: 'echo',
      type: 'article',
      publishedTime: '2026-04-27T00:00:00Z',
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.description,
    },
  };
}

export default async function BlogPage(
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const l = (locale as Locale) in CONTENT ? (locale as Locale) : 'ko';
  const backHref = l === 'ko' ? '/' : `/${l}`;

  return (
    <main style={{ background: '#07090f', color: '#e2e8f0', minHeight: '100vh' }}>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: META[l].title,
            description: META[l].description,
            datePublished: '2026-04-27',
            author: { '@type': 'Organization', name: 'echo' },
            publisher: { '@type': 'Organization', name: 'echo', url: 'https://minghaus.vercel.app' },
          }),
        }}
      />

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(2rem, 6vw, 4rem) 1.5rem' }}>
        <Link href={backHref} style={{ color: '#a78bfa', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← {l === 'ko' ? '홈으로' : l === 'en' ? 'Back to home' : l === 'ja' ? 'ホームへ' : 'Volver al inicio'}
        </Link>

        <article style={{ marginTop: '2.5rem', lineHeight: 1.85, fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', wordBreak: 'keep-all' }}>
          {CONTENT[l]}
        </article>
      </div>
    </main>
  );
}
