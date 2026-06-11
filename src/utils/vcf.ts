export interface VCardData {
  first_name: string;
  last_name: string;
  job_title?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  address?: string | null;
  profile_image_url?: string | null;
}

/**
 * Genera una cadena de texto en formato vCard (VCF 3.0) basada en los datos provistos.
 * Escapa caracteres especiales de acuerdo a la especificación RFC 2426.
 */
export function generateVCF(vcard: VCardData): string {
  const clean = (val: string | null | undefined) => {
    if (!val) return '';
    return val
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n')
      .trim();
  };

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${clean(vcard.last_name)};${clean(vcard.first_name)};;;`,
    `FN:${clean(vcard.first_name)} ${clean(vcard.last_name)}`.trim(),
  ];

  if (vcard.company) {
    lines.push(`ORG:${clean(vcard.company)}`);
  }
  
  if (vcard.job_title) {
    lines.push(`TITLE:${clean(vcard.job_title)}`);
  }
  
  if (vcard.email) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK,PREF:${clean(vcard.email)}`);
  }
  
  if (vcard.phone) {
    lines.push(`TEL;TYPE=CELL,VOICE,PREF:${clean(vcard.phone)}`);
  }
  
  if (vcard.whatsapp) {
    lines.push(`TEL;TYPE=CELL,VOICE,whatsapp:${clean(vcard.whatsapp)}`);
  }
  
  if (vcard.website) {
    lines.push(`URL;TYPE=WORK:${clean(vcard.website)}`);
  }
  
  if (vcard.address) {
    lines.push(`ADR;TYPE=WORK,PREF:;;${clean(vcard.address)};;;;`);
  }
  
  if (vcard.profile_image_url) {
    lines.push(`PHOTO;VALUE=URL:${vcard.profile_image_url.trim()}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}
