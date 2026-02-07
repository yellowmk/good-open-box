const conditionStyles = {
  'new': 'bg-blue-50 text-blue-700 border-blue-200',
  'like-new': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'open-box': 'bg-amber-50 text-amber-700 border-amber-200',
  'refurbished': 'bg-purple-50 text-purple-700 border-purple-200',
  'used': 'bg-gray-50 text-gray-600 border-gray-200',
}

const conditionLabels = {
  'new': 'New',
  'like-new': 'Like New',
  'open-box': 'Open Box',
  'refurbished': 'Refurbished',
  'used': 'Used',
}

export default function ConditionBadge({ condition }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded border text-[11px] font-semibold uppercase tracking-wide ${conditionStyles[condition] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {conditionLabels[condition] || condition}
    </span>
  )
}
