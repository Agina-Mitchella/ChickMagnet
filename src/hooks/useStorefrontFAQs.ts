import { useEffect, useState } from 'react';
import { INITIAL_FAQS, normalizeStoredFAQs } from '../data/faqs';

const CMS_STORAGE_KEY = 'chickmagnet_cms_blocks';

function readStoredFAQs() {
  try {
    const rawBlocks = window.localStorage.getItem(CMS_STORAGE_KEY);
    if (!rawBlocks) return INITIAL_FAQS;
    const blocks = JSON.parse(rawBlocks);
    if (!Array.isArray(blocks)) return INITIAL_FAQS;
    const faqBlock = blocks.find(block => block?.id === 'faqs_data_json');
    if (typeof faqBlock?.value !== 'string') return INITIAL_FAQS;
    return normalizeStoredFAQs(JSON.parse(faqBlock.value));
  } catch {
    return INITIAL_FAQS;
  }
}

export function useStorefrontFAQs() {
  const [faqs, setFaqs] = useState(INITIAL_FAQS);

  useEffect(() => {
    const handleUpdate = () => setFaqs(readStoredFAQs());
    handleUpdate();
    window.addEventListener('sol_cms_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sol_cms_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return faqs;
}
