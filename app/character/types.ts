// types.ts
export interface MarvelCharacter {
    id: number;
    name: string;
    thumbnail: {
      path: string;
      extension: string;
    };
    description: string;
  }
  