export const cn=(...v:(string|false|null|undefined)[])=>v.filter(Boolean).join(' ');
export const today=()=>new Date().toISOString().slice(0,10);
