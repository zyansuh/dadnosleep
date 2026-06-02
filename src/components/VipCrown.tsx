interface Props {
  className?: string;
}

export function VipCrown({ className }: Props) {
  return (
    <span
      className={['vip-crown', className].filter(Boolean).join(' ')}
      title="VIP 회원"
      aria-label="VIP"
    >
      👑
    </span>
  );
}
