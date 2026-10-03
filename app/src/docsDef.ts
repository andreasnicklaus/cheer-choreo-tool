export interface MetaElement {
  name: string;
  content: string;
  vmid?: string;
}

export interface MetaInfo {
  titleTemplate?: string;
  title?: string;
  meta?: MetaElement[];
  link?: MetaElement[];
}
