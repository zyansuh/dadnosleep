

interface InfoItem {
  icon:  string;
  title: string;
  desc:  string;
}

const ITEMS: InfoItem[] = [
  { icon: '🕐', title: '20:00 ~ 02:00 운영',     desc: '하루의 끝, 우리만의 황금 시간대' },
  { icon: '📅', title: '고정 편성 + 랜덤 추천',   desc: '목·금은 고정, 나머지는 매일 새롭게' },
  { icon: '🔄', title: '매일 새롭게 갱신',         desc: '실시간 데이터 기반으로 매일 업데이트' },
];

export function InfoSection() {
  return (
    <section className="info-section">
      {ITEMS.map((item, i) => (
        <div key={i} className="info-item">
          <div className="info-icon">{item.icon}</div>
          <div>
            <strong>{item.title}</strong>
            <p>{item.desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
