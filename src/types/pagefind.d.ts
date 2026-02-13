declare module '@pagefind/default-ui' {
  interface PagefindUIOptions {
    element: string;
    showSubResults?: boolean;
    showImages?: boolean;
  }

  export class PagefindUI {
    constructor(options: PagefindUIOptions);
  }
}
