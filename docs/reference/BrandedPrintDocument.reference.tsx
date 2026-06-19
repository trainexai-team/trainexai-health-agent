'use client'

import Image from 'next/image'
import { Printer } from 'lucide-react'
import { useMemo } from 'react'

interface BrandedPrintDocumentProps {
  title: string
  description?: string
}

export function BrandedPrintDocument({ title, description }: BrandedPrintDocumentProps) {
  const generated = useMemo(() => new Date().toLocaleString(), [])
  const reference = useMemo(() => `TX-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${String(generated.slice(-2)).padStart(2,'0')}`, [])
  return (
    <>
      <div className="print-document-header" aria-hidden="true">
        <Image src="/logo-mark.svg" alt="" width={36} height={36} />
        <div>
          <div className="print-document-brand">TRAINEXAI</div>
          <div className="print-document-title">{title}</div>
          {description && <div className="print-document-description">{description}</div>}
        </div>
        <div className="print-document-meta"><b>GENERATED</b><span>{generated}</span><b>REFERENCE</b><span>{reference}</span></div>
      </div>

      <div className="print-document-footer" aria-hidden="true">
        <span>TrainexAI</span>
        <span className="print-page-number">Private training report</span>
        <span>{reference}<br/>Share only with authorized recipients.</span>
      </div>
    </>
  )
}

export function PrintDocumentButton({ label = 'Print / Save PDF' }: { label?: string }) {
  return (
    <button type="button" className="print-document-button no-print" onClick={() => window.print()}>
      <Printer size={14} />
      {label}
    </button>
  )
}
