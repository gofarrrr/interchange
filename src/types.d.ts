export type LineID = 'A'|'B'|'C'|'D'|'E'|'F';
export type StationID = `AI-${string}`;
export interface SearchItem { id:string; number:number; line:string; title:string; short:string; summary:string; text:string; url:string; }
export interface PreviewItem { id:string; number:number; line:string; title:string; summary:string; url:string; }
export interface PageData { base:string; preview:boolean; search:SearchItem[]; previews:PreviewItem[]; }
export interface Runtime { boot:()=>void; dispose:()=>void; }
declare global {
  interface Window {
    Interchange?:Runtime;
    __OFFLINE__?:boolean;
    __SITE_DATA__?:PageData;
    __PAGES__?:Record<string,string>;
    __NAVIGATE__?:(path:string)=>void;
  }
}
declare global {
  function rankSearch(items:SearchItem[], query:string, limit?:number):SearchItem[];
  function normaliseQuery(value:string):string;
}
