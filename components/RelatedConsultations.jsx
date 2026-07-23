/** @jsxImportSource theme-ui */
'use client';

import React from 'react';
import AnchorTag from './AnchorTag';

function RelatedConsultations({ consultations = [], popups = {}, noPopups = false }) {
  if (consultations.length === 0) return null;

  return (
    <details className="related-consultations">
      <summary>ข้อหารือที่เกี่ยวข้อง</summary>
      <p className="related-consultations-hint">เลือกรายการเพื่อดูรายละเอียดข้อหารือ</p>
      <div className="related-consultations-list">
        {consultations.map((consultation) => (
          <article className="consultation-card" key={consultation.slug}>
            <strong>
              <AnchorTag
                href={`/${consultation.slug}`}
                popups={popups}
                noPopups={noPopups}
              >
                {consultation.title}
              </AnchorTag>
            </strong>
            {consultation.excerpt && <p>{consultation.excerpt}</p>}
          </article>
        ))}
      </div>
    </details>
  );
}

export default React.memo(RelatedConsultations);
