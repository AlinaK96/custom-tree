import { ConfigName } from './config-name.model';

export interface Config {
  id: ConfigName;
  rtl?: boolean;
  name: string;
  imgSrc: string;
  layout: 'vertical' | 'horizontal';
  boxed: boolean;
  sidenav: {
    title: string;
    imgTitleUrl?: string;
    imageUrl: string;
    showCollapsePin: boolean;
    state: 'expanded' | 'collapsed';
  };
  toolbar: {
    fixed: boolean;
    brand?: string;
  };
  navbar: {
    position: 'below-toolbar' | 'in-toolbar';
  };
  footer: {
    visible: boolean;
    fixed: boolean;
  };
}
