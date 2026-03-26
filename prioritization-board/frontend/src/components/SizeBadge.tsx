interface Props {
  size: string
}

export default function SizeBadge({ size }: Props) {
  return (
    <span className={`size-badge size-${size}`}>{size}</span>
  )
}
